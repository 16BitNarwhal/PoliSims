"use client";

import React, { useState, useRef, useEffect } from "react";
import CanadaMap, { Provinces } from "react-canada-map";
import { Sidebar } from "@/components/Sidebar";
import { Timeline } from "@/components/Timeline";
import { Person, Message } from "@/types";
import { ChatBubbles } from "@/components/ChatBubbles";

interface PeoplePerProvince {
  [province: string]: Person[];
}

const generatePeoplePerProvince = (): PeoplePerProvince => {
  // Use fixed indices for consistent rendering between server and client
  const indices = [1, 2, 3, 4, 5, 6, 7, 8];
  return {
    "ON": indices.map((index) => ({
      name: `Person ${index}`,
      age: 25 + index,
      gender: index % 2 === 0 ? "male" : "female",
      address: `${index * 100} Main St`,
      pfpUrl: `https://xsgames.co/randomusers/assets/avatars/pixel/${index}.jpg`
    }))
  };
};

const peoplePerProvince = generatePeoplePerProvince();

const industries = {
  "Lumber": { position: { left: "8%", top: "40%" } }, // BC
  "Banking": { position: { left: "49%", top: "61%" } }, // ON
  "Fishing": { position: { left: "35%", top: "53%" } }, // MB
  "Gasoline": { position: { left: "19%", top: "65%" } }, // AB
  "Tech": { position: { left: "59%", top: "80%" } }, // ON
  "Insurance": { position: { left: "56%", top: "45%" } }, // QC
  "Grocery": { position: { left: "64%", top: "68%" } }, // QC
  "Transportation": { position: { left: "41%", top: "70%" } }, // ON
};

const getIndustryPosition = (industryName: string) => {
  const key = Object.keys(industries).find(
    k => k.toLowerCase() === industryName.toLowerCase()
  );
  return key && industries[key as keyof typeof industries]?.position || null;
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

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mailPosition, setMailPosition] = useState({ left: "0%", top: "0%" });
  const [showMail, setShowMail] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const pollMessages = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/messages', {
          headers: { 'Content-Type': 'application/json' },
        });
  
        // Check if the response is okay
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        // Parse the response JSON
        const jsonResponse = await response.json();
  
        // Ensure response contains the expected data structure
        if (jsonResponse.status === 'success' && jsonResponse.data) {
          const responseMessages = jsonResponse.data; // Extract the `data` field from the response
  
          console.log(responseMessages)
  
          // setMessages(newMessages); // Update state with the new messages
        } else {
          console.error('Unexpected response structure:', jsonResponse);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
  
    // Set up polling
    const interval = setInterval(pollMessages, 1000); // Poll every second
    return () => clearInterval(interval); // Cleanup on unmount
  }, []); // Dependency array is empty to run only on mount
  

  const handlePlay = () => {
    // Reset animation state if already animating
    if (isAnimating) {
      setIsAnimating(false);
      setShowMail(false);
      setCurrentMessageIndex(0);
      return;
    }

    setIsAnimating(true);
    setCurrentMessageIndex(0); // Reset to start
    const animateMessages = async (index: number) => {
      if (index < messages.length) {
        const message = messages[index];
        setCurrentMessageIndex(index);
        
        // Get positions for sender and receiver
        const senderPosition = getIndustryPosition(message.sender.industry);
        const receiverPosition = getIndustryPosition(message.receiver.industry);
        
        if (senderPosition && receiverPosition) {
          // Start mail at sender position
          setMailPosition({ left: senderPosition.left, top: senderPosition.top });
          setShowMail(true);

          // Animate to receiver position
          await new Promise<void>((resolve) => {
            const mailElement = document.querySelector('.mail-icon') as HTMLElement;
            if (mailElement) {
              mailElement.style.transition = 'left 1s ease-in-out, top 1s ease-in-out';
              mailElement.style.left = receiverPosition.left;
              mailElement.style.top = receiverPosition.top;
              
              // Wait longer at receiver's position (3 seconds total)
              setTimeout(() => {
                setShowMail(false);
                resolve();
              }, 2000); // Increased from 1000 to 3000
            } else {
              resolve();
            }
          });
        }

        // Increased delay before next message to account for longer display time
        setTimeout(() => animateMessages(index + 1), 1000); // Increased from 1000 to 4000
      } else {
        setIsAnimating(false);
        setShowMail(false);
      }
    };
    animateMessages(0); // Start from index 0
  };

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
              onHoverColor="ForestGreen"
              onClick={mapClickHandler}
            />
            {isAnimating && currentMessageIndex < messages.length && (
              <>
                <div
                  className="absolute w-4 h-4 bg-blue-500 rounded-full"
                  style={{
                    left: getIndustryPosition(messages[currentMessageIndex].sender.industry)?.left,
                    top: getIndustryPosition(messages[currentMessageIndex].sender.industry)?.top,
                    transform: 'translate(-50%, -50%)',
                    animation: 'pulse 1s infinite'
                  }}
                />
                <div
                  className="absolute w-3 h-3 bg-green-500 rounded-full"
                  style={{
                    '--start-x': getIndustryPosition(messages[currentMessageIndex].sender.industry)?.left,
                    '--start-y': getIndustryPosition(messages[currentMessageIndex].sender.industry)?.top,
                    '--end-x': getIndustryPosition(messages[currentMessageIndex].receiver.industry)?.left,
                    '--end-y': getIndustryPosition(messages[currentMessageIndex].receiver.industry)?.top,
                    left: getIndustryPosition(messages[currentMessageIndex].sender.industry)?.left,
                    top: getIndustryPosition(messages[currentMessageIndex].sender.industry)?.top,
                    animation: 'travel 2s ease-in-out forwards'
                  } as React.CSSProperties}
                  onAnimationEnd={() => {
                    if (currentMessageIndex < messages.length - 1) {
                      setCurrentMessageIndex(prev => prev + 1);
                    } else {
                      setIsAnimating(false);
                    }
                  }}
                />
              </>
            )}
            {showMail && (
              <div
                className="mail-icon"
                style={{
                  position: 'absolute',
                  left: mailPosition.left,
                  top: mailPosition.top,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000,
                  transition: 'left 1s ease-in-out, top 1s ease-in-out',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChat(true);
                }}
              >
                <img
                  src="/mail.png"
                  alt="Mail"
                  className="w-8 h-8"
                />
              </div>
            )}
            <ChatBubbles
              messages={messages.slice(0, currentMessageIndex + 1)}
              isOpen={showChat}
              onClose={() => setShowChat(false)}
              position={mailPosition}
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
      <Timeline
        currentIndex={currentMessageIndex}
        totalMessages={messages.length}
        onIndexChange={setCurrentMessageIndex}
        onPlay={handlePlay}
      />
    </>
  );
};

export default App;
