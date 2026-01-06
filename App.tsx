import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ScheduleCard from './components/ScheduleCard';
import BottomNav from './components/BottomNav';
import CalendarView from './components/CalendarView';
import ProfileView from './components/ProfileView';
import LoginView from './components/LoginView';
import AdminDashboard from './components/AdminDashboard';
import { generateScheduleData } from './constants';
import { AlertCircle } from 'lucide-react';
import { ScheduleItem } from './types';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
            setIsAdmin(currentUser.email === 'majkelaio1@gmail.com');
      
      if (currentUser) {
        // User logged in -> Load data from Firestore
        setDataLoading(true);
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().schedule) {
            // Load existing schedule
            setSchedule(docSnap.data().schedule);
          } else {
            // New user or no data -> Generate default and save
            const defaultData = generateScheduleData();
            setSchedule(defaultData);
            await setDoc(docRef, { schedule: defaultData }, { merge: true });
          }
        } catch (e) {
          console.error("Error loading data:", e);
          // Fallback
          setSchedule(generateScheduleData());
        } finally {
            setDataLoading(false);
        }
      } else {
        // Logged out
        setSchedule([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save to Firestore whenever schedule changes (with debounce could be better, but direct is fine for low frequency)
  useEffect(() => {
    if (!user || schedule.length === 0) return;

    const saveToFirestore = async () => {
        try {
            const docRef = doc(db, 'users', user.uid);
            await setDoc(docRef, { schedule: schedule }, { merge: true });
        } catch (e) {
            console.error("Error saving data:", e);
        }
    };

    // Small timeout to avoid blocking UI
    const timeout = setTimeout(saveToFirestore, 500);
    return () => clearTimeout(timeout);
  }, [schedule, user]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update hours for a specific day
  const handleUpdateHours = (id: string, newHours: number) => {
    setSchedule(prev => prev.map(item => 
      item.id === id ? { ...item, hoursWorked: newHours } : item
    ));
  };

  // Update note for a specific day
  const handleUpdateNote = (id: string, newNote: string) => {
    setSchedule(prev => prev.map(item => 
      item.id === id ? { ...item, note: newNote } : item
    ));
  };

  // Calculate total hours
  const totalHoursWorked = Number(schedule.reduce((acc, curr) => acc + (curr.hoursWorked || 0), 0).toFixed(1));

  // Auto-scroll to "Today" on home tab
  useEffect(() => {
    if (activeTab === 'home' && !isTransitioning && !dataLoading) {
      const timer = setTimeout(() => {
          const todayElement = document.querySelector('.ring-blue-400');
          if (todayElement) {
              todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [activeTab, isTransitioning, dataLoading]);

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tabId);
      setIsTransitioning(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }, 500);
  };

  const handleCardClick = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const renderContent = () => {
    if (activeTab === 'calendar') {
      return <CalendarView schedule={schedule} />;
    }

    if (activeTab === 'alerts') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-20"></div>
             <div className="relative w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center shadow-inner">
               <AlertCircle size={40} className="text-rose-400" />
             </div>
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2">Brak Alertów</h2>
          <p className="text-sm font-medium text-gray-500 max-w-[200px]">Twoje powiadomienia są puste. Miłego dnia!</p>
        </div>
      );
    }

    if (activeTab === 'profile') {
      return <ProfileView totalHours={totalHoursWorked} schedule={schedule} />;
    }
    
    // Default Home View (List)
    const now = new Date();
    const monthNamesNominative = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
    const currentHeaderTitle = `${monthNamesNominative[now.getMonth()]} ${now.getFullYear()}`;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-end px-2 pt-2">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
            {currentHeaderTitle}
          </h2>
        </div>
        
        <div className="space-y-3 pb-8">
          {schedule.map((item) => (
            <ScheduleCard 
              key={item.id} 
              item={item} 
              isOpen={expandedCardId === item.id}
              onClick={() => handleCardClick(item.id)}
              onUpdateHours={(hours) => handleUpdateHours(item.id, hours)}
              onUpdateNote={(note) => handleUpdateNote(item.id, note)}
            />
          ))}
        </div>
        
        <div className="text-center pb-8 opacity-40">
           <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-2"></div>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Koniec Harmonogramu</p>
        </div>
      </div>
    );
  };

  // --- RENDERING ---

  if (authLoading) {
     return (
        <div className="h-[100dvh] w-full flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl"></div>
            </div>
        </div>
     );
  }

  return (
    // Fixed layout container
    <div className="h-[100dvh] w-full flex justify-center bg-gray-50 md:bg-gray-100 md:items-center md:py-10 overflow-hidden">
      
      <div className="w-full h-full md:h-[850px] md:max-w-[400px] bg-gray-50 md:bg-white md:rounded-[40px] md:shadow-2xl md:border-8 md:border-white overflow-hidden flex flex-col relative">
        
        {/* CONDITIONAL RENDER: LOGIN VS APP */}
        {!user ? (
            <LoginView />
        ) : (
            <>
                {/* Header - Static */}
                <div className="flex-none z-40 relative">
                  <Header />
                </div>

                {/* Main Content Area */}
                <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {isTransitioning || dataLoading ? (
                     <div className="flex flex-col h-full items-center justify-center pb-20 animate-in fade-in duration-300">
                       <div className="flex flex-col items-center gap-4 animate-pulse">
                          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl flex items-center justify-center rotate-3 ring-4 ring-blue-50">
                             <span className="text-white font-black text-2xl">B&B</span>
                          </div>
                          <div className="flex items-baseline mt-2">
                             <h1 className="text-3xl font-black text-gray-800 tracking-tighter">
                               Boon<span className="text-blue-600 inline-block animate-bounce">.</span>Breg
                             </h1>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-2">
                              {dataLoading ? 'Synchronizacja' : 'Przetwarzanie'}
                          </p>
                       </div>
                     </div>
                  ) : (
                     <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                        {renderContent()}
                     </div>
                  )}
                </div>

                {/* Bottom Nav */}
                <div className="absolute bottom-0 left-0 right-0 z-50">
                  <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default App;
