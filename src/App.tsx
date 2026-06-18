import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import OffersPage from './components/OffersPage';
import ContactPage from './components/ContactPage';
import SaisieDonneesTerrain from './components/SaisieDonneesTerrain';
import RoleDashboard from './components/RoleDashboard';
import MeteoPage from './components/MeteoPage';
import AuthModal from './components/AuthModal';
import { User } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'accueil' | 'offres' | 'meteo' | 'contact' | 'terrain' | 'dashboard'>('accueil');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Load user session on load
  useEffect(() => {
    const saved = localStorage.getItem('microfin_user');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error("Erreur de décodage de l'utilisateur", e);
      }
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // If field agent logged-in, redirect to terrain, otherwise redirect to dashboard
    if (user.role === 'AGENT') {
      setCurrentPage('terrain');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('microfin_user');
    setCurrentUser(null);
    setCurrentPage('accueil');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('microfin_user', JSON.stringify(updatedUser));
    
    // Also update in all users directory
    const allUsers = JSON.parse(localStorage.getItem('microfin_all_users') || '[]');
    const index = allUsers.findIndex((u: any) => u.id === updatedUser.id);
    if (index !== -1) {
      allUsers[index] = updatedUser;
    } else {
      allUsers.push(updatedUser);
    }
    localStorage.setItem('microfin_all_users', JSON.stringify(allUsers));
  };

  // Render correct page
  const renderPage = () => {
    switch (currentPage) {
      case 'accueil':
        return <HomePage setCurrentPage={setCurrentPage} currentUser={currentUser} onTriggerLogin={() => setAuthModalOpen(true)} />;
      case 'offres':
        return (
          <OffersPage 
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser} 
            onTriggerLogin={() => setAuthModalOpen(true)}
          />
        );
      case 'meteo':
        return (
          <MeteoPage 
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'contact':
        return <ContactPage />;
      case 'terrain':
        return <SaisieDonneesTerrain />;
      case 'dashboard':
        if (currentUser) {
          return (
            <RoleDashboard 
              user={currentUser} 
              onUpdateUser={handleUpdateUser} 
              setCurrentPage={setCurrentPage} 
            />
          );
        } else {
          return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-150 text-center space-y-4">
              <span className="text-4xl block">🛡️</span>
              <h3 className="text-lg font-black text-slate-900">Espace Privé Réservé</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Veuillez vous connecter ou vous inscrire pour accéder à votre espace personnalisé (tontines, demandes de micro-crédits, gestion locale).
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-3 bg-primary hover:bg-[#1A7A3E] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer"
              >
                Se connecter / S'inscrire 🔑
              </button>
            </div>
          );
        }
      default:
        return <HomePage setCurrentPage={setCurrentPage} currentUser={currentUser} onTriggerLogin={() => setAuthModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* FIXED NAVIGATION */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        currentUser={currentUser}
        onTriggerLogin={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* MAIN LAYOUT WRAPPER */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* GLOBAL FOOTER */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* COMPREHENSIVE REGISTRATION AND LOGIN SYSTEM */}
      {authModalOpen && (
        <AuthModal 
          onClose={() => setAuthModalOpen(false)} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

