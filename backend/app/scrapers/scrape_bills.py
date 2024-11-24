import aiohttp
import asyncio
import json
from typing import Dict, Optional
import logging
import ssl
import certifi

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def fetch_bill_details(
    session: aiohttp.ClientSession, base_url: str, bill_url: str
) -> Optional[Dict]:
    """Fetch details for a specific bill."""
    url = f"{base_url}{bill_url}"
    try:
        async with session.get(url) as response:
            if response.status == 200:
                return await response.json()
            else:
                logger.error(f"Failed to fetch bill at {url}: Status {response.status}")
                return None
    except Exception as e:
        logger.error(f"Error fetching bill at {url}: {str(e)}")
        return None


async def main():
    base_url = "https://api.openparliament.ca"
    headers = {
        "Accept": "application/json",
        "User-Agent": "PoliSims/1.0 (contact@polisims.ca)",
    }

    # Create SSL context
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    connector = aiohttp.TCPConnector(ssl=ssl_context)

    async with aiohttp.ClientSession(headers=headers, connector=connector) as session:
        # Fetch list of all bills
        params = {"format": "json", "limit": "1000"}

        try:
            async with session.get(f"{base_url}/bills/", params=params) as response:
                if response.status != 200:
                    logger.error(
                        f"Failed to fetch bills list: Status {response.status}"
                    )
                    return

                response_json = await response.json()
                bills = response_json.get("objects", [])
                logger.info(f"Found {len(bills)} bills")

                with open("bills_data.txt", "w", encoding="utf-8") as f:
                    passed_bills = 0
                    for i, bill in enumerate(bills):
                        try:
                            if isinstance(bill, str):
                                logger.error(
                                    f"Unexpected string instead of object: {bill}"
                                )
                                continue

                            bill_url = bill.get("url", "")
                            session_info = bill.get("session", "")
                            introduced = bill.get("introduced", "")
                            name = bill.get("name", {})
                            name = name.get("en", "") if isinstance(name, dict) else ""
                            bill_number = bill.get("number", "")

                            # Fetch additional details for the law status
                            if bill_url:
                                details = await fetch_bill_details(
                                    session, base_url, bill_url
                                )
                                law = details.get("law", False) if details else False

                                # Only write bills that became law
                                if not law:
                                    passed_bills += 1
                                    f.write(f"Bill Number: {bill_number}\n")
                                    f.write(f"Session: {session_info}\n")
                                    f.write(f"Introduced: {introduced}\n")
                                    f.write(f"Name: {name}\n")
                                    f.write(f"Law: {law}\n")
                                    f.write("-" * 50 + "\n")  # Separator between bills

                                    logger.info(
                                        f"Successfully processed passed bill {bill_number} from session {session_info}"
                                    )
                            else:
                                logger.warning(
                                    f"Missing bill URL for bill {bill_number}"
                                )

                        except Exception as e:
                            logger.error(f"Error processing bill {i}: {str(e)}")
                            continue

                    logger.info(f"Total bills that became law: {passed_bills}")

        except Exception as e:
            logger.error(f"Error in main process: {str(e)}")
            if hasattr(e, "response_text"):
                logger.error(f"Response text: {e.response_text}")


if __name__ == "__main__":
    asyncio.run(main())
