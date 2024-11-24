import React, { useRef, useEffect } from "react";
import { Message } from "@/types";

interface ChatBubblesProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export const ChatBubbles: React.FC<ChatBubblesProps> = ({
  messages,
  isOpen,
  onClose,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg text-green-700">
          Policy Discussions
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index}>
            <div className="p-4 bg-gray-50 border-b">
              <div className="text-sm text-gray-600">
                <div className="font-medium text-green-700 mb-2">
                  {message.sender.industry} → {message.receiver.industry}
                </div>
                <span className="font-semibold">From:</span> {message.sender.role}
                <br />
                <span className="font-semibold">To:</span> {message.receiver.role}
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {message.conversation_history.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    idx % 2 === 0 ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-[85%] ${
                      idx % 2 === 0
                        ? "bg-green-50 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
