from typing import Dict, List
import json
import random
import time
import requests

from groq import Groq
from flask import Flask, jsonify
from flask_cors import CORS


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
# industries = [
#     "Lumber",
#     "Banking",
#     "Fishing",
# ]


class Agent:
    def __init__(self, industry: str, status: str):
        self.industry = industry
        self.status = status  # 'decision_maker' or 'worker'

        self.description = ""
        self.directly_affected = False
        self.interacted_with = set()
        self.conversation_history = []
        self.most_affected_industries = []  # New member to store affected industries

    def talk_to_llama(self, client: Groq, prompt: str) -> str:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
        )
        response = response.choices[0].message.content
        response = response.replace("```", "").strip()
        return response

    def has_talked_to(self, other_agent):
        return other_agent.industry in self.interacted_with

    def record_interaction(self, other_agent):
        self.interacted_with.add(other_agent.industry)
        other_agent.interacted_with.add(self.industry)

    def format_conversation_history(self, messages):
        """Format previous messages into a readable context"""
        history = "\nPrevious messages:\n"
        for msg in messages:
            history += f"{msg['speaker']} ({msg['status']}): {msg['message']}\n"
        return history

    def generate_prompt(self, context, base_prompt, other_agent=None, messages=None):
        """Generate a prompt with context about both agents and conversation history"""
        prompt = f"Context: {context}\n\n"  # Now actually using the context parameter
        prompt += f"You are a {self.status} in the {self.industry} industry.\n"
        prompt += f"Your situation: {self.description}\n"

        if other_agent:
            prompt += f"\nYou are speaking with a {other_agent.status} in the {other_agent.industry} industry."
            prompt += f"\nTheir situation: {other_agent.description}\n"

        if messages:
            prompt += self.format_conversation_history(messages)

        prompt += f"\nBased on this context and conversation history, {base_prompt}"
        prompt += "\nKeep your response conversational, natural, and focused on the specific points mentioned. Answer in 1-2 sentences."
        return prompt

    def simulate_conversation(self, other_agent, client):
        if self.has_talked_to(other_agent):
            return None

        conversation = []

        # First message
        first_prompt = self.generate_prompt(
            context="Starting a conversation about policy impacts",
            base_prompt="share how the policy has affected you and ask about their experience, considering their specific situation.",
            other_agent=other_agent,
        )
        response = self.talk_to_llama(client, first_prompt)
        conversation.append(
            {"speaker": self.industry, "status": self.status, "message": response}
        )

        # Second message
        second_prompt = other_agent.generate_prompt(
            context="Responding to inquiry about policy impacts",
            base_prompt="respond to their situation and share your own experience, relating it to their circumstances.",
            other_agent=self,
            messages=conversation,
        )
        response = self.talk_to_llama(client, second_prompt)
        conversation.append(
            {
                "speaker": other_agent.industry,
                "status": other_agent.status,
                "message": response,
            }
        )

        # Third message
        third_prompt = self.generate_prompt(
            context="Discussing coping strategies",
            base_prompt="acknowledge their specific challenges and share how you're handling similar issues.",
            other_agent=other_agent,
            messages=conversation,
        )
        response = self.talk_to_llama(client, third_prompt)
        conversation.append(
            {"speaker": self.industry, "status": self.status, "message": response}
        )

        # Fourth message
        fourth_prompt = other_agent.generate_prompt(
            context="Wrapping up the conversation",
            base_prompt="share your future plans that might be relevant to their situation and conclude naturally.",
            other_agent=self,
            messages=conversation,
        )
        response = self.talk_to_llama(client, fourth_prompt)
        conversation.append(
            {
                "speaker": other_agent.industry,
                "status": other_agent.status,
                "message": response,
            }
        )

        self.record_interaction(other_agent)
        print(conversation)
        return conversation

    def generate_descriptions(self, client: Groq, policy: str) -> None:
        prompt = f"""
        You are a {self.status} in the {self.industry} industry. Given the policy: {policy},
        very shortly summarize the effects on your role and industry. If it doesn't really affect your industry, please
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
        print("called")
        response = self.talk_to_llama(client, prompt)
        try:
            result = json.loads(response)
            self.description = result.get("impact", [])
            self.most_affected_industries = result.get("affected_agents", [])
            return True
        except json.JSONDecodeError:
            return False

    def converse_with_agents(self, client: Groq, agents: List["Agent"]):
        affected_agents = self.most_affected_industries
        for agent in agents:
            if agent.industry in affected_agents:
                self.conversation_history.append(
                    self.simulate_conversation(agent, client)
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
        return response

    def choose_most_related(self, client: Groq, policy: str) -> None:
        prompt = f"""
        From this list of industries, {industries}, choose the top 3 industries that are most affected by the following
        policy: {policy}
        ONLY RETURN 3 INDUSTRIES FROM THE GIVEN LIST, COMMA SEPARATED AND NOTHING ELSE
        """
        response = self.talk_to_llama(client, prompt)
        response = response.split(", ")
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
            if agent.directly_affected:
                agent.process_policy(self.client, policy)
                agent.converse_with_agents(self.client, self.agents)

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
                                if a.industry == conversation["receiver"]
                            ][0],
                            "role": [
                                a.status
                                for a in self.agents
                                if a.industry == conversation["receiver"]
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
    # for agent in sim.agents:
    #     print(f"Agent {agent.industry} conversation history: {agent.conversation_history}")
    #     print(
    #         f"Most affected industries for {agent.industry}: {agent.most_affected_industries}"
    #     )


if __name__ == "__main__":
    # app.run(port=3001, debug=True)
    main()
