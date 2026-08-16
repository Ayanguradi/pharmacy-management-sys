import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, useEffect } from 'react';
import { X } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', icon, className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
    ghost: 'text-neutral-600 hover:bg-neutral-100',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 shadow-sm',
    success: 'bg-accent-600 text-white hover:bg-accent-700 shadow-sm',
    outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
}

export function Card({ children, className = '', hover = false, title, action }: { children: ReactNode; className?: string; hover?: boolean; title?: string; action?: ReactNode }) {
  return (
    <div className={`bg-white rounded-xl shadow-card ${hover ? 'transition-shadow hover:shadow-card-hover' : ''} ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-base font-semibold text-neutral-800">{title}</h3>
          {action}
        </div>
      )}
      {title ? <div className="p-6">{children}</div> : children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  color?: 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'purple';
  size?: 'sm' | 'md';
}

export function Badge({ children, color = 'gray', size = 'sm' }: BadgeProps) {
  const colors = {
    green: 'bg-accent-50 text-accent-700 border-accent-200',
    red: 'bg-danger-50 text-danger-700 border-danger-200',
    amber: 'bg-warning-50 text-warning-700 border-warning-200',
    blue: 'bg-primary-50 text-primary-700 border-primary-200',
    gray: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    purple: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  };
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs' };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${colors[color]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

export function Input({ label, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</span>}
      <input
        className={`w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white text-neutral-800 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</span>}
      <select
        className={`w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white text-neutral-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

interface TabsProps {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-neutral-200 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
            active === tab.id
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizes[size]} animate-scale-in max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

interface TableProps {
  headers: string[];
  children: ReactNode;
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            {headers.map((h, i) => (
              <th key={i} className="text-left font-semibold text-neutral-500 uppercase text-xs tracking-wider px-4 py-3 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">{children}</tbody>
      </table>
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-lg bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
      />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">{icon}</div>
      <p className="text-neutral-600 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export function StatCard({ label, value, icon, trend, color = 'blue', className = '' }: {
  label: string; value: string; icon: ReactNode; trend?: string; color?: 'blue' | 'green' | 'amber' | 'red'; className?: string;
}) {
  const colorMap = {
    blue: 'bg-primary-50 text-primary-600',
    green: 'bg-accent-50 text-accent-600',
    amber: 'bg-warning-50 text-warning-600',
    red: 'bg-danger-50 text-danger-600',
  };
  return (
    <Card hover className={`p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-neutral-800 mt-1">{value}</p>
          {trend && <p className="text-xs text-accent-600 font-medium mt-2">{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colorMap[color]}`}>{icon}</div>
      </div>
    </Card>
  );
}

export * from './ui/DateRangePicker';
