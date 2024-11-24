import React from 'react';
import { Person } from '@/types';
import { Provinces } from 'react-canada-map';

interface SidebarProps {
  province: string;
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
}

export function Sidebar({ province, isOpen, onClose, people }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out transform translate-x-0">
      <div className="p-4">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mt-4">{provinceToProvinceName[province as Provinces]}</h2>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {people.map((person, index) => (
            <div key={index} className="flex items-center w-1/2 md:w-1/3 lg:w-1/4">
              <img src={person.pfpUrl} className="w-16 h-16 rounded-lg shadow-lg mr-2 shadow-gray-700/50" alt=""/>
              <div className="relative group">
                <span className="hidden group-hover:block absolute -mt-10 bg-white p-2 rounded shadow-lg">
                  <div>
                    <span className="block font-bold">{person.name}</span>
                    <span className="block">{person.age}</span>
                    <span className="block">{person.address}</span>
                  </div>
                </span>
              </div>
            </div>
          ))}
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
