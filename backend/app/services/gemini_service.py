import json
import logging
from typing import List, Optional
from app.core.config import settings
from app.schemas.ai import GeminiTriageOutput

logger = logging.getLogger("gemini_service")


class GeminiService:
    @staticmethod
    def is_configured() -> bool:
        return bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 10)

    @staticmethod
    def analyze_complaint(
        title: str,
        description: str,
        available_dept_codes: Optional[List[str]] = None
    ) -> GeminiTriageOutput:
        """
        Analyzes a complaint using Google Gemini 1.5 Flash.
        Features defensive error handling:
        If the API is missing, throttled, or encounters an error, it returns a safe fallback.
        """
        if not available_dept_codes:
            available_dept_codes = ["IT", "MAINT", "ELEC", "HOSTEL", "ACAD"]

        # If API key is not configured, return an immediate safe default
        if not GeminiService.is_configured():
            logger.info("GEMINI_API_KEY is not set. Using rule-based fallback triage.")
            return GeminiService._rule_based_fallback(title, description, available_dept_codes)

        try:
            import google.generativeai as genai

            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config={"response_mime_type": "application/json"}
            )

            prompt = f"""
You are an expert campus grievance triage system. Analyze the following grievance submitted by a student or staff member:

TITLE: {title}
DESCRIPTION: {description}

AVAILABLE DEPARTMENT CODES:
{', '.join(available_dept_codes)}

Respond strictly in valid JSON matching this schema:
{{
  "summary": "Concise 1-2 sentence summary of the core issue and location/equipment involved",
  "suggested_category": "Short category name (e.g. Electrical, Maintenance, Wi-Fi, Academic, Hostel)",
  "suggested_department_code": "One of the available department codes above, or null if uncertain",
  "confidence_score": 0.85
}}
"""
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            
            # Clean possible markdown wrapping if any
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            parsed = json.loads(raw_text.strip())
            output = GeminiTriageOutput(
                summary=parsed.get("summary", title),
                suggested_category=parsed.get("suggested_category", "General Maintenance"),
                suggested_department_code=parsed.get("suggested_department_code"),
                confidence_score=float(parsed.get("confidence_score", 0.75)),
            )

            # Ensure suggested code is valid
            if output.suggested_department_code and output.suggested_department_code not in available_dept_codes:
                output.suggested_department_code = None

            return output

        except Exception as e:
            logger.warning(f"Gemini API triage call failed: {str(e)}. Falling back safely.")
            return GeminiService._rule_based_fallback(title, description, available_dept_codes)

    @staticmethod
    def _rule_based_fallback(
        title: str,
        description: str,
        dept_codes: List[str]
    ) -> GeminiTriageOutput:
        """Deterministic keyword-based triage fallback when AI service is unavailable."""
        combined = f"{title} {description}".lower()

        if any(w in combined for w in ["wifi", "wi-fi", "internet", "computer", "lab", "portal", "login", "projector"]):
            return GeminiTriageOutput(
                summary=f"IT/connectivity issue reported: {title}",
                suggested_category="IT & Networking",
                suggested_department_code="IT" if "IT" in dept_codes else None,
                confidence_score=0.70
            )
        elif any(w in combined for w in ["light", "fan", "ac", "power", "electricity", "switch", "socket", "wire"]):
            return GeminiTriageOutput(
                summary=f"Electrical infrastructure issue: {title}",
                suggested_category="Electrical",
                suggested_department_code="ELEC" if "ELEC" in dept_codes else None,
                confidence_score=0.70
            )
        elif any(w in combined for w in ["hostel", "room", "mess", "bed", "warden", "hot water"]):
            return GeminiTriageOutput(
                summary=f"Hostel residential concern: {title}",
                suggested_category="Hostel Affairs",
                suggested_department_code="HOSTEL" if "HOSTEL" in dept_codes else None,
                confidence_score=0.70
            )
        elif any(w in combined for w in ["exam", "grade", "professor", "course", "attendance", "timetable"]):
            return GeminiTriageOutput(
                summary=f"Academic grievance: {title}",
                suggested_category="Academic",
                suggested_department_code="ACAD" if "ACAD" in dept_codes else None,
                confidence_score=0.70
            )
        else:
            return GeminiTriageOutput(
                summary=f"Campus maintenance request: {title}",
                suggested_category="General Maintenance",
                suggested_department_code="MAINT" if "MAINT" in dept_codes else None,
                confidence_score=0.55
            )
