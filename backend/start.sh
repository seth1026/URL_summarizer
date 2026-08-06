#!/bin/bash
python -m workers.summarizer &
uvicorn main:app --host 0.0.0.0 --port $PORT
