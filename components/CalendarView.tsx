import React from 'react';
import { ScheduleItem } from '../types';

interface CalendarViewProps {
  schedule: ScheduleItem[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ schedule }) => {
  const weekDays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

  // Current Date Info for Header and Grid Calculation
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Names for Header
  const monthNamesNominative = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

  // Calculate Start Day Offset
  // JS getDay(): 0 = Sunday, 1 = Monday ... 6 = Saturday
  // We want: 0 = Monday ... 6 = Sunday
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // If Sunday (0) -> make it 6. Else minus 1.
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Calculate Work/Off Summary dynamically from passed schedule
  const workDaysCount = schedule.filter(i => i.isWorking).length;
  const offDaysCount = schedule.filter(i => !i.isWorking).length;

  return (
    <div className="px-2 pt-2 pb-20">
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        
        {/* Month Navigation/Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-tight">
            {monthNamesNominative[currentMonth]} <span className="text-gray-400 font-medium">{currentYear}</span>
          </h2>
          <div className="px-3 py-1 bg-gray-50 rounded-full text-xs font-semibold text-gray-500 border border-gray-100">
            Zmiana A
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1">
          {/* Empty cells for days before start of month */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Days */}
          {schedule.map((item) => {
            const isWork = item.isWorking;
            
            return (
              <div key={item.id} className="flex flex-col items-center justify-center aspect-square relative">
                <div 
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-300
                    ${item.isToday 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110 z-10' 
                      : 'text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  {item.day}
                </div>

                {/* Status Indicator Dot */}
                <div className="mt-1 h-1.5 w-1.5 rounded-full flex space-x-0.5">
                   {isWork ? (
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   ) : (
                     <div className="w-1.5 h-1.5 rounded-full bg-rose-200"></div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend / Summary */}
      <div className="mt-6 px-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Podsumowanie</h3>
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-2 h-8 rounded-full bg-emerald-500"></div>
              <div>
                 <span className="block text-lg font-bold text-gray-800">{workDaysCount}</span>
                 <span className="text-[10px] text-gray-500 uppercase font-bold">Dni Pracujące</span>
              </div>
           </div>
           <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-2 h-8 rounded-full bg-rose-300"></div>
              <div>
                 <span className="block text-lg font-bold text-gray-800">{offDaysCount}</span>
                 <span className="text-[10px] text-gray-500 uppercase font-bold">Dni Wolne</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
