"use client";

import React, { useState, useRef, useEffect } from "react";
import CanadaMap, { Provinces } from "react-canada-map";
import { Sidebar } from "@/components/Sidebar";
import { Person } from "@/types";

const peoplePerProvince: Record<string, Person[]> = {
  "ON": [
    { name: "John Doe", age: 25, gender: "male", address: "123 Main St", pfpUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${Math.floor(Math.random() * 50) + 1}.jpg` },
    { name: "Jane Smith", age: 30, gender: "female", address: "456 Elm St", pfpUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${Math.floor(Math.random() * 50) + 1}.jpg` },
    { name: "Jane Smith", age: 30, gender: "female", address: "456 Elm St", pfpUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${Math.floor(Math.random() * 50) + 1}.jpg` },
    { name: "Jane Smith", age: 30, gender: "female", address: "456 Elm St", pfpUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${Math.floor(Math.random() * 50) + 1}.jpg` },
    { name: "Jane Smith", age: 30, gender: "female", address: "456 Elm St", pfpUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${Math.floor(Math.random() * 50) + 1}.jpg` },
    { name: "Jane Smith", age: 30, gender: "female", address: "456 Elm St", pfpUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${Math.floor(Math.random() * 50) + 1}.jpg` },
    { name: "Jane Smith", age: 30, gender: "female", address: "456 Elm St", pfpUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${Math.floor(Math.random() * 50) + 1}.jpg` },
    { name: "Jane Smith", age: 30, gender: "female", address: "456 Elm St", pfpUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${Math.floor(Math.random() * 50) + 1}.jpg` },
  ],
};

const industries = {
  "Lumber": { position: { left: "10%", top: "50%" } }, // BC
  "Banking": { position: { left: "50%", top: "70%" } }, // ON
  "Fishing": { position: { left: "35%", top: "60%" } }, // MB
  "Gasoline": { position: { left: "20%", top: "60%" } }, // AB
  "Tech": { position: { left: "59%", top: "80%" } }, // ON
  "Insurance": { position: { left: "65%", top: "60%" } }, // QC
  "Grocery": { position: { left: "60%", top: "65%" } }, // QC
  "Transportation": { position: { left: "45%", top: "62%" } }, // ON
};

const App = () => {
  const [provinceSelected, setProvinceSelected] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 200,
    translateY: -200,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const mapClickHandler = (province: string, event: React.MouseEvent) => {
    if (!isDragging) {
      setProvinceSelected(province);
      setIsSidebarOpen(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - transform.translateX,
      y: e.clientY - transform.translateY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setTransform(prev => ({
        ...prev,
        translateX: newX,
        translateY: newY,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 0.1;
    const delta = e.deltaY > 0 ? -scaleFactor : scaleFactor;
    
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      const newScale = Math.max(0.5, Math.min(4, transform.scale + delta));
      
      const scaleChange = newScale - transform.scale;
      const newTranslateX = transform.translateX - ((cursorX - transform.translateX) * scaleChange) / transform.scale;
      const newTranslateY = transform.translateY - ((cursorY - transform.translateY) * scaleChange) / transform.scale;

      setTransform({
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
      });
    }
  };

  useEffect(() => {
    const container = mapContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [transform]);

  return (
    <>
      <div className="relative w-full h-screen overflow-hidden">
        <div 
          ref={mapContainerRef}
          className="absolute left-0 top-0 bottom-0 right-0 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.1s',
            }}
          >
            <CanadaMap
              fillColor="ForestGreen"
              onHoverColor="Gold"
              onClick={mapClickHandler}
            />
            {Object.keys(industries).map((industry, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: `${(industries as Record<string, { position: { left: string; top: string; } }>)[industry].position.left}`,
                  top: `${(industries as Record<string, { position: { left: string; top: string; } }>)[industry].position.top}`,
                  transform: `translate(-50%, -50%)`,
                }}
              >
                <img
                  className="w-12 h-12"
                  src={`/industry/${industry.toLowerCase()}.png`}
                  alt={industry}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Sidebar 
        province={provinceSelected} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        people={peoplePerProvince[provinceSelected] || []}
      />
    </>
  );
};

export default App;
