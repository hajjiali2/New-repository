import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { Profile } from './lib/types';
import { getMyProfile } from './lib/api/profile';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Solutions from './components/Solutions';
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import BusinessDashboard from './components/business/BusinessDashboard';
import ChatTool from './components/tools/ChatTool';
import WriterTool from './components/tools/WriterTool';
import TranslatorTool from './components/tools/TranslatorTool';
import AnalyzerTool from './components/tools/AnalyzerTool';
import SummarizerTool from './components/tools/SummarizerTool';
import IdeaGeneratorTool from './components/tools/IdeaGeneratorTool';

type View =
  | 'landing' | 'dashboard' | 'admin' | 'business'
  | 'chat' | 'writer' | 'translator' | 'analyzer' | 'summarizer' | 'ideagenerator';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [view, setView] = useState<View>('landing');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    getMyProfile().then(setProfile).catch(() => setProfile(null));
  }, [user]);

  useEffect(() => {
    const handler = () => setShowAuth(true);
    document.addEventListener('open-auth', handler);
    return () => document.removeEventListener('open-auth', handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setView('landing');
  };

  const handleAuthClick = () => setShowAuth(true);
  const handleAuthSuccess = () => setShowAuth(false);
  const handleNavigate = (section: string) => setActiveSection(section);
  const handleOpenTool = (tool: string) => setView(tool as View);
  const handleBackToDashboard = () => setView('dashboard');
  const handleBackToLanding = () => setView('landing');
  const handleGoToDashboard = () => setView('dashboard');
  const handleGoToAdmin = () => setView('admin');
  const handleGoToBusiness = () => setView('business');
  const isAdmin = profile?.role === 'admin';

  if (view === 'chat') return <ChatTool onBack={handleBackToDashboard} />;
  if (view === 'writer') return <WriterTool onBack={handleBackToDashboard} />;
  if (view === 'translator') return <TranslatorTool onBack={handleBackToDashboard} />;
  if (view === 'analyzer') return <AnalyzerTool onBack={handleBackToDashboard} />;
  if (view === 'summarizer') return <SummarizerTool onBack={handleBackToDashboard} />;
  if (view === 'ideagenerator') return <IdeaGeneratorTool onBack={handleBackToDashboard} />;

  if (view === 'admin' && isAdmin) return <AdminDashboard onBack={handleBackToLanding} />;
  if (view === 'business') return <BusinessDashboard user={user} onBack={handleBackToLanding} />;

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#060f33]">
        <Navbar
          activeSection=""
          onNavigate={() => {}}
          user={user}
          isAdmin={isAdmin}
          onAuthClick={handleAuthClick}
          onSignOut={handleSignOut}
          onDashboard={handleGoToDashboard}
          onAdmin={handleGoToAdmin}
          onBusiness={handleGoToBusiness}
        />
        <Dashboard user={user} onOpenTool={handleOpenTool} onBack={handleBackToLanding} />
        {showAuth && <Auth onClose={handleAuthSuccess} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060f33]">
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        user={user}
        isAdmin={isAdmin}
        onAuthClick={handleAuthClick}
        onSignOut={handleSignOut}
        onDashboard={handleGoToDashboard}
        onAdmin={handleGoToAdmin}
        onBusiness={handleGoToBusiness}
      />
      <main>
        <Hero onNavigate={handleNavigate} onDashboard={handleGoToDashboard} user={user} />
        <Features />
        <Solutions />
        <Pricing onAuthClick={handleAuthClick} />
        <Contact />
      </main>
      <Footer />
      {showAuth && <Auth onClose={handleAuthSuccess} />}
    </div>
  );
}
