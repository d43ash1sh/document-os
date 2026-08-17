import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './lib/database/db';
import { AuthEngine } from './lib/auth/authEngine';
import type { BusinessDocument, DocumentType } from './types';

// Components & Views
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { OnboardingWizard } from './components/OnboardingWizard';
import { DashboardView } from './features/dashboard/DashboardView';
import { ClientsView } from './features/clients/ClientsView';
import { ServicesView } from './features/services/ServicesView';
import { DocumentEditor } from './features/documents/DocumentEditor';
import { DocumentsListView } from './features/documents/DocumentsListView';
import { PaymentsView } from './features/payments/PaymentsView';
import { ReportsView } from './features/reports/ReportsView';
import { TemplatesView } from './features/templates/TemplatesView';
import { SettingsView } from './features/settings/SettingsView';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => AuthEngine.isSessionLoggedIn());
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewParam, setViewParam] = useState<string>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<BusinessDocument | null>(null);
  const [editorDefaultType, setEditorDefaultType] = useState<DocumentType>('quotation');
  const [initialDocForPayment, setInitialDocForPayment] = useState<BusinessDocument | null>(null);

  useEffect(() => {
    AuthEngine.initDefaultAuth();
  }, []);

  const clients = useLiveQuery(() => db.clients.orderBy('name').toArray(), []) || [];
  const services = useLiveQuery(() => db.services.orderBy('name').toArray(), []) || [];
  const documents = useLiveQuery(() => db.documents.orderBy('createdAt').reverse().toArray(), []) || [];
  const payments = useLiveQuery(() => db.payments.orderBy('paymentDate').reverse().toArray(), []) || [];
  const appSettings = useLiveQuery(() => db.settings.get('appSettings'), [])?.value;
  const businessProfile = useLiveQuery(() => db.settings.get('businessProfile'), [])?.value || {
    name: '', displayName: '', tagline: '', logo: '', phone: '', email: '',
    website: '', address: '', city: '', state: '', country: 'India', pin: '',
    gstin: '', pan: '', signature: ''
  };
  const paymentSettings = useLiveQuery(() => db.settings.get('paymentSettings'), [])?.value || {
    accountHolder: '', bankName: '', accountNumber: '', ifsc: '', branch: '',
    upiId: '', upiQr: '', paymentInstructions: ''
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    AuthEngine.logout();
    setIsAuthenticated(false);
  };

  const handleSelectNavView = (view: string, param?: string) => {
    setCurrentView(view);
    if (param) setViewParam(param);
    setEditingDocument(null);
    setInitialDocForPayment(null);
  };

  const handleNewDocument = (type: DocumentType = 'quotation') => {
    setEditorDefaultType(type);
    setEditingDocument(null);
    setCurrentView('document_editor');
  };

  const handleEditDocument = (doc: BusinessDocument) => {
    setEditingDocument(doc);
    setEditorDefaultType(doc.type);
    setCurrentView('document_editor');
  };

  const handleRecordPaymentForDoc = (doc: BusinessDocument) => {
    setInitialDocForPayment(doc);
    setCurrentView('payments');
  };

  const handleCommandPaletteAction = (action: string, payload?: any) => {
    if (action === 'new_quotation') handleNewDocument('quotation');
    else if (action === 'new_invoice') handleNewDocument('invoice');
    else if (action === 'new_client') handleSelectNavView('clients');
    else if (action === 'export_backup') handleSelectNavView('settings');
    else if (action === 'view_document') {
      const doc = documents.find(d => d.id === payload);
      if (doc) handleEditDocument(doc);
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {appSettings && !appSettings.onboardingCompleted && (
        <OnboardingWizard onComplete={() => setCurrentView('dashboard')} />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={handleSelectNavView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          currentView={currentView}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onNewQuotation={() => handleNewDocument('quotation')}
          onNewInvoice={() => handleNewDocument('invoice')}
          onNewClient={() => handleSelectNavView('clients')}
          onToggleMobileMenu={() => setMobileSidebarOpen(prev => !prev)}
        />

        <main style={{ flex: 1, paddingBottom: '32px' }}>
          {currentView === 'dashboard' && (
            <DashboardView
              documents={documents}
              clients={clients}
              onNewQuotation={() => handleNewDocument('quotation')}
              onNewInvoice={() => handleNewDocument('invoice')}
              onNewClient={() => handleSelectNavView('clients')}
              onViewDocument={handleEditDocument}
              onEditDocument={handleEditDocument}
            />
          )}

          {currentView === 'clients' && (
            <ClientsView
              clients={clients}
              documents={documents}
              payments={payments}
              onRefresh={() => {}}
              onSelectClientDocs={clientId => {
                setViewParam(clientId);
                setCurrentView('documents');
              }}
            />
          )}

          {currentView === 'services' && (
            <ServicesView
              services={services}
              onRefresh={() => {}}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsListView
              documents={documents}
              clients={clients}
              businessProfile={businessProfile}
              paymentSettings={paymentSettings}
              filterType={viewParam}
              onNewDocument={handleNewDocument}
              onEditDocument={handleEditDocument}
              onRecordPayment={handleRecordPaymentForDoc}
              onRefresh={() => {}}
            />
          )}

          {currentView === 'document_editor' && (
            <DocumentEditor
              initialDocument={editingDocument}
              defaultType={editorDefaultType}
              clients={clients}
              services={services}
              businessProfile={businessProfile}
              paymentSettings={paymentSettings}
              onBack={() => setCurrentView('documents')}
              onSaved={savedDoc => {
                setEditingDocument(savedDoc);
              }}
            />
          )}

          {currentView === 'payments' && (
            <PaymentsView
              payments={payments}
              documents={documents}
              clients={clients}
              initialDocumentForPayment={initialDocForPayment}
              onRefresh={() => {}}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              documents={documents}
              clients={clients}
              payments={payments}
            />
          )}

          {currentView === 'templates' && (
            <TemplatesView />
          )}

          {currentView === 'settings' && (
            <SettingsView
              onRefresh={() => {}}
            />
          )}
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={handleCommandPaletteAction}
      />
    </div>
  );
}

export default App;
