from typing import Dict, List
import json
import random

from groq import Groq

industries = ["Lumber", "Banking", "Fishing", "Gasoline", "Tech", "Insurance", "Grocery", "Transportation"]

class Agent:
    def __init__(self, id: int, about: Dict):
        self.id = id
        self.industry = about["industry"]
        self.unemployment = about["unemployment"]
        self.position = about["position"]
        self.affected_industries = []

    def talk_to_llama(self, client: Groq, prompt: str):
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-70b-versatile",
        )

        response = response.choices[0].message.content
        response = response.replace('```', '').strip()

        return response


    # def generate_opinion(self, bill: str) -> Dict:
    #     prompt = f"""
    #     You are a {self.age} year old who lives in {self.location} with an income of ${self.income}. 
    #     You are a {self.profession} and you have {self.political_preference} political views.

    #     Given this bill that has just been passed by the Canadian government: {bill},

    #     Provide your opinion and expected impact on your life in the following JSON format:
    #         "opinion": "detailed opinion here",
    #         "support_level": <number between -100 and 100>,
    #         "expected_income_change_percent": <number>,
    #         "happiness_impact": <number between -100 and 100>,
        
    #     Only output the JSON - No need to explain support level, expected income, or happiness impact.
        
    #     """

    #     response = self.talk_to_llama(prompt)

    #     try:
    #         result = json.loads(response)
    #         self.happiness = max(
    #             0, min(100, self.happiness + result["happiness_impact"] * 0.1)
    #         )
    #         self.income *= 1 + result["expected_income_change_percent"] / 100
    #         return result
    #     except (json.JSONDecodeError, KeyError):
    #         return {
    #             "opinion": "Error processing response.",
    #             "support_level": 0,
    #             "expected_income_change_percent": 0,
    #             "happiness_impact": 0,
    #         }

    def 
        
    def generate_affected_industries(self, bill: str):
        """
        First function to be called.
        This will generate the primarily affected industry.
        Then, it will generate the 3 affected industries and send them messages.
        """
        prompt = f"""
Given this bill that has just been passed: {bill}, 
Provide a list of 3 industries from this list of industries: {industries} that have been affected 

        """

    def generate_message_response(self, chat_history: List):
        """
        Agent receives a message (update) from another industry.
        """
        pass





class PolicySimulation:
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.agents: List[Agent] = []

    def create_diverse_population(self, num_agents: int):
        for i in range(num_agents):
            about = {
                "age": random.randint(18, 85),
                "location": "Toronto, ON",
                "income": random.randint(20000, 200000),
                "profession": "software engineer",
                "political_preference": random.choice(
                    ["conservative", "moderate", "liberal"]
                ),
            }
            self.agents.append(Agent(i, about))

    def simulate_bill_impact(self, bill_text: str) -> Dict:
        results = []
        total_support = 0
        avg_happiness_change = 0
        avg_income_change = 0

        for agent in self.agents:
            opinion = agent.generate_opinion(self.client, bill_text)
            results.append(
                {
                    "agent_id": agent.id,
                    "about": {
                        "age": agent.age,
                        "location": agent.location,
                        "income": agent.income,
                        "profession": agent.profession,
                        "political_preference": agent.political_preference,
                    },
                    "response": opinion,
                }
            )

            total_support += opinion["support_level"]
            avg_happiness_change += opinion["happiness_impact"]
            avg_income_change += opinion["expected_income_change_percent"]

        num_agents = len(self.agents)
        return {
            "overall_support": total_support / num_agents,
            "avg_happiness_impact": avg_happiness_change / num_agents,
            "avg_income_change": avg_income_change / num_agents,
            "detailed_results": results,
        }



