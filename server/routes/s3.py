from fastapi import APIRouter, HTTPException, Response, UploadFile, File
from botocore.exceptions import ClientError

from bucket import list_objects, upload_object, download_object, delete_object
from schema import ServerResponse

router = APIRouter(prefix="/s3", tags=["s3"])


@router.get("/objects", response_model=ServerResponse)
def get_objects() -> dict:
    """Retrieve a list of all objects in the R2 bucket."""
    try:
        objects = list_objects()
        return {
            "data": objects,
        }
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload", response_model=ServerResponse)
async def upload_file(
    file: UploadFile = File(...), key: str | None = None
) -> dict:
    """Upload a file to the R2 bucket."""
    try:
        content = await file.read()
        object_key = key if key is not None else file.filename
        upload_object(object_key, content)
        return {
            "message": f"File uploaded successfully as {object_key}.",
        }
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{object_key}")
def download_file(object_key: str) -> Response:
    """Download a file from the R2 bucket."""
    try:
        data = download_object(object_key)
        return Response(content=data, media_type="application/octet-stream")
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{object_key}", response_model=ServerResponse)
def delete_file(object_key: str) -> dict:
    """Delete a file from the R2 bucket."""
    try:
        delete_object(object_key)
        return {
            "message": "File deleted successfully.",
        }
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))
