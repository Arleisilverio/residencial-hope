import React, { ReactNode } from 'react';
import { Dialog as ArkDialog } from '@ark-ui/react/dialog';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <ArkDialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
      <ArkDialog.Backdrop className="fixed inset-0 bg-black/60 z-40" />
      <ArkDialog.Positioner className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <ArkDialog.Content className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg m-4 z-50 animate-in fade-in-90 zoom-in-95">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <ArkDialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </ArkDialog.Title>
            <ArkDialog.CloseTrigger asChild>
              <button 
                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </ArkDialog.CloseTrigger>
          </div>
          <div className="p-6">
            {children}
          </div>
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </ArkDialog.Root>
  );
};

export { Dialog };