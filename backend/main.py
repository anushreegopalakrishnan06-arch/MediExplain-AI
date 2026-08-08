from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from database import init_db, save_report, get_report, get_all_reports
from ai_service import extract_report_data, generate_health_summary

load_dotenv()
init_db()

app = FastAPI(title="HealthLens AI API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to HealthLens AI API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/reports/upload")
async def upload_report(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/") and file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF or Image.")
    
    try:
        contents = await file.read()
        
        # 1. Parse Data with Gemini
        structured_data = extract_report_data(contents, file.content_type)
        
        # 2. Generate Summary with Gemini
        ai_response = generate_health_summary(structured_data)
        summary_markdown = ai_response.get("summary_markdown", "Failed to generate summary.")
        voice_script = ai_response.get("voice_script", "")
        
        # 3. Save to Database
        report_id = save_report(
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
def list_reports():
    return get_all_reports()

@app.get("/api/reports/{report_id}")
def get_report_details(report_id: int):
    report = get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
