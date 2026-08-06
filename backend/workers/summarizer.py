import asyncio
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from bullmq import Worker, Job as BullJob
from urllib.parse import urlparse

from database import SessionLocal
from models.job import Job, JobStatus
from services.extractor import fetch_url, extract_text
from services.llm import summarize_text

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

async def process_job(bull_job: BullJob, job_token: str):
    data = bull_job.data
    job_id = data.get("job_id")
    url = data.get("url")

    db = SessionLocal()
    try:
        # Fetch DB job
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            print(f"Job {job_id} not found in DB")
            return
            
        print(f"Processing job {job_id} for URL {url}")
        
        # 1. Fetching
        job.status = JobStatus.FETCHING
        db.commit()
        
        content, content_type = await fetch_url(url)
        
        # 2. Extracting
        job.status = JobStatus.EXTRACTING
        db.commit()
        
        text = extract_text(content, content_type)
        if not text.strip():
            raise Exception("No text could be extracted from the URL.")
            
        # 3. Summarizing
        job.status = JobStatus.SUMMARIZING
        db.commit()
        
        summary = await summarize_text(text)
        
        # 4. Completed
        job.status = JobStatus.COMPLETED
        job.summary = summary
        db.commit()
        
        print(f"Job {job_id} completed successfully")
        
    except Exception as e:
        print(f"Job {job_id} failed: {e}")
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            db.commit()
    finally:
        db.close()

async def main():
    redis_opts = get_redis_opts()
    print("Starting BullMQ Worker...")
    worker = Worker("summarize_queue", process_job, {"connection": redis_opts})
    
    try:
        while True:
            await asyncio.sleep(1)
    except (asyncio.CancelledError, KeyboardInterrupt):
        pass
    finally:
        print("Shutting down worker...")
        await worker.close()

if __name__ == "__main__":
    asyncio.run(main())
