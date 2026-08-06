from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse
import os
import asyncio
from urllib.parse import urlparse

from database import get_db
from models.job import Job, JobStatus
from bullmq import Queue

router = APIRouter()

def get_redis_opts():
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    parsed = urlparse(redis_url)
    opts = {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 6379,
        "db": int(parsed.path.lstrip('/')) if parsed.path and parsed.path != '/' else 0
    }
    if parsed.password:
        opts["password"] = parsed.password
    if parsed.scheme == "rediss":
        opts["ssl"] = True
    return opts

# Initialize BullMQ queue
summarize_queue = Queue("summarize_queue", {"connection": get_redis_opts()})

class JobCreate(BaseModel):
    url: str

class JobResponse(BaseModel):
    id: str
    url: str
    status: str

    class Config:
        orm_mode = True
        from_attributes = True

@router.post("/", response_model=JobResponse)
async def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    try:
        parsed_url = urlparse(job_in.url)
        if parsed_url.scheme not in ["http", "https"]:
            raise HTTPException(status_code=400, detail="Invalid URL scheme")
        
        # Create Job in DB
        new_job = Job(url=job_in.url, status=JobStatus.PENDING)
        db.add(new_job)
        db.commit()
        db.refresh(new_job)

        # Enqueue task to BullMQ
        await summarize_queue.add("process_url", {"job_id": new_job.id, "url": new_job.url})

        return new_job
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/{job_id}/stream")
async def job_stream(job_id: str, request: Request, db: Session = Depends(get_db)):
    async def event_generator():
        # Check initial state
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            yield {"event": "error", "data": "Job not found"}
            return
            
        last_status = None
        
        while True:
            # If client closes connection, stop
            if await request.is_disconnected():
                break

            # Re-fetch from DB
            db.expire(job) # ensure we get fresh data
            job = db.query(Job).filter(Job.id == job_id).first()
            
            if job and job.status != last_status:
                last_status = job.status
                data = {
                    "status": job.status,
                    "summary": job.summary,
                    "error_message": job.error_message
                }
                import json
                yield {"event": "update", "data": json.dumps(data)}
                
                if job.status in [JobStatus.COMPLETED, JobStatus.FAILED]:
                    break
                    
            await asyncio.sleep(1) # poll every 1s
            
    return EventSourceResponse(event_generator())
