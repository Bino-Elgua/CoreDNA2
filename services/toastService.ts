/**
 * Toast notification service for user feedback
 * Used by inference engine and other async operations
 */

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
    duration?: number; // milliseconds, 0 = persistent
    action?: {
        label: string;
        onClick: () => void;
    };
}

class ToastService {
    private listeners: Set<(toast: ToastMessage) => void> = new Set();
    private toasts: Map<string, ToastMessage> = new Map();

    subscribe(callback: (toast: ToastMessage) => void) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    private notify(toast: ToastMessage) {
        this.toasts.set(toast.id, toast);
        this.listeners.forEach(listener => listener(toast));

        // Auto-dismiss after duration
        if (toast.duration && toast.duration > 0) {
            setTimeout(() => this.dismiss(toast.id), toast.duration);
        }
    }

    dismiss(id: string) {
        this.toasts.delete(id);
        // Could emit a dismiss event if needed
    }

    show(
        message: string,
        type: ToastType = 'info',
        duration: number = 3000,
        action?: { label: string; onClick: () => void }
    ) {
        const id = `toast-${Date.now()}-${Math.random()}`;
        this.notify({ id, type, message, duration, action });
        return id;
    }

    info(message: string, duration?: number) {
        return this.show(message, 'info', duration);
    }

    success(message: string, duration?: number) {
        return this.show(message, 'success', duration || 2000);
    }

    warning(message: string, duration?: number) {
        return this.show(message, 'warning', duration);
    }

    error(message: string, duration?: number) {
        return this.show(message, 'error', duration || 4000);
    }

    // For inference engine status
    inferenceStart(message: string) {
        return this.show(message, 'info', 0); // Persistent until dismissed
    }

    inferenceComplete(message: string) {
        return this.show(message, 'success', 2000);
    }

    inferenceFailed(error: string) {
        return this.show(`Inference error: ${error}`, 'error', 4000);
    }
}

const toastService = new ToastService();

export { toastService };
export default toastService;
