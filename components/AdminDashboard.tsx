import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ScheduleItem } from '../types';
import { Users, Calendar, Clock, TrendingUp, UserCheck, Edit, Trash2, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  email: string;
  schedule?: ScheduleItem[];
  createdAt?: string;
}

interface AdminDashboardProps {
  allUsers: User[];
  onRefresh: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allUsers, onRefresh }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate statistics
  const totalUsers = allUsers.length;
  const usersWithSchedules = allUsers.filter(u => u.schedule && u.schedule.length > 0).length;
  
  const totalHours = allUsers.reduce((sum, user) => {
    if (!user.schedule) return sum;
    return sum + user.schedule.reduce((userSum, item) => {
      const hours = parseFloat(item.hours) || 0;
      return userSum + hours;
    }, 0);
  }, 0);

  const avgHoursPerUser = totalUsers > 0 ? (totalHours / totalUsers).toFixed(1) : '0.0';

  const handleUserClick = (user: User) => {
    setSelectedUser(selectedUser?.id === user.id ? null : user);
  };

  const getUserHours = (user: User) => {
    if (!user.schedule) return 0;
    return user.schedule.reduce((sum, item) => {
      const hours = parseFloat(item.hours) || 0;
      return sum + hours;
    }, 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nieznana';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Panel Administracyjny</h1>
            <button
              onClick={() => {
                setLoading(true);
                onRefresh();
                setTimeout(() => setLoading(false), 1000);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Odśwież
            </button>
          </div>
          <p className="text-gray-600">Zarządzaj użytkownikami i grafikami pracy</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Wszyscy Użytkownicy</h3>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
            <p className="text-xs text-gray-500 mt-1">Zarejestrowanych</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Aktywni Użytkownicy</h3>
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{usersWithSchedules}</p>
            <p className="text-xs text-gray-500 mt-1">Z grafikiem</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Łączne Godziny</h3>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
            <p className="text-xs text-gray-500 mt-1">Wszystkich użytkowników</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Średnio</h3>
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{avgHoursPerUser}h</p>
            <p className="text-xs text-gray-500 mt-1">Na użytkownika</p>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista Użytkowników
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {allUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Brak użytkowników w systemie</p>
              </div>
            ) : (
              allUsers.map((user) => {
                const userHours = getUserHours(user);
                const scheduleCount = user.schedule?.length || 0;
                const isExpanded = selectedUser?.id === user.id;

                return (
                  <div key={user.id} className="transition-colors hover:bg-gray-50">
                    <div
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                              {user.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{user.email}</h3>
                              <p className="text-xs text-gray-500">Dołączył: {formatDate(user.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">{scheduleCount} zmian</p>
                            <p className="text-xs text-gray-500">{userHours.toFixed(1)}h łącznie</p>
                          </div>
                          <button
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserClick(user);
                            }}
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded User Details */}
                    {isExpanded && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Grafik Pracy
                        </h4>
                        {scheduleCount === 0 ? (
                          <p className="text-sm text-gray-500 italic">Brak zaplanowanych zmian</p>
                        ) : (
                          <div className="space-y-2">
                            {user.schedule?.map((item, index) => (
                              <div
                                key={index}
                                className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">{item.date}</p>
                                  <p className="text-sm text-gray-600">{item.time}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-blue-600">{item.hours}h</p>
                                  <p className="text-xs text-gray-500">{item.location}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>System zarządzania grafikiem pracy - Wersja 2.3 (Multi-User)</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
