from fastapi import APIRouter, HTTPException
from typing import Dict, List
import logging
from app.scrapers.policy_scraper import PolicyScraper

logger = logging.getLogger(__name__)
router = APIRouter(prefix="")  # Empty prefix to maintain original URLs

# Initialize components
policy_scraper = PolicyScraper()


@router.get("/bills", response_model=List[Dict])
async def get_current_bills():
    """Get list of current bills in Parliament."""
    try:
        # Remove async context manager since PolicyScraper doesn't support it
        response = await policy_scraper.get_current_bills()
        if not response:
            raise HTTPException(
                status_code=503,
                detail="Unable to fetch bills data. Please try again later.",
            )
        return response
    except Exception as e:
        logger.error(f"Error in /bills: {str(e)}")
        raise HTTPException(
            status_code=500, detail="An error occurred while processing your request."
        )


@router.get("/bills/{bill_number}", response_model=Dict)
async def get_bill_details(bill_number: str):
    """Get detailed information about a specific bill."""
    try:
        # Remove async context manager since PolicyScraper doesn't support it
        details = await policy_scraper.get_bill_details(bill_number)
        if not details:
            raise HTTPException(
                status_code=404,
                detail=f"Bill {bill_number} not found or unable to fetch details.",
            )
        return details
    except Exception as e:
        logger.error(f"Error in /bills/{bill_number}: {str(e)}")
        raise HTTPException(
            status_code=500, detail="An error occurred while processing your request."
        )
