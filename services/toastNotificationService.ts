/**
 * TOAST NOTIFICATION SERVICE
 * Unified notification system for all user feedback
 * Shows success, error, info, and warning messages
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number; // ms, 0 = sticky
  action?: {
    label: string;
    onClick: () => void;
  };
}

type ToastCallback = (toast: Toast) => void;
type ToastDismissCallback = (id: string) => void;

class ToastNotificationService {
  private listeners: Set<ToastCallback> = new Set();
  private dismissListeners: Set<ToastDismissCallback> = new Set();
  private toastQueue: Toast[] = [];
  private maxToasts: number = 5;
  private defaultDuration: Record<NotificationType, number> = {
    success: 3000,
    error: 5000,
    info: 4000,
    warning: 4000,
  };

  /**
   * Subscribe to toast notifications
   */
  subscribe(callback: ToastCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Subscribe to toast dismissals
   */
  onDismiss(callback: ToastDismissCallback): () => void {
    this.dismissListeners.add(callback);
    return () => this.dismissListeners.delete(callback);
  }

  /**
   * Show success toast
   */
  success(message: string, duration?: number): string {
    const id = this.show(message, 'success', duration);
    console.log(`[Toast] ✓ ${message}`);
    return id;
  }

  /**
   * Show error toast
   */
  error(message: string, duration?: number): string {
    const id = this.show(message, 'error', duration || 5000);
    console.error(`[Toast] ✗ ${message}`);
    return id;
  }

  /**
   * Show info toast
   */
  info(message: string, duration?: number): string {
    const id = this.show(message, 'info', duration);
    console.info(`[Toast] ℹ ${message}`);
    return id;
  }

  /**
   * Show warning toast
   */
  warning(message: string, duration?: number): string {
    const id = this.show(message, 'warning', duration);
    console.warn(`[Toast] ⚠ ${message}`);
    return id;
  }

  /**
   * Show custom toast
   */
  show(
    message: string,
    type: NotificationType = 'info',
    duration?: number,
    action?: { label: string; onClick: () => void }
  ): string {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Enforce max toasts
    if (this.toastQueue.length >= this.maxToasts) {
      const removed = this.toastQueue.shift();
      if (removed) {
        this.dismiss(removed.id);
      }
    }

    const toast: Toast = {
      id,
      message,
      type,
      duration: duration ?? this.defaultDuration[type],
      action,
    };

    this.toastQueue.push(toast);

    // Notify listeners
    this.listeners.forEach((listener) => listener(toast));

    // Auto-dismiss if duration is set
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        if (this.toastQueue.some((t) => t.id === id)) {
          this.dismiss(id);
        }
      }, toast.duration);
    }

    return id;
  }

  /**
   * Dismiss toast
   */
  dismiss(id: string): void {
    const index = this.toastQueue.findIndex((t) => t.id === id);
    if (index >= 0) {
      this.toastQueue.splice(index, 1);
    }
    this.dismissListeners.forEach((listener) => listener(id));
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    const ids = [...this.toastQueue.map((t) => t.id)];
    ids.forEach((id) => this.dismiss(id));
  }

  /**
   * Get current toasts
   */
  getToasts(): Toast[] {
    return [...this.toastQueue];
  }

  /**
   * Show operation in progress
   */
  loading(message: string): string {
    return this.show(message, 'info', 0); // Sticky until dismissed
  }

  /**
   * Show operation result
   */
  result(operationId: string, success: boolean, message: string): void {
    this.dismiss(operationId);
    if (success) {
      this.success(message);
    } else {
      this.error(message);
    }
  }

  /**
   * Show operation complete with action
   */
  withAction(
    message: string,
    type: NotificationType,
    actionLabel: string,
    onAction: () => void
  ): string {
    return this.show(message, type, 5000, {
      label: actionLabel,
      onClick: onAction,
    });
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.toastQueue = [];
    this.listeners.forEach(() => {
      // Notify that all dismissed
    });
  }

  /**
   * Set max simultaneous toasts
   */
  setMaxToasts(max: number): void {
    this.maxToasts = Math.max(1, max);
  }
}

// Singleton instance
export const toastNotificationService = new ToastNotificationService();

/**
 * React hook for toast notifications
 */
export function useToast() {
  return {
    success: (msg: string, duration?: number) => toastNotificationService.success(msg, duration),
    error: (msg: string, duration?: number) => toastNotificationService.error(msg, duration),
    info: (msg: string, duration?: number) => toastNotificationService.info(msg, duration),
    warning: (msg: string, duration?: number) => toastNotificationService.warning(msg, duration),
    show: (msg: string, type?: NotificationType, duration?: number) =>
      toastNotificationService.show(msg, type, duration),
    dismiss: (id: string) => toastNotificationService.dismiss(id),
    dismissAll: () => toastNotificationService.dismissAll(),
    loading: (msg: string) => toastNotificationService.loading(msg),
    result: (opId: string, success: boolean, msg: string) =>
      toastNotificationService.result(opId, success, msg),
  };
}

/**
 * Integration helper: Connect errorHandler to toastNotificationService
 */
export function integrateErrorHandlerWithToasts() {
  const { errorHandler } = require('./errorHandlingService');

  errorHandler.onError((error: any) => {
    const message = error.message || error.error || 'An error occurred';
    const type = error.severity || 'error';

    if (type === 'critical' || type === 'error') {
      toastNotificationService.error(message);
    } else if (type === 'warning') {
      toastNotificationService.warning(message);
    } else {
      toastNotificationService.info(message);
    }
  });
}
