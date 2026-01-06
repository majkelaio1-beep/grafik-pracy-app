import React from 'react';
import { auth } from '../firebase';

const Header: React.FC = () => {
  const user = auth.currentUser;
  const firstName = user?.displayName?.split(' ')[0] || 'Użytkowniku';

  return (
    <header className="w-full pt-safe bg-white/80 backdrop-blur-lg border-b border-gray-100 z-50">
      <div className="px-5 py-4 flex items-center justify-between">
        
        {/* Left: Animated Company Branding */}
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0 duration-300">
              <span className="text-white font-black text-sm leading-none">B&B</span>
           </div>
           <div className="flex flex-col justify-center">
             <span className="text-lg font-black text-gray-800 tracking-tight uppercase leading-none">
               Boon<span className="text-blue-600 inline-block animate-bounce">.</span>Breg
             </span>
           </div>
        </div>
        
        {/* Right: User Greeting */}
        <div className="flex items-center">
          <h1 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
            Cześć, {firstName} <span className="animate-pulse">👋</span>
          </h1>
        </div>

      </div>
    </header>
  );
};

export default Header;
