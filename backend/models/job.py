from sqlalchemy import Column, String, DateTime, Text, Enum as SQLEnum
from sqlalchemy.sql import func
import enum
import uuid

from database import Base

class JobStatus(str, enum.Enum):
    PENDING = "PENDING"
    FETCHING = "FETCHING"
    EXTRACTING = "EXTRACTING"
    SUMMARIZING = "SUMMARIZING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    url = Column(String, nullable=False)
    status = Column(SQLEnum(JobStatus), default=JobStatus.PENDING)
    summary = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
