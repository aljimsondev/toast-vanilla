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
  timeoutId?: number;
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
  initialHeight = 60;

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

  clearToastContentWrapper() {
    this.toastContentWrapper.remove();
    this.createToastContentWrapper();
  }

  success(message: string, options: ToastOptions = {}) {
    const id = Date.now();

    this.toasts.push({
      timestamp: new Date(),
      type: 'success',
      message: message,
      options: options,
      id: id,
    });

    this.addToast(id, options);
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

    this.addToast(id, options);
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

    this.addToast(id, options);
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

    this.addToast(id, options);
  }
  addToast(toastId: number, options: ToastOptions = {}) {
    const {
      position = 'top-right',
      duration = 3000,
      title = 'Title',
    } = options;
    const [y, x] = position.split('-');

    const toast = this.toasts.find((t) => t.id === toastId);
    if (!toast) return;

    // Create new toast element (only happens once per toast)
    const toastEl = document.createElement('li');
    toastEl.setAttribute('data-toast-item', 'true');
    toastEl.setAttribute('data-toast-variant', toast.type);
    toastEl.setAttribute('data-position-y', y);
    toastEl.setAttribute('data-position-x', x);
    toastEl.setAttribute('data-toast-id', toast.id.toString());
    toastEl.setAttribute('data-expanded', 'true');
    toastEl.setAttribute('data-mounted', 'false');

    setTimeout(() => {
      toastEl.setAttribute('data-mounted', 'true');
    }, 100);

    const toastContent = this.createToastContent({
      title: title,
      message: toast.message,
    });

    toastEl.appendChild(toastContent);
    this.toastContentWrapper.appendChild(toastEl);

    this.reorderToasts();

    // Set timeout for this specific toast
    const timeoutId = setTimeout(() => {
      this.removeToasts(toastId);
    }, duration);

    const toastIndex = this.toasts.findIndex((t) => t.id === toastId);
    if (toastIndex !== -1) {
      this.toasts[toastIndex].timeoutId = timeoutId;
    }
  }

  /**
   * Reorder all toasts by updating CSS variables
   * Newest toast appears on top (index 0)
   */
  private reorderToasts() {
    const toastElements = this.toastContentWrapper.querySelectorAll(
      '[data-toast-item="true"]',
    );

    toastElements.forEach((el, index) => {
      // Reverse order: last element (newest) gets offsetY = length - 1
      const offsetY = toastElements.length - index - 1;
      const zIndex = index + 1;
      const visible = offsetY < this.maxItemToRender;

      (el as HTMLElement).style.setProperty(
        '--offset',
        `${(this.initialHeight + this.gap) * offsetY}px`,
      );
      (el as HTMLElement).style.setProperty('--z-index', zIndex.toString());
      el.setAttribute('data-visible', visible.toString());
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
