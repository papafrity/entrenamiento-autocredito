import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RoleplayChat from './components/RoleplayChat';
import CarSchedule from './components/CarSchedule';
import TeamLeaderboard from './components/TeamLeaderboard';
import WhatsappGenerator from './components/WhatsappGenerator';
import PlanCalculator from './components/PlanCalculator';
import QuickObjectionsGame from './components/QuickObjectionsGame';
import ObjectionsGuide from './components/ObjectionsGuide';
import SalesTips from './components/SalesTips';
import PaymentSeasonTimer from './components/PaymentSeasonTimer';
import ElevatorPitch from './components/ElevatorPitch';
import CommissionCalculator from './components/CommissionCalculator';
import SupervisorDashboard from './components/SupervisorDashboard';
import FeedbackModal from './components/FeedbackModal';
import AdvisorAuthModal from './components/AdvisorAuthModal';
import { getCurrentUserProfile, awardPointsToCurrentUser, subscribeToRealtimeUpdates, syncFromCloud } from './services/storageService';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUserProfile());
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    syncFromCloud(); // Sincroniza asesores y reservas automáticamente al iniciar

    const unsubscribe = subscribeToRealtimeUpdates((event) => {
      if (event.type === 'USER_SWITCHED' || event.type === 'TEAM_UPDATED') {
        loadCurrentUser();
      }
    });
    return () => unsubscribe();
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

      {/* Main View Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'chat' && (
          <RoleplayChat 
            onShowFeedback={handleShowFeedback}
          />
        )}

        {activeTab === 'pitch' && (
          <ElevatorPitch 
            onPointsAwarded={loadCurrentUser}
          />
        )}

        {activeTab === 'car' && (
          <CarSchedule 
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'team' && (
          <TeamLeaderboard 
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsappGenerator />
        )}

        {activeTab === 'calculator' && (
          <PlanCalculator />
        )}

        {activeTab === 'commissions' && (
          <CommissionCalculator />
        )}

        {activeTab === 'flash' && (
          <QuickObjectionsGame />
        )}

        {activeTab === 'guide' && (
          <ObjectionsGuide />
        )}

        {activeTab === 'tips' && (
          <SalesTips />
        )}

        {activeTab === 'supervisor' && (
          <SupervisorDashboard />
        )}
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
