'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ToastData } from '@/contexts/toast-context';

interface ToastProps {
  toast: ToastData;
  onClose: () => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export function Toast({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const Icon = toastIcons[toast.type];

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ease-out transform min-w-[320px] max-w-[420px]',
        toastStyles[toast.type],
        isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconStyles[toast.type])} />

      <div className="flex-1 min-w-0">
        {toast.title && <h4 className="text-sm font-semibold mb-1">{toast.title}</h4>}
        <p className="text-sm leading-relaxed">{toast.message}</p>

        {toast.action && (
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={toast.action.onClick} className="h-8 px-3 text-xs">
              {toast.action.label}
            </Button>
          </div>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 w-6 p-0 hover:bg-black/10 flex-shrink-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
