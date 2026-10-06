import React, { useState } from 'react';
import { I18nProvider, useI18n } from './context/I18nContext';
import { ProposalProvider, useProposal } from './context/ProposalContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { Toast, ToastMessage } from './components/Toast';
import { RightEvidenceInspector } from './components/RightEvidenceInspector';

// Dedicated Views
import { LoginSignupView } from './views/LoginSignupView';
import { RequirementVerificationView } from './views/RequirementVerificationView';
import { OutputsDeliverablesView } from './views/OutputsDeliverablesView';
import { DashboardView } from './views/DashboardView';
import { RequirementsView } from './views/RequirementsView';
import { ComplianceView } from './views/ComplianceView';
import { EvidenceView } from './views/EvidenceView';
import { ProductsView } from './views/ProductsView';
import { ClarificationsView } from './views/ClarificationsView';
import { ValidationQueueView } from './views/ValidationQueueView';
import { NewProposalView } from './views/NewProposalView';
import { BenchmarkView } from './views/BenchmarkView';

const MainLayout: React.FC = () => {
  const { t } = useI18n();
  const { activeProposal, requirements, setActiveRequirement } = useProposal();
  const { isAuthenticated } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState<boolean>(false);
  const [activeEvidenceCitation, setActiveEvidenceCitation] = useState<any>(null);

  // Notification Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSelectRequirement = (reqId: string) => {
    const found = requirements.find(r => r.id === reqId);
    if (found) {
      setActiveRequirement(found);
      setCurrentTab('requirements');
    }
  };

  const handleOpenEvidence = (citation: any) => {
    setActiveEvidenceCitation(citation);
    setIsEvidenceDrawerOpen(true);
  };

  // If user is not logged in, show Login & Signup view
  if (!isAuthenticated) {
    return (
      <>
        <LoginSignupView onSuccess={() => addToast('Welcome to IQSEC Platform.', 'success')} />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-[100dvh] flex bg-[#f8fafc] text-slate-900 font-sans antialiased overflow-hidden">
      {/* 1. LEFT SIDEBAR */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewProposal={() => setCurrentTab('new_proposal')}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. CENTER WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        {/* Top Header */}
        <TopHeader
          onSaveDraft={() => addToast('Borrador de propuesta guardado exitosamente.', 'success')}
          onCancel={() => addToast('Operación cancelada.', 'info')}
          onNewProposal={() => setCurrentTab('new_proposal')}
        />

        {/* Dynamic Tab Views */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setCurrentTab}
              onSelectRequirement={handleSelectRequirement}
            />
          )}

          {currentTab === 'requirements' && (
            <RequirementVerificationView
              onOpenEvidenceDrawer={handleOpenEvidence}
              onNotify={addToast}
            />
          )}

          {currentTab === 'compliance' && (
            <ComplianceView onSelectRequirement={handleSelectRequirement} />
          )}

          {currentTab === 'evidence' && <EvidenceView />}

          {currentTab === 'products' && <ProductsView />}

          {currentTab === 'clarifications' && <ClarificationsView />}

          {currentTab === 'validation' && (
            <ValidationQueueView onNotify={addToast} />
          )}

          {currentTab === 'benchmark' && (
            <BenchmarkView activeProposal={activeProposal} />
          )}

          {currentTab === 'outputs' && (
            <OutputsDeliverablesView onNotify={addToast} />
          )}

          {currentTab === 'new_proposal' && (
            <NewProposalView
              onNotify={addToast}
              onProposalCreated={(id) => {
                setCurrentTab('requirements');
              }}
            />
          )}
        </div>
      </div>

      {/* 3. RIGHT EVIDENCE INSPECTOR DRAWER */}
      <RightEvidenceInspector
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        onNotify={addToast}
      />

      {/* Toast Notification Stack */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <AuthProvider>
        <ProposalProvider>
          <MainLayout />
        </ProposalProvider>
      </AuthProvider>
    </I18nProvider>
  );
};

export default App;
