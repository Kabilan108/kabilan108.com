from pydantic import BaseModel, Field, computed_field, field_serializer, field_validator
from botocore.exceptions import ClientError
import boto3

from datetime import datetime
from config import settings


class Object(BaseModel):
    key: str = Field(alias="Key")
    last_modified: datetime = Field(alias="LastModified")
    etag: str = Field(alias="ETag")
    size: int = Field(alias="Size")
    storage_class: str = Field(alias="StorageClass")

    @computed_field
    def url(self) -> str:
        return f"{settings.R2_PUBLIC_URL}/{self.key}"

    @field_serializer("last_modified")
    def serialize_datetime(self, dt: datetime, _info):
        return dt.isoformat()

    @field_validator("etag")
    def strip_etag_quotes(cls, v: str) -> str:
        return v.strip('"')

    @field_serializer("size")
    def serialize_size(self, size: int, _info):
        for unit in ["B", "KB", "MB", "GB", "TB"]:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} PB"


# Initialize boto3 client for Cloudflare R2
r2_client = boto3.client(
    "s3",
    endpoint_url=settings.R2_ENDPOINT_URL,
    aws_access_key_id=settings.R2_ACCESS_KEY_ID,
    aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
    region_name="auto",
)

BUCKET_NAME = settings.R2_BUCKET_NAME


def list_objects() -> list[str]:
    """list all objects in the R2 bucket."""
    try:
        response = r2_client.list_objects_v2(Bucket=BUCKET_NAME)
        return [Object(**item) for item in response.get("Contents", [])]
    except ClientError as e:
        raise e


def upload_object(key: str, data: bytes) -> None:
    """Upload an object to the R2 bucket."""
    try:
        r2_client.put_object(Bucket=BUCKET_NAME, Key=key, Body=data)
    except ClientError as e:
        raise e


def download_object(key: str) -> bytes:
    """Download an object from the R2 bucket."""
    try:
        response = r2_client.get_object(Bucket=BUCKET_NAME, Key=key)
        return response["Body"].read()
    except ClientError as e:
        raise e


def delete_object(key: str) -> None:
    """Delete an object from the R2 bucket."""
    try:
        r2_client.delete_object(Bucket=BUCKET_NAME, Key=key)
    except ClientError as e:
        raise e
