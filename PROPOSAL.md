# Architecture Proposal

> Fill this out and commit it by **Friday, July 24 · 11:59 PM IST**. This file *is*
> your Ideation-Phase submission — no separate form. Keep it living; update it as
> your design evolves.

- **Team name:** _AI RANGERS_
- **Team code:** _TEAM-290_
- **Track:** _AI for Good Health & Well-being_
- **Members:** _Anushree G (anushreegopalakrishnan06-arch), HARISH R (HARISH19819), Kamaladharshini R (kamaladharshinira ja-max) Karunya Sri V (Karunya2402)_ 

## 1. Problem
Lakshmi, a 47-year-old homemaker from Coimbatore, receives her HbA1c blood test report before her doctor's appointment. Although the report indicates whether her blood sugar level is normal or elevated, she does not understand what the HbA1c value means, how serious it is, or why it matters for her long-term health. Like many patients, she searches online for explanations and often encounters conflicting or overly technical information, increasing her anxiety instead of helping her prepare for her consultation.

Patients like Lakshmi need a trustworthy and easy-to-understand explanation of their HbA1c result before meeting their doctor so they can better understand their health and have a more meaningful consultation.

## 2. Who it helps
Primary User

Lakshmi, a 47-year-old homemaker from Coimbatore, who wants to understand her HbA1c blood test result in simple language before visiting her doctor.

Secondary User

Dr. Kumar, a physician who frequently spends consultation time explaining the basic meaning of HbA1c values before discussing diagnosis and treatment. By helping patients understand their reports beforehand, MediExplain AI enables doctors to focus on personalized treatment, lifestyle recommendations, and patient care.

## 3. Proposed solution
MediExplain AI is an AI-powered web application that helps patients understand their HbA1c blood test results in simple and clear language before consulting a doctor. Patients can upload an HbA1c report in PDF or image format, and the system uses OCR to extract the HbA1c value. Gemini AI then generates a structured explanation of what HbA1c measures, whether the value falls within the normal, prediabetic, or diabetic range, and why the result is important.

To improve reliability, the explanation is grounded in trusted diabetes guidelines and controlled through a structured prompt. The system does not provide a diagnosis, prescribe medication, or recommend treatment. It only provides educational information and clearly advises the patient to consult a qualified healthcare professional.

Based on the patient’s specific HbA1c value and category, MediExplain AI also generates one personalized question for the patient to ask during the doctor consultation. For example, a patient with a prediabetic-range result may receive a question about preventive lifestyle changes, while a patient with a diabetic-range result may receive a question about follow-up testing or treatment planning.

After the hackathon, the application can be piloted with a diagnostic laboratory by adding a QR code to printed or digital HbA1c reports. Patients can scan the code, access the application, and understand their result before meeting their doctor. The solution aims to reduce confusion, improve patient health literacy, and support more meaningful doctor-patient conversations.

## 4. High-level architecture
Patient
      │
Upload HbA1c Report
(PDF / Image)
      │
Google Vision OCR
      │
Gemini AI
(Guideline-Based Prompt)
      │
HbA1c Interpretation Engine
      │
Educational Explanation
+
Personalized Doctor Question
+
Safety Disclaimer
      │
React Web Application

## 5. Tech stack
Frontend

React.js

Backend

FastAPI (Python)

Artificial Intelligence

Gemini 2.5 Flash API

OCR

Google Vision API

Database

Firebase Firestore

Hosting

Firebase Hosting

Deployment

Google Cloud Run

Version Control

GitHub

## 6. Milestones to hackathon day
_A rough plan from now to Aug 8–9._

- [ ] …
- [ ] …

## 7. Open questions / help needed
_Anything you're unsure about or want mentor input on._
