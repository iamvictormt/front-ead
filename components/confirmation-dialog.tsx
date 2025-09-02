'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'warning';
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  isLoading = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const getVariantColors = () => {
    switch (variant) {
      case 'destructive':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          icon: 'text-red-600 dark:text-red-400',
          button: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          icon: 'text-yellow-600 dark:text-yellow-400',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
      default:
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          icon: 'text-blue-600 dark:text-blue-400',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
    }
  };

  const colors = getVariantColors();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${colors.bg}`}>
                  <AlertTriangle className={`h-5 w-5 ${colors.icon}`} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
                className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 bg-transparent"
              >
                {cancelText}
              </Button>
              <Button onClick={onConfirm} disabled={isLoading} className={`flex-1 ${colors.button}`}>
                {isLoading ? 'Processando...' : confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
