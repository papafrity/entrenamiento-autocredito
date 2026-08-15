import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RoleplayChat from './components/RoleplayChat';
import CarSchedule from './components/CarSchedule';
import TeamLeaderboard from './components/TeamLeaderboard';
import WhatsappGenerator from './components/WhatsappGenerator';
import PlanCalculator from './components/PlanCalculator';
import QuickObjectionsGame from './components/QuickObjectionsGame';
import ObjectionsGuide from './components/ObjectionsGuide';
import SettingsModal from './components/SettingsModal';
import FeedbackModal from './components/FeedbackModal';
import { getApiKey } from './services/geminiService';
import { awardPointsToCurrentUser } from './services/storageService';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = () => {
    const key = getApiKey();
    setHasApiKey(Boolean(key && key.trim().length > 0));
  };

  const handleShowFeedback = (feedbackData, profileData) => {
    setCurrentFeedback(feedbackData);
    setCurrentProfile(profileData);
    setIsFeedbackOpen(true);

    // Sumar puntos al ranking del equipo y desbloquear medalla si sacó buen puntaje
    if (feedbackData?.score) {
      let badgeToUnlock = null;
      if (feedbackData.score >= 80) {
        badgeToUnlock = profileData.id + '_master';
      }
      awardPointsToCurrentUser(feedbackData.score, badgeToUnlock);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Top Bar Header */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasApiKey={hasApiKey}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'chat' && (
          <RoleplayChat 
            hasApiKey={hasApiKey}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onShowFeedback={handleShowFeedback}
          />
        )}

        {activeTab === 'car' && (
          <CarSchedule />
        )}

        {activeTab === 'team' && (
          <TeamLeaderboard />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsappGenerator 
            hasApiKey={hasApiKey}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'calculator' && (
          <PlanCalculator />
        )}

        {activeTab === 'flash' && (
          <QuickObjectionsGame />
        )}

        {activeTab === 'guide' && (
          <ObjectionsGuide />
        )}
      </main>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeySaved={checkApiKeyStatus}
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
