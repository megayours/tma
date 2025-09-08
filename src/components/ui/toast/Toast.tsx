import { useEffect, useState } from 'react';
import {
  MdClose,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdInfo,
} from 'react-icons/md';
import {
  type Toast as ToastType,
  type ToastType as ToastTypeEnum,
} from './types.js';
import { Button } from '../Button';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const iconMap: Record<ToastTypeEnum, React.ComponentType<any>> = {
  success: MdCheckCircle,
  error: MdError,
  warning: MdWarning,
  info: MdInfo,
};

const colorMap: Record<ToastTypeEnum, string> = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-black',
  info: 'bg-blue-500 text-white',
};

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const Icon = iconMap[toast.type];

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match animation duration
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} ${isLeaving ? 'translate-x-full opacity-0' : ''} bg-tg-bg border-tg-hint mb-3 max-w-96 min-w-80 rounded-lg border p-4 shadow-lg backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex-shrink-0 rounded-full p-1 ${colorMap[toast.type]}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          {toast.title && (
            <h4 className="text-tg-text mb-1 text-sm font-semibold">
              {toast.title}
            </h4>
          )}
          <p className="text-tg-hint text-sm leading-relaxed">
            {toast.message}
          </p>

          {toast.action && (
            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={toast.action.onClick}
                className="text-xs"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={handleRemove}
          className="hover:bg-tg-hint/20 flex-shrink-0 rounded-full p-1 transition-colors"
          aria-label="Close toast"
        >
          <MdClose className="text-tg-hint h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
