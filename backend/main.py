from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from database import init_db, save_report, get_report, get_all_reports, get_all_reports_context, create_user, get_user_by_email
from ai_service import extract_report_data, generate_health_summary, ask_toe
from pydantic import BaseModel
from typing import List, Optional
from auth import get_password_hash, verify_password, create_access_token, get_current_user_id

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]] = []

class UserRegister(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

load_dotenv()
init_db()

app = FastAPI(title="mediExplain AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to mediExplain AI API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# --- Auth Endpoints ---

@app.post("/api/auth/register")
def register(user: UserRegister):
    user_id = create_user(user.email, get_password_hash(user.password), user.name)
    if not user_id:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    access_token = create_access_token(data={"sub": str(user_id)})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user_id, "email": user.email, "name": user.name}}

@app.post("/api/auth/login")
def login(user: UserLogin):
    db_user = get_user_by_email(user.email)
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": str(db_user["id"])})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user["id"], "email": db_user["email"], "name": db_user["name"]}}

# --- Protected Endpoints ---

@app.post("/api/reports/upload")
async def upload_report(file: UploadFile = File(...), user_id: int = Depends(get_current_user_id)):
    if not file.content_type.startswith("image/") and file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF or Image.")
    
    try:
        contents = await file.read()
        structured_data = extract_report_data(contents, file.content_type)
        ai_response = generate_health_summary(structured_data)
        summary_markdown = ai_response.get("summary_markdown", "Failed to generate summary.")
        voice_script = ai_response.get("voice_script", "")
        lifestyle_plan = ai_response.get("lifestyle_plan", {})
        
        if lifestyle_plan:
            structured_data["lifestyle_plan"] = lifestyle_plan
        
        report_id = save_report(
            user_id=user_id,
            filename=file.filename,
            structured_data=structured_data,
            summary=summary_markdown,
            voice_script=voice_script
        )
        
        return {
            "status": "success",
            "report_id": report_id,
            "structured_data": structured_data,
            "summary": summary_markdown,
            "voice_script": voice_script
        }
    except Exception as e:
        print(f"Error processing report: {e}")
        raise HTTPException(status_code=500, detail="Error processing the report. Please try again.")

@app.get("/api/reports")
def list_reports(user_id: int = Depends(get_current_user_id)):
    return get_all_reports(user_id)

@app.get("/api/reports/{report_id}")
def get_report_details(report_id: int, user_id: int = Depends(get_current_user_id)):
    report = get_report(report_id, user_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.post("/api/toe/chat")
def toe_chat(req: ChatRequest, user_id: int = Depends(get_current_user_id)):
    history_data = get_all_reports_context(user_id)
    chat_history = [{"role": m.role, "content": m.content} for m in req.history] if req.history else []
    answer = ask_toe(req.question, history_data, chat_history)
    return {"answer": answer}
