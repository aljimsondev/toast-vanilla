interface ToastOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  duration?: number;
}

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toasts {
  timestamp: Date;
  type: ToastType;
  message: string;
  options: ToastOptions;
}
interface ToastConfig {
  maxItemToRender: number;
}
export class ToastVanilla {
  maxItemToRender: number;
  toastContainer!: HTMLDivElement;
  toasts: Toasts[] = [];

  constructor(config: ToastConfig = { maxItemToRender: 3 }) {
    const { maxItemToRender = 3 } = config;
    this.createToastContainer();
    this.maxItemToRender = maxItemToRender;
  }
  init() {}

  createToastContainer() {
    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-container';
    this.toastContainer.setAttribute('data-toaster-container', 'true');
    this.toastContainer.setAttribute('tab-index', '-1');
    this.toastContainer.setAttribute('aria-label', 'Toast Notifications!');
    document.body.appendChild(this.toastContainer);
  }

  createToastContentWrapper(options: ToastOptions = {}) {
    const { position = 'top-left' } = options;
    const [y, x] = position.split('-');
    const toastContentWrapper = document.createElement('ol');
    toastContentWrapper.setAttribute('tab-index', '-1');
    toastContentWrapper.setAttribute('data-toaster-content', 'true');
    toastContentWrapper.setAttribute('data-toaster-position-y', y);
    toastContentWrapper.setAttribute('data-toaster-position-x', x);
    toastContentWrapper.style = `--offset-top:16px;--width: 356px;`; // todo add the necessary css variables

    this.toastContainer.appendChild(toastContentWrapper);
  }

  removeToastContentWrapper() {}

  success(message: 'string', options: ToastOptions = {}) {
    const duration = options.duration;

    this.toasts.push({
      timestamp: new Date(),
      type: 'success',
      message: message,
      options: options,
    });

    this.displayToasts(options);

    setTimeout(() => {
      this.removeToasts();
    }, duration);
  }
  /**
   * Displays toasts
   */
  displayToasts(options: ToastOptions = {}) {
    this.createToastContentWrapper(options);

    const initialHeight = 60;
    this.toasts.map((toast, index) => {
      const currentIndex = index + 1;

      console.log(toast);
      const toastEl = document.createElement('div');
      toastEl.className = 'toast__vanilla';
      toastEl.setAttribute('data-toast-item', 'true');
      toastEl.setAttribute(
        'data-visible',
        `${currentIndex <= this.maxItemToRender}`,
      );
      toastEl.style = `--offset:${
        initialHeight * index
      }px; --z-index: ${index}; --initial-height:${initialHeight}px`;
      toastEl.textContent = toast.message;
      this.toastContainer.appendChild(toastEl);
    });
  }

  removeToasts(duration: number = 3000) {
    for (const toast of this.toasts) {
      const now = new Date();
    }
  }

  showToast() {
    const toast = document.createElement('div');

    this.toastContainer.appendChild(toast);
  }
}
