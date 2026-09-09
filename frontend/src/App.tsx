import React from 'react';
import { InvestigationProvider, useInvestigation } from './context/InvestigationContext';
import { AppShell } from './components/app-shell/AppShell';

// Route Pages
import { LoginPage } from './pages/Login/LoginPage';
import { OnboardingPage } from './pages/Onboarding/OnboardingPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { InvestigationsPage } from './pages/Investigations/InvestigationsPage';
import { InvestigationWorkspacePage } from './pages/InvestigationWorkspace/InvestigationWorkspacePage';
import { EntitiesPage } from './pages/Entities/EntitiesPage';
import { EntityDetailPage } from './pages/Entities/EntityDetailPage';
import { NetworkPage } from './pages/Network/NetworkPage';
import { EvidencePage } from './pages/Evidence/EvidencePage';
import { TimelinePage } from './pages/Timeline/TimelinePage';
import { AIPage } from './pages/AI/AIPage';
import { MonitoringPage } from './pages/Monitoring/MonitoringPage';
import { AlertsPage } from './pages/Alerts/AlertsPage';
import { DocumentsPage } from './pages/Documents/DocumentsPage';
import { ObfuscationPage } from './pages/Obfuscation/ObfuscationPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

const AppContent: React.FC = () => {
  const { currentRoute, isAuthenticated } = useInvestigation();

  // Route 1: Login / Landing
  if (currentRoute === '/login' || (!isAuthenticated && currentRoute !== '/onboarding')) {
    return <LoginPage />;
  }

  // Route 2: Onboarding
  if (currentRoute === '/onboarding') {
    return <OnboardingPage />;
  }

  // Route resolution inside the application shell
  const renderRoute = () => {
    // Route 4 & 5: Investigations & Workspace
    if (currentRoute.startsWith('/investigations/')) {
      const caseId = currentRoute.replace('/investigations/', '');
      return <InvestigationWorkspacePage caseId={caseId} />;
    }
    if (currentRoute === '/investigations') {
      return <InvestigationsPage />;
    }

    // Route 6 & 7: Entities & Entity Detail
    if (currentRoute.startsWith('/entities/')) {
      const entityId = currentRoute.replace('/entities/', '');
      return <EntityDetailPage entityId={entityId} />;
    }
    if (currentRoute.startsWith('/entities')) {
      return <EntitiesPage />;
    }

    // Route 8: Network
    if (currentRoute.startsWith('/network')) {
      return <NetworkPage />;
    }

    // Route 9: Evidence
    if (currentRoute.startsWith('/evidence/')) {
      const evId = currentRoute.replace('/evidence/', '');
      return <EvidencePage evidenceId={evId} />;
    }
    if (currentRoute.startsWith('/evidence')) {
      return <EvidencePage />;
    }

    // Route 10: Timeline
    if (currentRoute.startsWith('/timeline')) {
      return <TimelinePage />;
    }

    // Route 11: AI Assistant
    if (currentRoute.startsWith('/ai')) {
      return <AIPage />;
    }

    // Route 12: 24-Hour Watch
    if (currentRoute.startsWith('/monitoring')) {
      return <MonitoringPage />;
    }

    // Route 13: Alerts
    if (currentRoute.startsWith('/alerts')) {
      return <AlertsPage />;
    }

    // Route 14: Documents & Sources
    if (currentRoute.startsWith('/documents')) {
      return <DocumentsPage />;
    }

    // Route 15: Obfuscation
    if (currentRoute.startsWith('/obfuscation')) {
      return <ObfuscationPage />;
    }

    // Route 16: Reports
    if (currentRoute.startsWith('/reports')) {
      return <ReportsPage />;
    }

    // Route 17: Settings
    if (currentRoute.startsWith('/settings')) {
      return <SettingsPage />;
    }

    // Route 3: Command Center / Dashboard (Default)
    return <DashboardPage />;
  };

  return <AppShell>{renderRoute()}</AppShell>;
};

export default function App() {
  return (
    <InvestigationProvider>
      <AppContent />
    </InvestigationProvider>
  );
}
