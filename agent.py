from typing import Dict, List
import json
import random
from groq import Groq
from flask import Flask, jsonify
from flask_cors import CORS
import time
import requests

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

industries = [
    "Lumber",
    "Banking",
    "Fishing",
    "Gasoline",
    "Tech",
    "Insurance",
    "Grocery",
    "Transportation",
]


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
        response = response.replace("```", "").strip()
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
        # print(f"Response for {self.name}: {response}")  # Debug statement
        try:
            result = json.loads(response)
            self.most_affected_industries = result.get("affected_agents", [])
            return result
        except json.JSONDecodeError:
            return {"impact": "Error processing response.", "affected_agents": []}

    def converse_with_agents(self, client: Groq, agents: List["Agent"], policy: str):
        effects = self.process_policy(client, policy)
        affected_agents = self.most_affected_industries
        # print(f"Affected agents for {self.name}: {affected_agents}")  # Debug statement
        for agent in agents:
            if agent.industry in affected_agents and agent.id != self.id:
                conversation = {
                    "sender": self.name,
                    "receiver": agent.name,
                    "conversation_history": [f"Discussed impact of policy: {policy}"],
                }
                self.conversation_history.append(conversation)
                agent.conversation_history.append(conversation)


class PolicySimulation:
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.agents: List[Agent] = []

    def create_agents(self):
        for industry in industries:
            for status in ["decision_maker", "manager", "worker"]:
                about = {
                    "age": random.randint(25, 65),
                    "location": "Toronto, ON",
                    "income": random.randint(50000, 150000),
                    "profession": f"{status} in {industry}",
                    "political_preference": random.choice(
                        ["conservative", "moderate", "liberal"]
                    ),
                }
                agent_id = len(self.agents)
                name = f"{industry}_{status}"
                self.agents.append(Agent(agent_id, name, industry, status, about))

    def simulate_policy_impact(self, policy: str):
        for agent in self.agents:
            agent.converse_with_agents(self.client, self.agents, policy)

    def get_conversation_history(self):
        conversation_history = []
        for agent in self.agents:
            for conversation in agent.conversation_history:
                conversation_history.append({
                    "sender": {
                        "industry": agent.industry,
                        "role": agent.status
                    },
                    "receiver": {
                        "industry": [a.industry for a in self.agents if a.name == conversation["receiver"]][0],
                        "role": [a.status for a in self.agents if a.name == conversation["receiver"]][0]
                    },
                    "conversation_history": conversation["conversation_history"]
                })
        return conversation_history


@app.route('/api/messages', methods=['GET'])
def get_messages():
    try:
        sim = PolicySimulation(api_key="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")
        sim.create_agents()
        policy = "Universal Basic Income policy"
        sim.simulate_policy_impact(policy)
        return jsonify(sim.get_conversation_history())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=3001, debug=True)
