from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()

# Groq
import os
from groq import Groq
groqClient = Groq(api_key=os.getenv("GROQ_API"))

class Chat(BaseModel):
    message: list

@router.post('/chat')
async def sendChat(body: Chat):
    message = groqClient.chat.completions.create(messages=body.message, model="llama3-70b-8192")

    return { 'response': message.choices[0].message.content }