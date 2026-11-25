import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar, { Page } from '@/components/Sidebar';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ClaimsPage from '@/pages/ClaimsPage';
import ClaimDetailPage from '@/pages/ClaimDetailPage';
import GlobalChatAgent from '@/components/GlobalChatAgent';
import { Role } from '@/types';

type View =
  | { kind: 'dashboard' }
  | { kind: 'claims' }
  | { kind: 'detail'; claimId: string };

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('adjuster');
  const [view, setView] = useState<View>({ kind: 'dashboard' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (e: string) => {
    setEmail(e);
    setAuthed(true);
    setView({ kind: 'dashboard' });
  };

  const handleLogout = () => {
    setAuthed(false);
    setEmail('');
    setView({ kind: 'dashboard' });
  };

  const navigate = (p: Page) => {
    setView({ kind: p });
    setSidebarOpen(false);
  };

  const openClaim = (id: string) => setView({ kind: 'detail', claimId: id });
  const backFromDetail = () => setView({ kind: 'claims' });

  if (!authed) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const currentSidebarPage: Page = view.kind === 'detail' ? 'claims' : view.kind;

  return (
    <div className="flex h-screen overflow-hidden bg-navy-50/30">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          current={currentSidebarPage}
          onNavigate={navigate}
          role={role}
          onRoleChange={setRole}
          onLogout={handleLogout}
          email={email}
        />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full animate-slide-in">
            <Sidebar
              current={currentSidebarPage}
              onNavigate={navigate}
              role={role}
              onRoleChange={setRole}
              onLogout={handleLogout}
              email={email}
            />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 text-navy-600"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-navy-900">ClaimsIQ</span>
            <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[10px] font-semibold text-navy-600">
              {role === 'admin' ? 'Admin' : 'Adjuster'}
            </span>
          </div>
          <div className="w-9" />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {view.kind === 'dashboard' && <DashboardPage onOpenClaim={openClaim} />}
            {view.kind === 'claims' && <ClaimsPage onOpenClaim={openClaim} />}
            {view.kind === 'detail' && (
              <ClaimDetailPage
                claimId={view.claimId}
                role={role}
                onBack={backFromDetail}
              />
            )}
          </div>
        </main>
      </div>

      <GlobalChatAgent onOpenClaim={openClaim} />
    </div>
  );
}
