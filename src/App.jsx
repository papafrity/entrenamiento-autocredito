import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RoleplayChat from './components/RoleplayChat';
import CarSchedule from './components/CarSchedule';
import WhatsappGenerator from './components/WhatsappGenerator';
import PlanCalculator from './components/PlanCalculator';
import PaymentSeasonTimer from './components/PaymentSeasonTimer';
import CommissionCalculator from './components/CommissionCalculator';
import SupervisorDashboard from './components/SupervisorDashboard';
import FeedbackModal from './components/FeedbackModal';
import AdvisorAuthModal from './components/AdvisorAuthModal';
import KnowledgeHub from './components/KnowledgeHub';
import ActivitiesHub from './components/ActivitiesHub';
import SettingsPanel from './components/SettingsPanel';
import InstallPwaButton from './components/InstallPwaButton';
import { getCurrentUserProfile, awardPointsToCurrentUser, subscribeToRealtimeUpdates, syncFromCloud } from './services/storageService';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('autocredito_active_tab') || 'calculator');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUserProfile());
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    syncFromCloud();

    const unsubscribe = subscribeToRealtimeUpdates((event) => {
      if (event.type === 'USER_SWITCHED' || event.type === 'TEAM_UPDATED') {
        loadCurrentUser();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('autocredito_active_tab', activeTab);
  }, [activeTab]);

  // Migrar tabs legacy a nuevos IDs
  useEffect(() => {
    const legacyMap = { pitch: 'activities', flash: 'activities', team: 'activities', guide: 'knowledge', tips: 'knowledge' };
    if (legacyMap[activeTab]) setActiveTab(legacyMap[activeTab]);
  }, []);

  const loadCurrentUser = () => {
    setCurrentUser(getCurrentUserProfile());
  };

  const handleShowFeedback = (feedbackData, profileData) => {
    setCurrentFeedback(feedbackData);
    setCurrentProfile(profileData);
    setIsFeedbackOpen(true);

    if (feedbackData?.score) {
      let badgeToUnlock = null;
      if (feedbackData.score >= 80) {
        badgeToUnlock = profileData.id + '_master';
      }
      awardPointsToCurrentUser(feedbackData.score, badgeToUnlock);
      loadCurrentUser();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Top Bar Header */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Widget de Temporada y Cierre de Pagos / Sorteo */}
      <PaymentSeasonTimer />

      {/* Banner instalar app */}
      <InstallPwaButton />

      {/* Main View Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'calculator' && <PlanCalculator />}
        {activeTab === 'knowledge' && <KnowledgeHub />}
        {activeTab === 'car' && <CarSchedule onOpenAuthModal={() => setIsAuthModalOpen(true)} />}
        {activeTab === 'whatsapp' && <WhatsappGenerator />}
        {activeTab === 'chat' && <RoleplayChat onShowFeedback={handleShowFeedback} />}
        {activeTab === 'activities' && <ActivitiesHub onPointsAwarded={loadCurrentUser} onOpenAuthModal={() => setIsAuthModalOpen(true)} />}
        {activeTab === 'commissions' && <CommissionCalculator />}
        {activeTab === 'supervisor' && <SupervisorDashboard />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>

      {/* Modals */}
      <AdvisorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAdvisorChanged={loadCurrentUser}
      />

      <FeedbackModal 
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        feedback={currentFeedback}
        profile={currentProfile}
        onRestartSession={() => setIsFeedbackOpen(false)}
      />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '14px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        background: 'rgba(0,0,0,0.2)'
      }}>
        AutoCrédito Hub IA — Plataforma integral de ventas, entrenamiento y coordinación de equipo.
      </footer>

    </div>
  );
}
