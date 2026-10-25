import os
import uuid
import logging
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException, status
import httpx
from app.core.config import settings

logger = logging.getLogger("storage_service")

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES = {
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"],
}

# Base upload directory for local storage fallback
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))


class StorageService:
    @staticmethod
    def is_supabase_configured() -> bool:
        """Check if Supabase Storage credentials are fully configured."""
        return bool(
            settings.SUPABASE_URL
            and settings.SUPABASE_SERVICE_ROLE_KEY
            and settings.SUPABASE_STORAGE_BUCKET
            and len(settings.SUPABASE_SERVICE_ROLE_KEY.strip()) > 10
        )

    @staticmethod
    def validate_image_file(file: UploadFile) -> Tuple[bytes, str, str]:
        """
        Validates uploaded file size and content magic bytes (does not trust file extension alone).
        Returns (file_bytes, safe_extension, verified_mime_type).
        Raises HTTPException(400) if invalid.
        """
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must have a valid filename."
            )

        # Read content and enforce size limit
        file.file.seek(0)
        content = file.file.read(MAX_FILE_SIZE_BYTES + 1)
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file.filename}' exceeds maximum allowed size of 5 MB."
            )

        if len(content) < 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty or corrupted."
            )

        # Verify magic bytes
        verified_mime: Optional[str] = None
        safe_ext: Optional[str] = None

        if content.startswith(b"\xff\xd8\xff"):
            verified_mime = "image/jpeg"
            safe_ext = ".jpg"
        elif content.startswith(b"\x89PNG\r\n\x1a\n"):
            verified_mime = "image/png"
            safe_ext = ".png"
        elif content.startswith(b"RIFF") and content[8:12] == b"WEBP":
            verified_mime = "image/webp"
            safe_ext = ".webp"

        if not verified_mime or not safe_ext:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format. Only JPEG, PNG, and WebP images are permitted."
            )

        return content, safe_ext, verified_mime

    @staticmethod
    def save_image(
        complaint_id: str,
        original_filename: str,
        content: bytes,
        mime_type: str,
        safe_ext: str,
        custom_file_id: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Saves the verified image either to Supabase Storage or to local secure storage.
        Returns (storage_path_or_url, stored_file_name).
        """
        file_stem = custom_file_id if custom_file_id else uuid.uuid4().hex
        unique_file_id = f"{file_stem}{safe_ext}"
        storage_rel_path = f"complaints/{complaint_id}/{unique_file_id}"

        # If Supabase Storage is configured, upload to private bucket
        if StorageService.is_supabase_configured():
            try:
                supabase_url = settings.SUPABASE_URL.rstrip("/")
                bucket = settings.SUPABASE_STORAGE_BUCKET
                upload_endpoint = f"{supabase_url}/storage/v1/object/{bucket}/{storage_rel_path}"

                headers = {
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": mime_type,
                    "x-upsert": "true",
                }

                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(upload_endpoint, content=content, headers=headers)
                    resp.raise_for_status()

                logger.info(f"Image uploaded to Supabase Storage: {storage_rel_path}")
                # We store the storage relative path; signed URLs will be generated on access
                return storage_rel_path, unique_file_id
            except Exception as e:
                logger.error(f"Supabase Storage upload failed: {str(e)}. Falling back to local storage.")

        # Fallback: Local Secure Storage
        complaint_dir = os.path.join(UPLOAD_DIR, "complaints", complaint_id)
        os.makedirs(complaint_dir, exist_ok=True)
        local_filepath = os.path.join(complaint_dir, unique_file_id)

        with open(local_filepath, "wb") as f:
            f.write(content)

        logger.info(f"Image stored locally at {local_filepath}")
        return storage_rel_path, unique_file_id

    @staticmethod
    def get_local_file_path(storage_path: str) -> Optional[str]:
        """Resolves local absolute path for a stored relative file path."""
        abs_path = os.path.abspath(os.path.join(UPLOAD_DIR, storage_path))
        # Directory traversal prevention
        if not abs_path.startswith(UPLOAD_DIR):
            return None
        if os.path.isfile(abs_path):
            return abs_path
        return None

    @staticmethod
    def generate_signed_url(storage_path: str, expires_in_seconds: int = 3600) -> Optional[str]:
        """
        If Supabase is configured, generates a short-lived signed URL for private access.
        """
        if not StorageService.is_supabase_configured():
            return None

        try:
            supabase_url = settings.SUPABASE_URL.rstrip("/")
            bucket = settings.SUPABASE_STORAGE_BUCKET
            sign_endpoint = f"{supabase_url}/storage/v1/object/sign/{bucket}/{storage_path}"

            headers = {
                "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
            }
            body = {"expiresIn": expires_in_seconds}

            with httpx.Client(timeout=5.0) as client:
                resp = client.post(sign_endpoint, json=body, headers=headers)
                resp.raise_for_status()
                data = resp.json()
                signed_path = data.get("signedURL")
                if signed_path:
                    return f"{supabase_url}/storage/v1{signed_path}"
        except Exception as e:
            logger.warning(f"Could not generate Supabase signed URL: {e}")

        return None
