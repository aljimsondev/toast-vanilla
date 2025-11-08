interface ToastOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  duration?: number;
  title?: string;
}

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toasts {
  timestamp: Date;
  type: ToastType;
  message: string;
  options: ToastOptions;
  id: number;
}
interface ToastConfig extends ToastOptions {
  maxItemToRender: number;
}

interface ToastParams {
  message: string;
  title: string;
}

export class ToastVanilla {
  maxItemToRender: number;
  toastContainer!: HTMLDivElement;
  toastContentWrapper!: HTMLOListElement;
  toasts: Toasts[] = [];
  gap: number = 12;

  constructor(
    config: ToastConfig = { maxItemToRender: 3, position: 'top-right' },
  ) {
    const { maxItemToRender = 3, position } = config;
    this.maxItemToRender = maxItemToRender;
    this.createToastContainer();
    this.createToastContentWrapper({ position: position });
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
    this.toastContentWrapper = document.createElement('ol');
    this.toastContentWrapper.setAttribute('tab-index', '-1');
    this.toastContentWrapper.setAttribute('data-toaster-content', 'true');
    this.toastContentWrapper.setAttribute('data-position-y', y);
    this.toastContentWrapper.setAttribute('data-position-x', x);
    // todo add the necessary css variables
    this.toastContentWrapper.style = `
      --offset-top:16px;
      --width: 356px;
      --border-radius:8px;
      --success-color:green;
      --error-color:red;
      --warning-color:orange;
      --info-color:lightblue;
      --gap:${this.gap}px;
    `;

    this.toastContainer.appendChild(this.toastContentWrapper);
  }

  removeToastContentWrapper() {}

  success(message: string, options: ToastOptions = {}) {
    const id = Date.now();

    this.toasts.push({
      timestamp: new Date(),
      type: 'success',
      message: message,
      options: options,
      id: id,
    });

    this.displayToasts(options);
  }
  warn(message: string, options: ToastOptions = {}) {
    const id = Date.now();

    this.toasts.push({
      timestamp: new Date(),
      type: 'warning',
      message: message,
      options: options,
      id: id,
    });

    this.displayToasts(options);
  }
  error(message: string, options: ToastOptions = {}) {
    const id = Date.now();

    this.toasts.push({
      timestamp: new Date(),
      type: 'error',
      message: message,
      options: options,
      id: id,
    });

    this.displayToasts(options);
  }
  info(message: string, options: ToastOptions = {}) {
    const id = Date.now();

    this.toasts.push({
      timestamp: new Date(),
      type: 'info',
      message: message,
      options: options,
      id: id,
    });

    this.displayToasts(options);
  }
  /**
   * Displays toasts
   */
  displayToasts(options: ToastOptions = {}) {
    const {
      position = 'top-right',
      duration = 3000,
      title = 'Title',
    } = options;
    const [y, x] = position.split('-');

    const initialHeight = 60;

    this.toasts.map((toast, index) => {
      const currentIndex = index + 1;
      const offsetY = this.toasts.length - currentIndex; // reversed the order of toast, new toast will pop up top

      const toastEl = document.createElement('li');

      toastEl.setAttribute('data-toast-item', 'true');
      toastEl.setAttribute('data-toast-variant', toast.type);
      toastEl.setAttribute('data-position-y', y);
      toastEl.setAttribute('data-position-x', x);
      toastEl.setAttribute('data-toast-id', toast.id.toString());
      toastEl.setAttribute('data-expanded', 'true');
      toastEl.setAttribute(
        'data-visible',
        `${currentIndex <= this.maxItemToRender}`,
      );
      toastEl.style = `
        --offset:${(initialHeight + this.gap) * offsetY}px; 
        --z-index: ${currentIndex}; 
        --initial-height:${initialHeight}px;
      `;

      const toastContent = this.createToastContent({
        title: title,
        message: toast.message,
      });
      toastEl.appendChild(toastContent);

      this.toastContentWrapper.appendChild(toastEl);

      setTimeout(() => {
        // this.removeToasts(toast.id);
      }, duration);
    });
  }

  createToastContent({ title, message }: ToastParams) {
    const content = document.createElement('div');
    content.className = 'toast-content';

    const titleEl = document.createElement('div');
    const descriptionEl = document.createElement('div');

    titleEl.textContent = title;
    descriptionEl.textContent = message;

    content.appendChild(titleEl);
    content.appendChild(descriptionEl);

    return content;
  }

  removeToasts(id: number) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    const targetToast = this.toastContentWrapper?.querySelector(
      `[data-toast-id="${id}"]`,
    );
    if (targetToast && this.toastContentWrapper) {
      this.toastContentWrapper.removeChild(targetToast);
    }
  }

  showToast() {
    const toast = document.createElement('div');

    this.toastContainer.appendChild(toast);
  }
}
