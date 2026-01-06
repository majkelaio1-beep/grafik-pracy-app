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
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';

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
  
  // Admin-specific states
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      const adminEmail = 'majkelaio1@gmail.com';
      const isAdminUser = currentUser?.email === adminEmail;
      setIsAdmin(isAdminUser);
      
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
            // New user -> Start with empty schedule (0 hours)
            const defaultData: ScheduleItem[] = [];
            setSchedule(defaultData);
            await setDoc(docRef, { 
              email: currentUser.email,
              schedule: defaultData,
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
          
          // If admin, load all users
          if (isAdminUser) {
            await loadAllUsers();
          }
        } catch (e) {
          console.error("Error loading data:", e);
          // Fallback
          setSchedule([]);
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

  // Load all users for admin
  const loadAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(usersData);
    } catch (e) {
      console.error("Error loading users:", e);
    }
  };

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

    saveToFirestore();
  }, [schedule, user]);

  const handleExpandCard = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const handleTabChange = (tab: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  // Admin view
  if (isAdmin && activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          userName={user.email?.split('@')[0] || 'Admin'} 
          onLogout={() => auth.signOut()} 
        />
        <AdminDashboard 
          allUsers={allUsers}
          onRefresh={loadAllUsers}
        />
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          isAdmin={isAdmin}
        />
      </div>
    );
  }

  // Regular user view or admin in user mode
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        userName={user.email?.split('@')[0] || 'Użytkownik'} 
        onLogout={() => auth.signOut()} 
      />
      
      {dataLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Wczytywanie danych...</p>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`transition-opacity duration-150 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {activeTab === 'home' && (
              <div className="p-4 space-y-4">
                {schedule.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak grafiku</h3>
                    <p className="text-gray-600">Nie masz jeszcze żadnych zaplanowanych zmian.</p>
                  </div>
                ) : (
                  schedule.map((item) => (
                    <ScheduleCard
                      key={item.id}
                      {...item}
                      isExpanded={expandedCardId === item.id}
                      onExpand={() => handleExpandCard(item.id)}
                    />
                  ))
                )}
              </div>
            )}
            {activeTab === 'calendar' && <CalendarView schedule={schedule} />}
            {activeTab === 'profile' && (
              <ProfileView
                userName={user.email?.split('@')[0] || 'Użytkownik'}
                email={user.email || ''}
                schedule={schedule}
                isAdmin={isAdmin}
              />
            )}
          </div>
        </>
      )}
      
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default App;
