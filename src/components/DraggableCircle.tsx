import { useState, useRef, useEffect } from 'react';

interface DraggableCircleProps {
  initialX: number;
  initialY: number;
  size: number;
  color: string;
  opacity: number;
  blur: 'xl' | '2xl' | '3xl';
  floatDuration?: number;
  floatX?: number;
  floatY?: number;
}

export default function DraggableCircle({ 
  initialX, 
  initialY, 
  size, 
  color, 
  opacity, 
  blur,
  floatDuration = 20,
  floatX = 20,
  floatY = 20
}: DraggableCircleProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const circleRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragStart]);

  const blurClass = {
    'xl': 'blur-xl',
    '2xl': 'blur-2xl',
    '3xl': 'blur-3xl'
  }[blur];

  return (
    <div
      ref={circleRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`absolute rounded-full ${blurClass} cursor-move touch-none select-none transition-transform hover:scale-105`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: isDragging ? `${position.x}px` : `${initialX}%`,
        top: isDragging ? `${position.y}px` : `${initialY}%`,
        transform: isDragging ? 'none' : undefined,
        animation: isDragging ? 'none' : `float-${initialX}-${initialY} ${floatDuration}s ease-in-out infinite`,
        backgroundColor: color,
        opacity: opacity / 100,
      }}
    >
      <style>
        {`
          @keyframes float-${initialX}-${initialY} {
            0%, 100% {
              transform: translate(0, 0);
            }
            50% {
              transform: translate(${floatX}px, ${floatY}px);
            }
          }
        `}
      </style>
    </div>
  );
}