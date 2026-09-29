import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string; // ISO date string
  size?: 'sm' | 'md' | 'lg';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, size = 'md' }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5 font-mono-tech text-xs tracking-wider text-white font-semibold">
        <span>{pad(timeLeft.hours)}h</span>
        <span className="text-[#8E8E93]">:</span>
        <span>{pad(timeLeft.minutes)}m</span>
        <span className="text-[#8E8E93]">:</span>
        <span className="text-[#C0C0C0]">{pad(timeLeft.seconds)}s</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center justify-center bg-[#111111] border border-[#2B2B2B] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-[48px] sm:min-w-[56px] shadow-inner">
          <span className="font-mono-tech text-lg sm:text-2xl font-bold text-white tracking-tight">{pad(timeLeft.days)}</span>
          <span className="text-[10px] uppercase tracking-wider text-[#8E8E93] font-medium">Days</span>
        </div>
      )}
      <div className="flex flex-col items-center justify-center bg-[#111111] border border-[#2B2B2B] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-[48px] sm:min-w-[56px] shadow-inner">
        <span className="font-mono-tech text-lg sm:text-2xl font-bold text-white tracking-tight">{pad(timeLeft.hours)}</span>
        <span className="text-[10px] uppercase tracking-wider text-[#8E8E93] font-medium">Hours</span>
      </div>
      <span className="text-[#666666] font-bold">:</span>
      <div className="flex flex-col items-center justify-center bg-[#111111] border border-[#2B2B2B] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-[48px] sm:min-w-[56px] shadow-inner">
        <span className="font-mono-tech text-lg sm:text-2xl font-bold text-white tracking-tight">{pad(timeLeft.minutes)}</span>
        <span className="text-[10px] uppercase tracking-wider text-[#8E8E93] font-medium">Mins</span>
      </div>
      <span className="text-[#666666] font-bold">:</span>
      <div className="flex flex-col items-center justify-center bg-[#111111] border border-[#2B2B2B] rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-[48px] sm:min-w-[56px] shadow-inner">
        <span className="font-mono-tech text-lg sm:text-2xl font-bold text-white tracking-tight">{pad(timeLeft.seconds)}</span>
        <span className="text-[10px] uppercase tracking-wider text-[#8E8E93] font-medium">Secs</span>
      </div>
    </div>
  );
};
