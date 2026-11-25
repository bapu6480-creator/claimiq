import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  KanbanSquare,
  LogOut,
  ShieldCheck,
  UserCog,
  Brain,
  ChevronDown,
} from 'lucide-react';
import { Role } from '@/types';

export type Page = 'dashboard' | 'claims';

interface Props {
  current: Page;
  onNavigate: (p: Page) => void;
  role: Role;
  onRoleChange: (r: Role) => void;
  onLogout: () => void;
  email: string;
}

export default function Sidebar({ current, onNavigate, role, onRoleChange, onLogout, email }: Props) {
  const [roleOpen, setRoleOpen] = useState(false);

  useEffect(() => {
    if (!roleOpen) return;
    const close = () => setRoleOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [roleOpen]);

  const navItem = (page: Page, label: string, Icon: typeof LayoutDashboard) => {
    const active = current === page;
    return (
      <button
        key={page}
        onClick={() => onNavigate(page)}
        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
          active
            ? 'bg-navy-700 text-white shadow-sm'
            : 'text-navy-100 hover:bg-navy-700/60 hover:text-white'
        }`}
      >
        <Icon
          size={18}
          className={active ? 'text-white' : 'text-navy-200 group-hover:text-white'}
        />
        {label}
      </button>
    );
  };

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-navy-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 text-white shadow-md">
          <Brain size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight tracking-tight">ClaimsIQ</h1>
          <p className="text-[11px] text-navy-300">Intelligent Claims</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
          Menu
        </p>
        {navItem('dashboard', 'Dashboard', LayoutDashboard)}
        {navItem('claims', 'Claims', KanbanSquare)}
      </nav>

      {/* Role toggle */}
      <div className="px-3 pb-3">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
          Role
        </p>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRoleOpen((o) => !o);
            }}
            className="flex w-full items-center justify-between rounded-lg border border-navy-700 bg-navy-800 px-3 py-2.5 text-sm font-medium text-navy-100 transition hover:bg-navy-700"
          >
            <span className="flex items-center gap-2">
              {role === 'admin' ? (
                <ShieldCheck size={16} className="text-accent-400" />
              ) : (
                <UserCog size={16} className="text-navy-300" />
              )}
              {role === 'admin' ? 'Admin' : 'Adjuster'}
            </span>
            <ChevronDown
              size={16}
              className={`transition-transform ${roleOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {roleOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1.5 overflow-hidden rounded-lg border border-navy-700 bg-navy-800 shadow-cardLg animate-fade-in">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRoleChange('adjuster');
                  setRoleOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm transition ${
                  role === 'adjuster'
                    ? 'bg-navy-700 text-white'
                    : 'text-navy-100 hover:bg-navy-700/70'
                }`}
              >
                <UserCog size={16} />
                Adjuster
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRoleChange('admin');
                  setRoleOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm transition ${
                  role === 'admin'
                    ? 'bg-navy-700 text-white'
                    : 'text-navy-100 hover:bg-navy-700/70'
                }`}
              >
                <ShieldCheck size={16} />
                Admin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User + logout */}
      <div className="border-t border-navy-800 px-3 py-3">
        <div className="mb-2 flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-accent-300">
            {email.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-navy-100">{email}</p>
            <p className="text-[10px] text-navy-400">Signed in</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-200 transition hover:bg-navy-800 hover:text-white"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
