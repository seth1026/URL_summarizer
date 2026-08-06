import subprocess
import os
import sys

def main():
    # Start the BullMQ worker in the background
    worker_process = subprocess.Popen([sys.executable, "-m", "workers.summarizer"])
    
    # Start the FastAPI uvicorn server in the foreground
    port = os.environ.get("PORT", "8000")
    os.execvp("uvicorn", ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", port])

if __name__ == "__main__":
    main()
