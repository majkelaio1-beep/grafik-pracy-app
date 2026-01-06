import React from 'react';
import { Home, CalendarDays, Bell, User, Users } from 'lucide-react';
interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
    isAdmin?: boolean;
  onAdminClick?: () => void;
}

const BottomNav: React.FC<BottomNav= ({ activeTab, onTabChange, isAdmin, onAdminClick }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Start' },
    { id: 'calendar', icon: CalendarDays, label: 'Grafik' },
        ...(isAdmin ? [{ id: 'admin', icon: Users, label: 'Admin' }] : []),
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  const activeIndex = navItems.findIndex(item => item.id === activeTab);

    const handleTabClick = (tabId: string) => {
    if (tabId === 'admin' && onAdminClick) {
      onAdminClick();
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100 px-4 pt-2 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-50 w-full">
      {/* Container - Grid ensures equal spacing for the sliding calculation */}
      <div className="relative grid grid-cols-4 max-w-sm mx-auto">
        
        {/* Animated Sliding Background "Pill" */}
        {/* We translate the X position based on 100% of the column width * index */}
        <div 
          className="absolute top-0 bottom-0 w-1/4 py-1 px-1 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
          style={{ 
            transform: `translateX(${activeIndex * 100}%)` 
          }}
        >
          <div className="w-full h-full bg-blue-50/80 rounded-2xl shadow-sm border border-blue-100/50"></div>
        </div>

        {/* Navigation Items */}
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="group relative flex flex-col items-center justify-center h-16 rounded-2xl transition-all duration-200 active:scale-95 z-10"
            >
              <div className={`
                relative p-1 transition-all duration-300 transform
                ${isActive ? '-translate-y-1 text-blue-600 scale-110' : 'text-gray-400 group-hover:text-gray-600'}
              `}>
                <item.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-all duration-300"
                />
              </div>
              
              <span className={`
                absolute bottom-2 text-[10px] font-bold tracking-wide transition-all duration-300 transform origin-bottom
                ${isActive 
                  ? 'text-blue-600 opacity-100 scale-100 translate-y-0' 
                  : 'text-gray-400 opacity-0 scale-75 translate-y-2'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
