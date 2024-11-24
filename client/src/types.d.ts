import { Provinces } from "react-canada-map";

export type Person = {
	name: string;
	age: number;
	gender: "male" | "female";
	address: string;
	pfpUrl: string;
};

export type Message = {
	sender: {
		industry: string;
		role: string;
	};
	receiver: {
		industry: string;
		role: string;
	};
	conversation_history: string[];
};
