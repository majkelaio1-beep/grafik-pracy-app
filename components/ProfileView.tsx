import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, LogOut, BarChart3, TrendingUp, Clock, Calendar, Briefcase } from 'lucide-react';
import { ScheduleItem } from '../types';
import { auth } from '../firebase';

interface ProfileViewProps {
  totalHours?: number;
  schedule?: ScheduleItem[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ totalHours = 0, schedule = [] }) => {
  const user = auth.currentUser;
  
  // Find "Today" index to scroll to it or select it by default
  const todayItem = schedule.find(i => i.isToday);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(todayItem?.id || null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    auth.signOut();
  };

  // --- DATE & GRAMMAR LOGIC ---
  const now = new Date();
  const monthNamesLocative = [
    "Styczniu", "Lutym", "Marcu", "Kwietniu", "Maju", "Czerwcu", 
    "Lipcu", "Sierpniu", "Wrześniu", "Październiku", "Listopadzie", "Grudniu"
  ];
  const currentMonthLocative = monthNamesLocative[now.getMonth()];

  // --- STATS CALCULATION LOGIC ---
  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const currentWeekNumber = getWeekNumber(now);

  const weeklyStats = schedule.reduce((acc: Record<number, number>, item) => {
    if (item.hoursWorked > 0) {
        const date = new Date(item.fullDate);
        const weekNum = getWeekNumber(date);
        acc[weekNum] = (acc[weekNum] || 0) + item.hoursWorked;
    }
    return acc;
  }, {} as Record<number, number>);

  const currentWeekHours = weeklyStats[currentWeekNumber] || 0;

  let overtimeHours = 0;
  Object.values(weeklyStats).forEach((weekTotal: number) => {
      if (weekTotal > 45) {
          overtimeHours += (weekTotal - 45);
      }
  });
  overtimeHours = Number(overtimeHours.toFixed(1));
  
  // --- END LOGIC ---

  const maxHoursInSchedule = Math.max(...schedule.map(i => i.hoursWorked), 12);
  const selectedItem = schedule.find(i => i.id === selectedDayId) || todayItem || schedule[0];

  useEffect(() => {
    if (scrollRef.current && todayItem) {
      const dayIndex = schedule.findIndex(i => i.id === todayItem.id);
      if (dayIndex > -1) {
         scrollRef.current.scrollLeft = (dayIndex * 44) - (scrollRef.current.clientWidth / 2) + 22;
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center pt-6 pb-24 px-4 w-full">
      {/* Avatar Section */}
      <div className="relative mb-4 group cursor-pointer">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-full p-1 shadow-xl shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
             {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                <UserCircle size={85} className="text-gray-200" />
             )}
          </div>
        </div>
        <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Name */}
      <h2 className="text-xl font-black text-gray-900 mb-1">{user?.displayName || 'Użytkownik'}</h2>
      <p className="text-xs text-gray-400 font-medium mb-6">{user?.email}</p>
      
      {/* Stats Grid */}
      <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-blue-500 z-10">
                  <Calendar size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">W tym tygodniu</span>
              </div>
              <div className="z-10">
                  <span className="text-3xl font-black text-gray-800 tracking-tight">{currentWeekHours}</span>
                  <span className="text-sm text-gray-400 font-bold ml-1">h</span>
              </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-emerald-500 z-10">
                  <Briefcase size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">W {currentMonthLocative}</span>
              </div>
              <div className="z-10">
                  <span className="text-3xl font-black text-gray-800 tracking-tight">{totalHours}</span>
                  <span className="text-sm text-gray-400 font-bold ml-1">h</span>
              </div>
          </div>
      </div>

      {/* Interactive Chart */}
      <div className="w-full mb-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500">
                    <BarChart3 size={16} />
                 </div>
                 <h3 className="text-sm font-bold text-gray-800">Aktywność Dienna</h3>
              </div>
              
              {selectedItem && (
                 <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                    <span className="text-xs font-bold text-gray-400">{selectedItem.day} {selectedItem.monthStr}</span>
                    <div className="px-2 py-0.5 bg-gray-900 text-white rounded-full text-xs font-bold">
                       {selectedItem.hoursWorked}h
                    </div>
                 </div>
              )}
           </div>

           <div 
             ref={scrollRef}
             className="flex items-end gap-2 overflow-x-auto no-scrollbar pb-2 pt-6 h-40 scroll-smooth"
             style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
           >
              {schedule.map((item) => {
                 const heightPercent = (item.hoursWorked / maxHoursInSchedule) * 100;
                 const isSelected = selectedDayId === item.id;
                 const hasHours = item.hoursWorked > 0;
                 
                 return (
                    <button
                       key={item.id}
                       onClick={() => setSelectedDayId(item.id)}
                       className="group flex flex-col items-center gap-2 min-w-[36px] flex-shrink-0 transition-all duration-300 focus:outline-none"
                    >
                       <div className="relative w-full h-24 flex items-end justify-center">
                          <div 
                             className={`
                                w-2.5 rounded-full transition-all duration-500 ease-out relative
                                ${isSelected 
                                   ? hasHours ? 'bg-blue-500 shadow-lg shadow-blue-500/30 w-3.5' : 'bg-gray-300 w-3.5'
                                   : hasHours ? 'bg-emerald-300 group-hover:bg-emerald-400' : 'bg-gray-100 group-hover:bg-gray-200'}
                             `}
                             style={{ height: `${hasHours ? heightPercent : 15}%` }}
                          >
                             {isSelected && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded-md whitespace-nowrap z-10 animate-in zoom-in-95 duration-200">
                                   {item.hoursWorked}h
                                   <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                                </div>
                             )}
                          </div>
                       </div>
                       <span className={`
                          text-[10px] font-bold transition-colors duration-300
                          ${isSelected ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-500'}
                       `}>
                          {item.day}
                       </span>
                    </button>
                 );
              })}
           </div>
        </div>
      </div>

      {/* Summary */}
      <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                      <Clock size={20} />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Łącznie przepracowane</p>
                      <p className="text-lg font-black text-gray-800">{totalHours} <span className="text-sm text-gray-400 font-bold">h</span></p>
                  </div>
              </div>
          </div>
          <div className="p-5 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${overtimeHours > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                      <TrendingUp size={20} />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Nadgodziny</p>
                      <p className={`text-lg font-black ${overtimeHours > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
                          {overtimeHours} <span className={`text-sm font-bold ${overtimeHours > 0 ? 'text-amber-500' : 'text-gray-400'}`}>h</span>
                      </p>
                  </div>
              </div>
              {overtimeHours > 0 && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider">
                      Przekroczono
                  </span>
              )}
          </div>
      </div>

      {/* Menu Options */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-rose-50 transition-colors group"
         >
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-100">
                  <LogOut size={18} />
               </div>
               <span className="font-medium text-rose-600 text-sm">Wyloguj się</span>
            </div>
         </button>
      </div>

      <p className="mt-8 text-[10px] text-gray-300 font-medium">Boon&Breg v2.0 (Cloud)</p>
    </div>
  );
};

export default ProfileView;
