from pydantic import BaseModel

from fastapi import APIRouter

router = APIRouter()


class Check(BaseModel):
    message: str

# Check the company
from utils import vectorDatabase

@router.post("/check")
async def checkCompany(body: Check):    
    document, score = vectorDatabase.retrieveQuery(body.message)

    if(score > 0.5):
        return { 'company': document.metadata }

    return { 'company': None }