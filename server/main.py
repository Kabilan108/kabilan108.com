from fastapi import FastAPI, HTTPException, UploadFile, File
from botocore.exceptions import ClientError  # {{ add import for ClientError }}
from fastapi.responses import Response  # {{ add import for Response }}
from pydantic import BaseModel

from typing import List

from bucket import list_objects, upload_object, download_object, delete_object, Object

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Hello World"}


class UploadResponse(BaseModel):
    message: str


class DeleteResponse(BaseModel):
    message: str


@app.get("/r2/objects", response_model=List[Object])
def get_objects():
    """Retrieve a list of all objects in the R2 bucket."""
    try:
        objects = list_objects()
        return objects
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/r2/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload a file to the R2 bucket."""
    try:
        content = await file.read()
        upload_object(file.filename, content)
        return UploadResponse(message="File uploaded successfully.")
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/r2/download/{object_key}")
def download_file(object_key: str):
    """Download a file from the R2 bucket."""
    try:
        data = download_object(object_key)
        return Response(content=data, media_type="application/octet-stream")
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/r2/delete/{object_key}", response_model=DeleteResponse)
def delete_file(object_key: str):
    """Delete a file from the R2 bucket."""
    try:
        delete_object(object_key)
        return DeleteResponse(message="File deleted successfully.")
    except ClientError as e:
        raise HTTPException(status_code=500, detail=str(e))
