# from typing import Dict, List
# import json
# import random

# from groq import Groq

# industries = ["Lumber", "Banking", "Fishing", "Gasoline", "Tech", "Insurance", "Grocery", "Transportation"]

# class Agent:
#     def __init__(self, id: int, about: Dict):
#         self.id = id
#         self.industry = about["industry"]
#         self.unemployment = about["unemployment"]
#         self.position = about["position"]
#         self.affected_industries = []

#     def talk_to_llama(self, client: Groq, prompt: str):
#         response = client.chat.completions.create(
#             messages=[{"role": "user", "content": prompt}],
#             model="llama-3.1-70b-versatile",
#         )

#         response = response.choices[0].message.content
#         response = response.replace('```', '').strip()

#         return response


#     # def generate_opinion(self, bill: str) -> Dict:
#     #     prompt = f"""
#     #     You are a {self.age} year old who lives in {self.location} with an income of ${self.income}. 
#     #     You are a {self.profession} and you have {self.political_preference} political views.

#     #     Given this bill that has just been passed by the Canadian government: {bill},

#     #     Provide your opinion and expected impact on your life in the following JSON format:
#     #         "opinion": "detailed opinion here",
#     #         "support_level": <number between -100 and 100>,
#     #         "expected_income_change_percent": <number>,
#     #         "happiness_impact": <number between -100 and 100>,
        
#     #     Only output the JSON - No need to explain support level, expected income, or happiness impact.
        
#     #     """

#     #     response = self.talk_to_llama(prompt)

#     #     try:
#     #         result = json.loads(response)
#     #         self.happiness = max(
#     #             0, min(100, self.happiness + result["happiness_impact"] * 0.1)
#     #         )
#     #         self.income *= 1 + result["expected_income_change_percent"] / 100
#     #         return result
#     #     except (json.JSONDecodeError, KeyError):
#     #         return {
#     #             "opinion": "Error processing response.",
#     #             "support_level": 0,
#     #             "expected_income_change_percent": 0,
#     #             "happiness_impact": 0,
#     #         }

#     def 
        
#     def generate_affected_industries(self, bill: str):
#         """
#         First function to be called.
#         This will generate the primarily affected industry.
#         Then, it will generate the 3 affected industries and send them messages.
#         """
#         prompt = f"""
# Given this bill that has just been passed: {bill}, 
# Provide a list of 3 industries from this list of industries: {industries} that have been affected 

#         """

#     def generate_message_response(self, chat_history: List):
#         """
#         Agent receives a message (update) from another industry.
#         """
#         pass





# class PolicySimulation:
#     def __init__(self, api_key: str):
#         self.client = Groq(api_key=api_key)
#         self.agents: List[Agent] = []

#     def create_diverse_population(self, num_agents: int):
#         for i in range(num_agents):
#             about = {
#                 "age": random.randint(18, 85),
#                 "location": "Toronto, ON",
#                 "income": random.randint(20000, 200000),
#                 "profession": "software engineer",
#                 "political_preference": random.choice(
#                     ["conservative", "moderate", "liberal"]
#                 ),
#             }
#             self.agents.append(Agent(i, about))

#     def simulate_bill_impact(self, bill_text: str) -> Dict:
#         results = []
#         total_support = 0
#         avg_happiness_change = 0
#         avg_income_change = 0

#         for agent in self.agents:
#             opinion = agent.generate_opinion(self.client, bill_text)
#             results.append(
#                 {
#                     "agent_id": agent.id,
#                     "about": {
#                         "age": agent.age,
#                         "location": agent.location,
#                         "income": agent.income,
#                         "profession": agent.profession,
#                         "political_preference": agent.political_preference,
#                     },
#                     "response": opinion,
#                 }
#             )

#             total_support += opinion["support_level"]
#             avg_happiness_change += opinion["happiness_impact"]
#             avg_income_change += opinion["expected_income_change_percent"]

#         num_agents = len(self.agents)
#         return {
#             "overall_support": total_support / num_agents,
#             "avg_happiness_impact": avg_happiness_change / num_agents,
#             "avg_income_change": avg_income_change / num_agents,
#             "detailed_results": results,
#         }



from typing import Dict, List
import json
import random
from groq import Groq

