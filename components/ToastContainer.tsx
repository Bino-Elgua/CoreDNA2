import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toastService, { ToastMessage, ToastType } from '../services/toastService';

const getToastStyles = (type: ToastType) => {
    const styles = {
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/30',
            border: 'border-blue-200 dark:border-blue-700',
            text: 'text-blue-900 dark:text-blue-200',
            icon: 'ℹ️',
        },
        success: {
            bg: 'bg-green-50 dark:bg-green-900/30',
            border: 'border-green-200 dark:border-green-700',
            text: 'text-green-900 dark:text-green-200',
            icon: '✓',
        },
        warning: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/30',
            border: 'border-yellow-200 dark:border-yellow-700',
            text: 'text-yellow-900 dark:text-yellow-200',
            icon: '⚠',
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-900/30',
            border: 'border-red-200 dark:border-red-700',
            text: 'text-red-900 dark:text-red-200',
            icon: '✕',
        },
    };
    return styles[type];
};

interface ToastItemProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
    const styles = getToastStyles(toast.type);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`${styles.bg} border ${styles.border} rounded-lg p-4 mb-3 shadow-lg max-w-md`}
        >
            <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{styles.icon}</span>
                <div className="flex-1">
                    <p className={`text-sm font-medium ${styles.text}`}>{toast.message}</p>
                    {toast.action && (
                        <button
                            onClick={() => {
                                toast.action?.onClick();
                                onDismiss(toast.id);
                            }}
                            className={`text-xs font-semibold mt-2 underline hover:no-underline ${styles.text}`}
                        >
                            {toast.action.label}
                        </button>
                    )}
                </div>
                <button
                    onClick={() => onDismiss(toast.id)}
                    className={`text-lg flex-shrink-0 hover:opacity-70 ${styles.text}`}
                >
                    ✕
                </button>
            </div>
        </motion.div>
    );
};

export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const unsubscribe = toastService.subscribe((toast) => {
            setToasts((prev) => [toast, ...prev]);
        });

        return unsubscribe;
    }, []);

    const handleDismiss = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        toastService.dismiss(id);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onDismiss={handleDismiss} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};
