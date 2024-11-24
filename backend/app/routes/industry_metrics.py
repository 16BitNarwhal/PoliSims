from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import groq
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="")  # Empty prefix to maintain original URLs

class IndustryRequest(BaseModel):
    industry: str


class IndustryMetrics(BaseModel):
    average_income: float
    employment_rate: float
    growth_rate: float
    job_satisfaction: float


@router.post("/industry-metrics", response_model=IndustryMetrics)
async def get_industry_metrics(request: IndustryRequest):
    try:
        client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))

        # Construct the prompt for Groq
        prompt = f"""You are a data analysis system that ONLY outputs numbers. For the {request.industry} industry, output exactly 4 numbers in this format:

        [average annual income in CAD], [employment rate], [growth rate], [job satisfaction out of 10]

        CRITICAL RULES:
        - Output ONLY 4 numbers separated by commas (e.g., 75000,95.5,4.2,8.1)
        - NO text explanations
        - NO currency symbols
        - NO % symbols
        - NO disclaimers about data accuracy
        - Round all numbers to 1 decimal place
        - If exact data is not known, provide reasonable estimates based on industry trends
        
        Example correct response:
        75000.0,92.3,4.7,8.1

        Example incorrect responses:
        - "The average income is 75000" (No text allowed)
        - "I don't have exact data" (Must provide estimates)
        - "$75,000, 92.3%, 4.7%, 8.1" (No symbols allowed)"""

        # Make the API call
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-70b-versatile",
            temperature=0.1,
        )

        # Parse the response
        response = chat_completion.choices[0].message.content
        metrics = [float(x.strip()) for x in response.split(",")]

        return IndustryMetrics(
            average_income=metrics[0],
            employment_rate=metrics[1],
            growth_rate=metrics[2],
            job_satisfaction=metrics[3],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
