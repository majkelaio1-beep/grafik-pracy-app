import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ScheduleItem } from '../types';
import { Users, ArrowLeft, Save } from 'lucide-react';
import ScheduleCard from './ScheduleCard';

interface User {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  schedule: ScheduleItem[];
}

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedSchedule, setEditedSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList: User[] = [];
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          uid: doc.id,
          displayName: data.displayName || 'Bez nazwy',
          email: data.email || '',
          role: data.role || 'user',
          schedule: data.schedule || []
        });
      });
      
      setUsers(usersList);
      setLoading(false);
    } catch (error) {
      console.error('B\u0142\u0105d \u0142adowania u\u017cytkownik\u00f3w:', error);
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setEditedSchedule([...user.schedule]);
  };

  const handleScheduleUpdate = (date: string, updates: Partial<ScheduleItem>) => {
    setEditedSchedule(prev => 
      prev.map(item => 
        item.date === date ? { ...item, ...updates } : item
      )
    );  };

  const handleSaveSchedule = async () => {
    if (!selectedUser) return;
    
    setSaving(true);
    try {
      const userRef = doc(db, 'users', selectedUser.uid);
      await updateDoc(userRef, {
        schedule: editedSchedule
      });
      
      setUsers(prev => prev.map(u => 
        u.uid === selectedUser.uid 
          ? { ...u, schedule: editedSchedule }
          : u
      ));
      
      alert('Grafik zosta\u0142 zaktualizowany!');
      setSelectedUser(null);
    } catch (error) {
      console.error('B\u0142\u0105d zapisu:', error);
      alert('Wyst\u0105pi\u0142 b\u0142\u0105d podczas zapisywania');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedUser(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>Powr\u00f3t</span>
            </button>
            <div className="text-center flex-1">
              <h2 className="text-lg font-bold text-gray-900">{selectedUser.displayName}</h2>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>
            <button
              onClick={handleSaveSchedule}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Zapisuj\u0119...' : 'Zapisz'}
            </button>
          </div>
        </div>
        <div className="px-4 py-6 space-y-3">
          {editedSchedule.map((item) => (
            <ScheduleCard
              key={item.date}
              item={item}
              isOpen={false}
              onClick={() => {}}
              onUpdateHours={(hours) => handleScheduleUpdate(item.date, { hoursWorked: hours })}
              onUpdateNote={(note) => handleScheduleUpdate(item.date, { note })}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:opacity-80"
        >
          <ArrowLeft size={20} />
          <span>Powr\u00f3t</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel Admina</h1>
            <p className="text-blue-100">Zarz\u0105dzaj grafikami pracownik\u00f3w</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          U\u017cytkownicy ({users.length})
        </h2>
        {users.map((user) => (
          <button
            key={user.uid}
            onClick={() => handleUserSelect(user)}
            className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.role === 'admin' ? 'Admin' : 'Pracownik'}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
