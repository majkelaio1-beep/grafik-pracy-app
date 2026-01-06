import React, { useRef, useEffect, useState } from 'react';
import { ScheduleItem } from '../types';
import { CheckCircle2, Briefcase, Coffee, ChevronDown, Clock, Minus, Plus, StickyNote } from 'lucide-react';

interface ScheduleCardProps {
  item: ScheduleItem;
  isOpen: boolean;
  onClick: () => void;
  onUpdateHours: (hours: number) => void;
  onUpdateNote: (note: string) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item, isOpen, onClick, onUpdateHours, onUpdateNote }) => {
  const { day, monthStr, description, isWorking, isToday, hoursWorked, note, dayOfWeek } = item;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Intersection Observer to detect when the "Today" card is in the center of the view
  useEffect(() => {
    if (!isToday) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFocused(entry.isIntersecting);
      },
      {
        root: null,
        // Threshold and margin adjusted to trigger when the card is roughly in the middle 50% of screen
        threshold: 0.6, 
        rootMargin: "-20% 0px -20% 0px" 
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, [isToday]);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Increment by 0.5 instead of 1
    onUpdateHours(hoursWorked + 0.5);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hoursWorked > 0) {
      // Decrement by 0.5 instead of 1
      onUpdateHours(Math.max(0, hoursWorked - 0.5));
    }
  };

  // Visual Styles based on status
  const containerClasses = isWorking
    ? "bg-white border-emerald-100/50 hover:border-emerald-200"
    : "bg-white border-rose-100/50 hover:border-rose-200";

  const textClasses = isWorking
    ? "text-emerald-950"
    : "text-rose-950";

  const accentColor = isWorking ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600";
  const iconColor = isWorking ? "text-emerald-500" : "text-rose-400";

  // "Today" Special Styling with Dynamic Scroll Animation
  const highlightClasses = isToday
    ? isFocused
        ? "ring-4 ring-blue-400 ring-offset-2 shadow-2xl shadow-blue-500/30 border-blue-200 z-10 scale-[1.03]"
        : "ring-2 ring-blue-500/50 ring-offset-1 shadow-lg shadow-blue-500/10 border-blue-100 z-10 scale-[1.00]"
    : "shadow-sm border scale-100";

  const getShiftIcon = () => {
    return isWorking ? <Briefcase size={20} /> : <Coffee size={20} />;
  };

  return (
    <div 
      ref={cardRef}
      onClick={onClick}
      className={`
        relative w-full mb-3 rounded-2xl transition-all duration-500 ease-out cursor-pointer overflow-hidden select-none
        ${containerClasses} ${highlightClasses}
        ${isOpen ? 'shadow-lg ring-1 ring-black/5' : ''}
      `}
    >
      {/* "Today" Badge */}
      {isToday && (
        <div className={`
          absolute top-0 right-0 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-20 transition-colors duration-500
          ${isFocused ? 'bg-blue-500' : 'bg-blue-400/80'}
        `}>
          DZISIAJ
        </div>
      )}

      {/* Main Row Content */}
      <div className="p-4 flex items-center justify-between min-h-[5rem]">
        
        {/* Left: Date */}
        <div className="flex items-center gap-4">
          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl ${accentColor}`}>
            <span className="text-xl font-bold leading-none">{day}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-75">{monthStr.substring(0, 3)}</span>
          </div>
          
          {/* Description */}
          <div className="flex flex-col justify-center">
            {/* Day of Week Label */}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
               {dayOfWeek}
            </span>
            <span className={`font-bold text-lg leading-tight ${textClasses}`}>
              {description}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-medium opacity-60 ${textClasses}`}>
                {isWorking ? 'Kliknij po szczegóły' : 'Odpoczynek'}
              </span>
              {hoursWorked > 0 && (
                 <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                   {hoursWorked}h
                 </span>
              )}
              {note && note.trim().length > 0 && (
                  <StickyNote size={14} className="text-blue-400 ml-1" />
              )}
            </div>
          </div>
        </div>

        {/* Right: Icon */}
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-full transition-transform duration-300
          ${iconColor}
          ${isOpen ? 'bg-gray-50 rotate-180' : 'bg-transparent'}
        `}>
          {isOpen ? <ChevronDown size={20} className="text-gray-400" /> : getShiftIcon()}
        </div>
      </div>

      {/* Expanded Details Section */}
      <div 
        className={`
          transition-all duration-300 ease-in-out bg-gray-50/50
          ${isOpen ? 'max-h-96 opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-4 flex flex-col gap-4">
            {/* Status Row */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</span>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <CheckCircle2 size={16} className={isWorking ? "text-emerald-500" : "text-rose-500"} />
                        {isWorking ? 'Obecność wymagana' : 'Dzień wolny od pracy'}
                    </div>
                </div>
            </div>

            {/* Hour Logger Row */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200/50 shadow-sm">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-500" />
                    <span className="text-sm font-bold text-gray-700">Rejestracja czasu</span>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                      onClick={handleDecrement}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-90 transition-all disabled:opacity-50"
                      disabled={hoursWorked <= 0}
                    >
                      <Minus size={16} strokeWidth={3} />
                    </button>
                    
                    <div className="w-12 text-center">
                        <span className="text-lg font-black text-gray-800">{hoursWorked}</span>
                        <span className="text-xs text-gray-400 font-bold ml-0.5">h</span>
                    </div>

                    <button 
                      onClick={handleIncrement}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 active:scale-90 transition-all shadow-md shadow-blue-200"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* Note Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <StickyNote size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Notatka</span>
                </div>
                <textarea
                    value={note || ''}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdateNote(e.target.value)}
                    placeholder="Dodaj notatkę..."
                    className="w-full p-3 rounded-xl bg-white border border-gray-200/50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 resize-none transition-all shadow-sm"
                    rows={3}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
