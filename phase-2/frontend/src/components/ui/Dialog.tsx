/**
 * Dialog Component
 * Modern Technical Editorial Design System
 */

import * as React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions
}) => {
  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1B12]/50 backdrop-blur-sm">
      <div className="bg-[#F9F7F2] border border-[#2A1B12]/20 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A1B12]/10">
          <h2 className="text-xl font-serif font-bold text-[#2A1B12]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2A1B12]/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-[#2A1B12]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="px-6 py-4 border-t border-[#2A1B12]/10 bg-[#2A1B12]/5">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// Dialog Actions Component
interface DialogActionsProps {
  children: React.ReactNode;
}

export const DialogActions: React.FC<DialogActionsProps> = ({ children }) => {
  return (
    <div className="flex gap-3 justify-end">
      {children}
    </div>
  );
};

// Confirmation Dialog Hook
export function useDialog() {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}