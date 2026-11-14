// ============================================================
// Aary's IDE — Reusable UI Components
// ============================================================

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700',
    ghost: 'hover:bg-slate-100 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'info' | 'danger' | 'neutral' }> = ({
  children,
  variant = 'neutral',
}) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    info: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; subtitle?: string; action?: React.ReactNode }> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          {title && <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }> = ({
  label,
  error,
  className = '',
  ...props
}) => (
  <div className="w-full">
    {label && <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
    <input
      className={`w-full px-3 py-2 text-sm bg-white dark:bg-slate-850 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 ${
        error ? 'border-rose-500' : 'border-slate-200'
      } ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
  </div>
);
