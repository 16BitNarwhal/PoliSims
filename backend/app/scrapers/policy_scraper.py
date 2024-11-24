import aiohttp
import certifi
import ssl
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class PolicyScraper:
    """Simple scraper for Canadian Parliamentary bills using the OpenParliament API."""

    def __init__(self):
        self.base_url = "https://api.openparliament.ca/bills"
        self.session = None
        self.headers = {
            "Accept": "application/json",
            "User-Agent": "PoliSims/1.0 (contact@polisims.ca)",
        }

    async def __aenter__(self):
        if not self.session:
            ssl_context = ssl.create_default_context(cafile=certifi.where())
            connector = aiohttp.TCPConnector(ssl=ssl_context)
            self.session = aiohttp.ClientSession(
                connector=connector,
                headers=self.headers
            )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
            self.session = None

    async def get_current_bills(self) -> Optional[Dict]:
        """Get list of current bills from OpenParliament API."""
        try:
            if not self.session:
                await self.__aenter__()

            params = {
                "format": "json",
                "limit": "10000"
            }
            async with self.session.get(self.base_url, params=params) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"API request failed with status {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error fetching bills: {str(e)}")
            return None
