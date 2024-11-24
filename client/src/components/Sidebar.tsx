import React from 'react';
import { Person, Message } from '@/types';
import { Provinces } from 'react-canada-map';

interface SidebarProps {
  province: string;
  isOpen: boolean;
  onClose: () => void;
  currentMessage?: Message;
}

export function Sidebar({ province, isOpen, onClose, currentMessage }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-96 bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out transform translate-x-0 flex flex-col">
      <div className="p-4 border-b">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Policy Discussions Section */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-bold text-lg text-green-700">
              Policy Discussions with Stakeholders
            </h3>
          </div>

          {currentMessage ? (
            <>
              <div className="p-4 bg-gray-50 border-b">
                <div className="text-sm text-gray-600">
                  <div className="font-medium text-green-700 mb-2">
                    {currentMessage.sender.industry} → {currentMessage.receiver.industry}
                  </div>
                  <span className="font-semibold">From:</span> {currentMessage.sender.role}
                  <br />
                  <span className="font-semibold">To:</span> {currentMessage.receiver.role}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
                {currentMessage.conversation_history.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`rounded-lg p-3 max-w-[85%] ${
                        index % 2 === 0 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-gray-500 text-center">
              <p>Select a conversation to view stakeholder discussions about the policy impact</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const provinceToProvinceName: Record<Provinces, string> = {
  ON: "Ontario",
  BC: "British Columbia",
  AB: "Alberta",
  SK: "Saskatchewan",
  MB: "Manitoba",
  NB: "New Brunswick",
  PE: "Prince Edward Island",
  NS: "Nova Scotia",
  YT: "Yukon Territory",
  NT: "Northwest Territories",
  NU: "Nunavut",
  QC: "Quebec",
  NL: "Newfoundland and Labrador",
}
