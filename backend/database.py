import sqlite3
import json
import os

DB_NAME = "healthlens.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Create Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

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
        
    try:
        cursor.execute('ALTER TABLE reports ADD COLUMN user_id INTEGER REFERENCES users(id)')
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()

# --- User Functions ---

def create_user(email: str, password_hash: str, name: str) -> int:
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    try:
        cursor.execute('''
        INSERT INTO users (email, password_hash, name)
        VALUES (?, ?, ?)
        ''', (email, password_hash, name))
        user_id = cursor.lastrowid
        conn.commit()
        return user_id
    except sqlite3.IntegrityError:
        return None  # Email already exists
    finally:
        conn.close()

def get_user_by_email(email: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT id, email, password_hash, name FROM users WHERE email = ?', (email,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"id": row[0], "email": row[1], "password_hash": row[2], "name": row[3]}
    return None

def get_user_by_id(user_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT id, email, name FROM users WHERE id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"id": row[0], "email": row[1], "name": row[2]}
    return None

# --- Report Functions ---

def save_report(user_id: int, filename: str, extracted_text: str = "", structured_data: dict = None, summary: str = "", voice_script: str = ""):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    struct_str = json.dumps(structured_data) if structured_data else "{}"
    
    cursor.execute('''
    INSERT INTO reports (user_id, filename, extracted_text, structured_data, summary, voice_script)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, filename, extracted_text, struct_str, summary, voice_script))
    
    report_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return report_id

def get_report(report_id: int, user_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, filename, upload_date, extracted_text, structured_data, summary, voice_script FROM reports WHERE id = ? AND (user_id = ? OR user_id IS NULL)', (report_id, user_id))
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

def get_all_reports(user_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, filename, upload_date FROM reports WHERE user_id = ? OR user_id IS NULL ORDER BY upload_date DESC', (user_id,))
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

def get_all_reports_context(user_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, filename, upload_date, structured_data FROM reports WHERE user_id = ? OR user_id IS NULL ORDER BY upload_date ASC', (user_id,))
    rows = cursor.fetchall()
    conn.close()
    
    reports = []
    for row in rows:
        reports.append({
            "id": row[0],
            "filename": row[1],
            "upload_date": row[2],
            "structured_data": json.loads(row[3]) if row[3] else {}
        })
    return reports

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
