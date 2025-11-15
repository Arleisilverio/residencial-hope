import React from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};