import os
import json
from google import genai
from google.genai import types

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set")
    return genai.Client(api_key=api_key)

def extract_report_data(file_bytes: bytes, mime_type: str) -> dict:
    client = get_gemini_client()
    
    prompt = """
    You are an expert medical data extractor. Analyze this medical report and extract the information into a structured JSON format EXACTLY matching this schema:
    {
      "patient": {
        "name": "Extract if present, else empty string",
        "age": 0 (integer if present, else null),
        "gender": "Extract if present, else empty string"
      },
      "report_date": "YYYY-MM-DD or empty string",
      "parameters": [
        {
          "name": "e.g. HbA1c",
          "value": 0.0 (float/int),
          "unit": "e.g. %",
          "reference_range": "e.g. 4.0 - 5.6",
          "status": "within_range|above_range|below_range|unknown"
        }
      ]
    }
    
    Rules:
    1. Do not invent values. If a value is not in the report, use null for numbers or empty string for text.
    2. Determine 'status' based on the value and reference range if possible.
    3. Return ONLY valid JSON, without any markdown formatting like ```json or anything else. Just the raw JSON object.
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
            prompt
        ]
    )
    
    text = response.text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.endswith("```"):
        text = text[:-3]
    
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        print("Failed to decode JSON from Gemini:", text)
        return {}

def generate_health_summary(structured_data: dict) -> dict:
    client = get_gemini_client()
    
    prompt = f"""
    You are mediExplain AI, a helpful, patient-friendly AI companion.
    Based on the following structured medical report data, generate a comprehensive summary, a voice script, and a personalized lifestyle plan.
    
    Data: {json.dumps(structured_data, indent=2)}
    
    Your output MUST be in the following exact format:
    
    [START_SUMMARY]
    <Write the highly structured, beautiful markdown string here. Include headers like '### 📊 Overall Health Status', '### ⚠️ Key Findings', and '### 💡 Actionable Advice'. Use bold text and emojis.>
    [END_SUMMARY]
    
    [START_LIFESTYLE]
    {{
      "sleep_cycle": "<Specific sleep cycle recommendations (hours, timings, habits) directly aimed at aiding recovery for the specific health issues in this report>",
      "food_habits": "<Specific daily food habits (e.g., portion control, timing of meals) to help reduce the issues found in this report>",
      "diet": "<List SPECIFIC foods to eat and SPECIFIC foods to avoid that will directly help reduce or recover from the specific anomalies (like high blood sugar, high cholesterol) found in this report>",
      "exercises": "<List SPECIFIC exercises or workout routines that are best suited to help reduce or recover from the specific health issues identified in this report>"
    }}
    [END_LIFESTYLE]
    
    [START_VOICE]
    <Write a conversational explanation here in a mix of simple English and native Tamil (using Tamil script / font). Explain the report as if you are a friendly doctor talking to the patient. Example: 'வணக்கம்! உங்க blood test report நான் பாத்துட்டேன்...'>
    [END_VOICE]
    
    SAFETY RULES:
    - NEVER diagnose.
    - NEVER say "You have X disease".
    - Use phrases like "This value is above the normal range" or "Consider discussing this with your doctor."
    - The [START_LIFESTYLE] section MUST be valid JSON.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        
        text = response.text.strip()
        
        # Parse using the delimiters
        summary_markdown = "Failed to generate summary."
        voice_script = "Sorry, I could not generate the voice explanation."
        lifestyle_plan = {}
        
        if "[START_SUMMARY]" in text and "[END_SUMMARY]" in text:
            summary_markdown = text.split("[START_SUMMARY]")[1].split("[END_SUMMARY]")[0].strip()
            
        if "[START_LIFESTYLE]" in text and "[END_LIFESTYLE]" in text:
            lifestyle_text = text.split("[START_LIFESTYLE]")[1].split("[END_LIFESTYLE]")[0].strip()
            if lifestyle_text.startswith("```json"):
                lifestyle_text = lifestyle_text[7:]
            if lifestyle_text.endswith("```"):
                lifestyle_text = lifestyle_text[:-3]
            try:
                lifestyle_plan = json.loads(lifestyle_text.strip())
            except Exception as e:
                print(f"Error parsing lifestyle JSON: {e}")
                
        if "[START_VOICE]" in text and "[END_VOICE]" in text:
            voice_script = text.split("[START_VOICE]")[1].split("[END_VOICE]")[0].strip()
            
        return {
            "summary_markdown": summary_markdown,
            "voice_script": voice_script,
            "lifestyle_plan": lifestyle_plan
        }
    except Exception as e:
        print(f"Error generating summary: {e}")
        return {
            "summary_markdown": "Failed to generate summary due to an error.",
            "voice_script": "Sorry, I could not generate the voice explanation.",
            "lifestyle_plan": {}
        }

def ask_toe(question: str, history_data: list, chat_history: list = None) -> str:
    client = get_gemini_client()
    
    prompt = f"""
    Your name is Toe. You are a highly accurate medical report assistant.
    The user is asking you a question. You MUST answer their question based ONLY on the following historical medical reports.
    If the answer cannot be found in the provided medical reports, you MUST clearly state: "I don't have that information in your reports."
    DO NOT guess. DO NOT hallucinate. Keep your answers concise, empathetic, and professional.

    === USER MEDICAL HISTORY ===
    {json.dumps(history_data, indent=2)}
    ============================

    """
    
    if chat_history:
        prompt += f"=== PREVIOUS CHAT HISTORY ===\n{json.dumps(chat_history, indent=2)}\n============================\n\n"
        
    prompt += f"User Question: {question}"
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Error in ask_toe: {e}")
        return "Sorry, I am currently experiencing a system error."
