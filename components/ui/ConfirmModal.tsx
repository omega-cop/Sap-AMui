import React from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xóa',
  cancelText = 'Hủy bỏ',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-[scaleUp_0.2s_ease-out]">
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand-600'}`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">{message}</p>
          
          <div className="flex gap-3 w-full">
            <Button variant="secondary" fullWidth onClick={onCancel}>
              {cancelText}
            </Button>
            <Button variant={variant} fullWidth onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
