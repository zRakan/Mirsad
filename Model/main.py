# Environment
from dotenv import load_dotenv
load_dotenv() # Load ".env" file

from fastapi import FastAPI

app = FastAPI()

from api import chat, check, summary

app.include_router(check.router)
app.include_router(chat.router)
app.include_router(summary.router)