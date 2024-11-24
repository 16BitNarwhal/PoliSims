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
    called = 0

    def __init__(self, industry: str, status: str):
        self.industry = industry
        self.status = status  # 'decision_maker' or 'worker'

        self.description = ""
        self.related = False
        self.interacted_with = []
        self.conversation_history = []
        self.most_affected_industries = []  # New member to store affected industries

    def talk_to_llama(self, client: Groq, prompt: str) -> str:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
        )
        response = response.choices[0].message.content
        response = response.replace("```", "").strip()
        print(prompt)
        return response

    def generate_descriptions(self, client: Groq, policy: str) -> None:
        prompt = f"""
        You are a {self.status} in the {self.industry} industry. Given the policy: {policy},
        shortly summarize the effects on your role and industry. If it doesn't really affect your industry, please
        simply state that it doesn't with a very short argument why it doesn't.
        ONLY RETURN THE SUMMARY
        """
        response = self.talk_to_llama(client, prompt)
        self.description = response

    def process_policy(self, client: Groq, policy: str) -> bool:
        prompt = f"""
        You are a {self.status} in the {self.industry} industry. Given the policy: {policy},
        shortly summarize the effects on your role and industry. From the following list of industries: {industries},
        identify the 2 most affected industries. Provide the effects in JSON format:
        "impact": "description of impact",
        "affected_agents": ["industry1", "industry2"]
        ONLY RETURN THE JSON DO NOT RETURN ANYTHING OUTSIDE OF THE JSON
        """
        response = self.talk_to_llama(client, prompt)
        try:
            result = json.loads(response)
            self.description = result.get("impact", [])
            self.most_affected_industries = result.get("affected_agents", [])
            return True
        except json.JSONDecodeError:
            return False

    def converse_with_agents(self, client: Groq, agents: List["Agent"], policy: str):
        affected_agents = self.most_affected_industries
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

                self.conversation_history.append(
                    {
                        "sender": [self.industry, self.status],
                        "receiver": [agent.industry, agent.status],
                        "conversation_history": conversation,
                    }
                )
                agent.conversation_history.append(
                    {
                        "sender": [self.industry, self.status],
                        "receiver": [agent.industry, agent.status],
                        "conversation_history": conversation,
                    }
                )


class PolicySimulation:
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.agents: List[Agent] = []

    def talk_to_llama(self, client: Groq, prompt: str) -> str:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
        )
        response = response.choices[0].message.content
        response = response.replace("```", "").strip()
        print(prompt)
        return response

    def choose_most_related(self, client: Groq, policy: str) -> None:
        prompt = f"""
        From this list of industries, {industries}, choose the top 3 industries that are most affected by the following
        policy: {policy}
        ONLY RETURN 3 INDUSTRIES FROM THE GIVEN LIST, COMMA SEPARATED
        """
        response = self.talk_to_llama(client, prompt)
        for agent in self.agents:
            if agent.industry in response:
                agent.directly_affected = True

    def create_agents(self):
        for industry in industries:
            for status in ["decision_maker", "worker", "consumer"]:
                self.agents.append(Agent(industry, status))

    def simulate_policy_impact(self, policy: str) -> None:
        for agent in self.agents:
            agent.generate_descriptions(self.client, policy)
        self.choose_most_related(self.client, policy)
        for agent in self.agents:
            if agent.related:
                agent.process_policy(self.client, policy)
                agent.converse_with_agents(self.client, self.agents, policy)

    def get_conversation_history(self):
        conversation_history = []
        for agent in self.agents:
            for conversation in agent.conversation_history:
                conversation_history.append(
                    {
                        "sender": {"industry": agent.industry, "role": agent.status},
                        "receiver": {
                            "industry": [
                                a.industry
                                for a in self.agents
                                if a.name == conversation["receiver"]
                            ][0],
                            "role": [
                                a.status
                                for a in self.agents
                                if a.name == conversation["receiver"]
                            ][0],
                        },
                        "conversation_history": conversation["conversation_history"],
                    }
                )
        return conversation_history


@app.route("/api/messages", methods=["GET"])
def get_messages():
    try:
        sim = PolicySimulation(
            api_key="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"
        )
        sim.create_agents()
        policy = "Universal Basic Income policy"
        sim.simulate_policy_impact(policy)
        return jsonify(sim.get_conversation_history())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def main():
    sim = PolicySimulation(
        api_key="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"
    )
    sim.create_agents()
    policy = "Universal Basic Income policy"
    sim.simulate_policy_impact(policy)
    for agent in sim.agents:
        print(f"Agent {agent.name} conversation history: {agent.conversation_history}")
        print(
            f"Most affected industries for {agent.name}: {agent.most_affected_industries}"
        )


if __name__ == "__main__":
    # app.run(port=3001, debug=True)
    main()
