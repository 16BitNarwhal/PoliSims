import React from 'react';

interface TimelineProps {
  currentIndex: number;
  totalMessages: number;
  onIndexChange: (index: number) => void;
  onPlay: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({ currentIndex, totalMessages, onIndexChange, onPlay }) => {
  return (
    <div className="fixed inset-x-0 bottom-0 bg-white p-4 flex items-center justify-center w-full max-w-lg mx-auto">
      <input
        type="range"
        min={0}
        max={totalMessages - 1}
        value={currentIndex}
        step={1}
        onChange={(e) => onIndexChange(Number(e.target.value))}
        className="flex-grow"
      />
      <button onClick={onPlay} className="px-4 py-2 bg-blue-500 text-white rounded">
        Play
      </button>
    </div>
  );
};
