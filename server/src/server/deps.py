from fastapi.security import APIKeyHeader
from fastapi import Depends, HTTPException, status

from server.config import settings

api_key_header = APIKeyHeader(name="X-api-key", auto_error=False)


def check_api_key(api_key_header: str = Depends(api_key_header)):
    if api_key_header != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid API Key"
        )
    return api_key_header
