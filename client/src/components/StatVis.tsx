import React from 'react';

interface StatVisProps {
    currentMetrics?: any;
}

export function StatVis({ currentMetrics }: StatVisProps) {
    console.log(currentMetrics); // {"GDP": "0.000", "UNEMPLOYMENT": "0.000", "INFLATION": "0.000", "INTEREST": "0.000"}

  return (
    currentMetrics && (
      <div className="fixed bottom-0 right-0 h-auto z-50 transition-transform duration-300 ease-in-out transform w-80 overflow-hidden">
        <div className="bg-white p-4 rounded-t-lg shadow-lg">
          <h3 className="font-bold text-lg mb-2">Change in Metrics</h3>
          <pre className="whitespace-pre-wrap break-words w-full">
            {JSON.stringify(currentMetrics, null, 2)}
          </pre>
        </div>
      </div>
    )
  );
}
