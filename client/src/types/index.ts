export interface Industry {
	name: string;
}

export interface Message {
	sender: Industry;
	receiver: Industry;
	content: string;
}
