import React, { useEffect, useRef } from 'react';
import { Message } from '@/types';

interface ChatBubblesProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
  position: { left: string; top: string };
}

export const ChatBubbles: React.FC<ChatBubblesProps> = ({ messages, isOpen, onClose, position }) => {
  if (!isOpen) return null;

  const currentMessage = messages[messages.length - 1];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div 
      className="fixed bg-white rounded-lg shadow-lg p-4 w-96 h-[300px] flex flex-col"
      style={{
        left: `calc(${position.left} + 900px)`,
        top: `calc(${position.top} + 150px)`,
        transform: 'translate(0, -100%)',
        zIndex: 2000
      }}
      onWheel={(e) => e.stopPropagation()}
    >
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ×
      </button>
      <div className="mb-4 border-b pb-2 flex-shrink-0">
        <h3 className="font-bold text-lg">
          {currentMessage.sender.industry} → {currentMessage.receiver.industry}
        </h3>
        <div className="text-sm text-gray-500">
          From: {currentMessage.sender.role}
          <br />
          To: {currentMessage.receiver.role}
        </div>
      </div>
      <div className="space-y-4 overflow-y-auto flex-grow pr-2" onWheel={(e) => e.stopPropagation()}>
        {currentMessage.conversation_history.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div 
              className={`rounded-lg p-3 max-w-[80%] ${
                index % 2 === 0 
                  ? 'bg-gray-100 rounded-tl-none' 
                  : 'bg-blue-100 rounded-tr-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
