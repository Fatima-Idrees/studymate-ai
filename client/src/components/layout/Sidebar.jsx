import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Library,
  MessageSquareText,
  Brain,
  Layers,
  FileText,
  TrendingUp,
  UserCircle,
  GraduationCap,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload Notes', icon: UploadCloud },
  { to: '/notes', label: 'Notes Library', icon: Library },
  { to: '/chat', label: 'Chat with Notes', icon: MessageSquareText },
  { to: '/quiz', label: 'Quizzes', icon: Brain },
  { to: '/flashcards', label: 'Flashcards', icon: Layers },
  { to: '/revision', label: 'Revision Notes', icon: FileText },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-line bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <GraduationCap size={20} />
            </div>
            <span className="font-display text-lg font-semibold text-ink">StudyMate AI</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-soft hover:bg-paper-dim lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-ink-soft hover:bg-paper-dim hover:text-ink'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
