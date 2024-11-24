import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface Position {
  left: string;
  top: string;
}

interface IndustryPositions {
  [key: string]: {
    position: Position;
  };
}

export interface MessageAnimationProps {
  id: string;
  sender: string;
  receiver: string;
  industryPositions: IndustryPositions;
  onComplete: (id: string) => void;
}

export const MessageAnimation: React.FC<MessageAnimationProps> = ({ 
  id,
  sender, 
  receiver, 
  industryPositions,
  onComplete
}) => {
  const [start, setStart] = useState<Position>({ left: '0%', top: '0%' });
  const [end, setEnd] = useState<Position>({ left: '0%', top: '0%' });
  const controls = useAnimation();

  useEffect(() => {
    if (industryPositions[sender] && industryPositions[receiver]) {
      setStart(industryPositions[sender].position);
      setEnd(industryPositions[receiver].position);
    }
  }, [sender, receiver, industryPositions]);

  useEffect(() => {
    const animate = async () => {
      await controls.start({
        left: end.left,
        top: end.top,
        transition: { duration: 2 }
      });
      onComplete(id);
    };
    animate();
  }, [controls, end, id, onComplete]);

  return (
    <motion.div
      initial={{ left: start.left, top: start.top }}
      animate={controls}
      style={{
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: '50%',
        backgroundColor: 'red',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};
