import React from 'react';
import { Person, Message } from '@/types';
import { Provinces } from 'react-canada-map';

interface StatVisProps {
  currentMessage?: Message;
}

export function StatVis({ currentMessage }: StatVisProps) {
  return (
    currentMessage && (
      <div className="fixed right-0 top-1/2 h-full w-96 shadow-lg z-50 transition-transform duration-300 ease-in-out transform -translate-x-full flex flex-col">
        metric A <br />
        metric B <br />
        metric C <br />
      </div>
    )
  );
}
