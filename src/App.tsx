import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import OffersPage from './components/OffersPage';
import ContactPage from './components/ContactPage';
import SaisieDonneesTerrain from './components/SaisieDonneesTerrain';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'accueil' | 'offres' | 'contact' | 'terrain'>('accueil');

  // Render correct page
  const renderPage = () => {
    switch (currentPage) {
      case 'accueil':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'offres':
        return <OffersPage />;
      case 'contact':
        return <ContactPage />;
      case 'terrain':
        return <SaisieDonneesTerrain />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* FIXED NAVIGATION */}
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* MAIN LAYOUT WRAPPER */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* GLOBAL FOOTER */}
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
