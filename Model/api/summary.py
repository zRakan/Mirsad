from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()

# Groq
import os
from groq import Groq
groqClient = Groq(api_key=os.getenv("GROQ_API"))

class Chat(BaseModel):
    message: str

def constructSummaryPormpt(message):
    return [
        {
            "role": "system",
            "content": f"""You are a knowledgeable and efficient AI assistant specialized in summarizing company descriptions, provide concise summary.
Just provide the summary without explaination.
You shouldn't tell the user that your resposne is a summary/explaination."""
        },

        { "role": "user", "content": message }
    ]

@router.post('/summary')
async def sendChat(body: Chat):
    message = groqClient.chat.completions.create(messages=constructSummaryPormpt(body.message), model="llama3-70b-8192")

    return { 'response': message.choices[0].message.content }