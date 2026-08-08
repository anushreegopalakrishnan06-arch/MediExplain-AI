import sqlite3
import json
import os

DB_NAME = "healthlens.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Create Reports Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        extracted_text TEXT,
        structured_data TEXT,
        summary TEXT
    )
    ''')
    
    try:
        cursor.execute('ALTER TABLE reports ADD COLUMN voice_script TEXT')
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()

def save_report(filename: str, extracted_text: str = "", structured_data: dict = None, summary: str = "", voice_script: str = ""):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    struct_str = json.dumps(structured_data) if structured_data else "{}"
    
    cursor.execute('''
    INSERT INTO reports (filename, extracted_text, structured_data, summary, voice_script)
    VALUES (?, ?, ?, ?, ?)
    ''', (filename, extracted_text, struct_str, summary, voice_script))
    
    report_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return report_id

def get_report(report_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, filename, upload_date, extracted_text, structured_data, summary, voice_script FROM reports WHERE id = ?', (report_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row[0],
            "filename": row[1],
            "upload_date": row[2],
            "extracted_text": row[3],
            "structured_data": json.loads(row[4]) if row[4] else {},
            "summary": row[5],
            "voice_script": row[6] if len(row) > 6 and row[6] is not None else ""
        }
    return None

def get_all_reports():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, filename, upload_date FROM reports ORDER BY upload_date DESC')
    rows = cursor.fetchall()
    conn.close()
    
    reports = []
    for row in rows:
        reports.append({
            "id": row[0],
            "filename": row[1],
            "upload_date": row[2]
        })
    return reports

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
