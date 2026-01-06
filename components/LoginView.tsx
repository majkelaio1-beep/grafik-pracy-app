import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Lock, Mail } from 'lucide-react';

const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener in App.tsx will handle the rest
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Nieprawidłowy email lub hasło');
      } else {
        setError('Wystąpił błąd podczas logowania');
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-in fade-in duration-700">
      
      {/* Branding */}
      <div className="mb-12 flex flex-col items-center gap-6">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl shadow-2xl shadow-blue-500/30 flex items-center justify-center rotate-3 ring-4 ring-white">
          <span className="text-white font-black text-3xl">B&B</span>
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
            Boon<span className="text-blue-600">.</span>Breg
          </h1>
          <p className="text-gray-400 font-medium tracking-wide uppercase text-xs">Twój Osobisty Grafik</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-xs bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
            <Lock size={20} />
          </div>
        </div>
        
        <h2 className="text-lg font-bold text-gray-800 mb-2">Zaloguj się</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Wprowadź swój email i hasło
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Hasło"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Zaloguj się'
            )}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-xs font-bold text-rose-500 bg-rose-50 p-2 rounded-lg">{error}</p>
        )}
      </div>

      <p className="mt-8 text-[10px] text-gray-300">Wersja v2.1 (Email/Password)</p>
    </div>
  );
};

export default LoginView;