industries = ["Lumber", "Banking", "Fishing", "Gasoline", "Tech", "Insurance", "Grocery", "Transportation"]

class Agent:
    def __init__(self, id: int, name: str, industry: str, status: str, about: Dict):
        self.id = id
        self.name = name
        self.industry = industry
        self.status = status  # 'decision_maker' or 'worker'
        self.about = about
        self.conversation_history = []
        self.most_affected_industries = []  # New member to store affected industries

    def talk_to_llama(self, client: Groq, prompt: str) -> str:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-70b-versatile",
        )
        response = response.choices[0].message.content
        response = response.replace('```', '').strip()
        return response

    def process_policy(self, client: Groq, policy: str) -> Dict:
        prompt = f"""
        You are a {self.status} in the {self.industry} industry. Given the policy: {policy},
        determine the effects on your role and industry. From the following list of industries: {industries},
        identify the 2 most affected industries. Provide the effects in JSON format:
        "impact": "description of impact",
        "affected_agents": ["industry1", "industry2"]
        ONLY RETURN THE JSON DO NOT RETURN ANYTHING OUTSIDE OF THE JSON
        """
        response = self.talk_to_llama(client, prompt)
        print(f"Response for {self.name}: {response}")  # Debug statement
        try:
            result = json.loads(response)
            self.most_affected_industries = result.get("affected_agents", [])
            return result
        except json.JSONDecodeError:
            return {"impact": "Error processing response.", "affected_agents": []}

    def converse_with_agents(self, client: Groq, agents: List['Agent'], policy: str):
        effects = self.process_policy(client, policy)
        affected_agents = self.most_affected_industries
        print(f"Affected agents for {self.name}: {affected_agents}")  # Debug statement
        for agent in agents:
            if agent.industry in affected_agents and agent.id != self.id:
                # Simulate a more realistic conversation
                conversation = []

                # Agent initiates the conversation
                prompt = f"As a {self.status} in the {self.industry} industry, the policy has forced me to make tough decisions. How has it affected you?"
                response = self.talk_to_llama(client, prompt)
                conversation.append(f"{self.name} ({self.status}): {response}")

                # Other agent responds
                prompt = f"As a {agent.status} in the {agent.industry} industry, I've been impacted because {response}. How are you handling it?"
                response = self.talk_to_llama(client, prompt)
                conversation.append(f"{agent.name} ({agent.status}): {response}")

                # Continue the conversation
                prompt = f"{self.name} ({self.status}): It's been challenging. We've had to {response}. What about your plans?"
                response = self.talk_to_llama(client, prompt)
                conversation.append(f"{self.name} ({self.status}): {response}")

                prompt = f"{agent.name} ({agent.status}): I'm considering {response}. Let's keep in touch."
                response = self.talk_to_llama(client, prompt)
                conversation.append(f"{agent.name} ({agent.status}): {response}")

                self.conversation_history.append({
                    "sender": [self.name, self.status],
                    "receiver": [agent.name, agent.status],
                    "conversation_history": conversation
                })
                agent.conversation_history.append({
                    "sender": [self.name, self.status],
                    "receiver": [agent.name, agent.status],
                    "conversation_history": conversation
                })

class PolicySimulation:
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.agents: List[Agent] = []

    def create_agents(self):
        for industry in industries:
            for status in ['decision_maker', 'worker']:
                about = {
                    "age": random.randint(25, 65),
                    "location": "Toronto, ON",
                    "income": random.randint(50000, 150000),
                    "profession": f"{status} in {industry}",
                    "political_preference": random.choice(["conservative", "moderate", "liberal"]),
                }
                agent_id = len(self.agents)
                name = f"{industry}_{status}"
                self.agents.append(Agent(agent_id, name, industry, status, about))

    def simulate_policy_impact(self, policy: str):
        for agent in self.agents:
            agent.converse_with_agents(self.client, self.agents, policy)

# Example usage
if __name__ == "__main__":
    sim = PolicySimulation(api_key="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")
    sim.create_agents()
    policy = "Universal Basic Income policy"
    sim.simulate_policy_impact(policy)
    for agent in sim.agents:
        print(f"Agent {agent.name} conversation history: {agent.conversation_history}")
        print(f"Most affected industries for {agent.name}: {agent.most_affected_industries}")

