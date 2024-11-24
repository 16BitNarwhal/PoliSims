from typing import Dict, List
import json
import random
from groq import Groq

industries = ["Lumber", "Banking", "Fishing", "Gasoline", "Tech", "Insurance", "Grocery", "Transportation"]

class Agent:
    called = 0
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
            model="llama-3.1-8b-instant",
        )
        response = response.choices[0].message.content
        response = response.replace('```', '').strip()
        print(prompt)
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
                prompt = f"As a {self.status} in the {self.industry} industry, the policy has forced me to make tough decisions. How has it affected you? Answer in a conversation-like fashion short and sweet"
                response = self.talk_to_llama(client, prompt)
                conversation.append(f"{self.name} ({self.status}): {response}")

                # Other agent responds
                prompt = f"As a {agent.status} in the {agent.industry} industry, I've been impacted because {response}. How are you handling it? Answer in a conversation-like fashion short and sweet"
                response = self.talk_to_llama(client, prompt)
                conversation.append(f"{agent.name} ({agent.status}): {response}")

                # Continue the conversation
                prompt = f"{self.name} ({self.status}): It's been challenging. We've had to {response}. What about your plans? Answer in a conversation-like fashion short and sweet"
                response = self.talk_to_llama(client, prompt)
                conversation.append(f"{self.name} ({self.status}): {response}")

                prompt = f"{agent.name} ({agent.status}): I'm considering {response}. Let's keep in touch. Answer in a conversation-like fashion short and sweet"
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
                name = f"{industry}_{status}_{agent_id}"
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

