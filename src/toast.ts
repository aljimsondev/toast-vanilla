type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ToastOptions {
  position?: ToastPosition;
  duration?: number;
  title?: string;
}

interface ToastPromiseOptions<T> extends ToastOptions {
  loading: string;
  error: (e: Error) => string;
  success: (data: T) => string;
}

type ToastType = 'success' | 'warning' | 'error' | 'info' | 'loader';

interface Toasts {
  timestamp: Date;
  type: ToastType;
  message: string;
  options: ToastOptions;
  id: number;
  timeoutId?: number;
  callback?: () => Promise<any>;
}
type ToastStyle = {
  offset: number;
  borderRadius: number;
  successColor: string;
  errorColor: string;
  warningColor: string;
  infoColor: string;
  gap: number;
  textColor: string;
  textColorForeground: string;
  highlightColor: string;
  background: string;
};

interface ToastConfig {
  maxItemToRender: number;
  position?: ToastPosition;
  duration?: number;
  styles?: ToastStyle;
}

interface ToastParams {
  message: string;
  title: string;
  type: 'promise' | 'toast';
}

export class ToastVanilla {
  maxItemToRender: number;
  toastContainer!: HTMLDivElement;
  toastContentWrapper!: HTMLOListElement;
  toasts: Toasts[] = [];
  gap: number = 16;
  initialHeight: number = 60;
  offset: number = 16;
  position: ToastPosition = 'top-right';
  styles: ToastStyle = {
    borderRadius: 8,
    errorColor: 'oklch(0.577 0.245 27.325)',
    gap: 16,
    infoColor: 'oklch(0.546 0.245 262.881)',
    successColor: 'oklch(0.627 0.194 149.214)',
    warningColor: 'oklch(0.705 0.213 47.604)',
    textColor: 'oklch(0.21 0.006 285.885)',
    highlightColor: 'oklch(0.145 0 0)',
    background: 'oklch(1 0 0)',
    textColorForeground: 'oklch(1 0 0)',
    offset: 16,
  };

  constructor(config: ToastConfig) {
    const { maxItemToRender = 3, position = 'top-right', styles } = config;
    this.position = position;
    this.maxItemToRender = maxItemToRender;
    if (styles) {
      this.styles = { ...this.styles, ...styles };
    }

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
      --offset-top:${this.offset}px;
      --offset-right:${this.offset}px;
      --offset-bottom:${this.offset}px;
      --offset-left:${this.offset}px;
      --width: 356px;
      --border-radius:${this.styles.borderRadius}px;
      --success-color:${this.styles.successColor};
      --error-color:${this.styles.errorColor};
      --warning-color:${this.styles.warningColor};
      --info-color:${this.styles.infoColor};
      --text-color:${this.styles.textColor};
      --text-color-foreground:${this.styles.textColorForeground};
      --highlight-color:${this.styles.highlightColor};
      --background:${this.styles.background};
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
  async promise<T>(
    callback: () => Promise<T>,
    options: ToastPromiseOptions<T>,
  ) {
    const id = Date.now();

    this.toasts.push({
      timestamp: new Date(),
      type: 'info',
      message: '',
      options: options,
      id: id,
      callback: callback,
    });

    this.addToastPromise(id, callback, options);
  }

  addToastPromise<T>(
    toastId: number,
    callback: () => Promise<T>,
    options: ToastPromiseOptions<T>,
  ) {
    const { title = 'Title', error, loading, success } = options;
    const [y, x] = this.position.split('-');

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

    const content = this.createToastContent({
      type: 'promise',
      message: '',
      title: '',
    });

    const iconWrapper = document.createElement('div');

    const successIcon = this.setToastIcon('success');
    const errorIcon = this.setToastIcon('error');
    // loader icon
    const loaderIcon = this.setToastIcon('loader');
    loaderIcon.setAttribute('data-loader-icon', '');

    callback()
      .then((data) => {
        const textResponse = success(data);
      })
      .catch((e) => {
        const errorMessage = error(e);
      })
      .finally(() => {
        // do the clean up
      });
  }

  addToast(toastId: number, options: ToastOptions = {}) {
    const { duration = 3000, title = 'Title' } = options;
    const [y, x] = this.position.split('-');

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

    const icon = this.setToastIcon(toast.type);
    toastEl.appendChild(icon);
    toastEl.appendChild(toastContent);
    this.toastContentWrapper.appendChild(toastEl);

    this.reorderToasts();

    // Set timeout for this specific toast
    const timeoutId = setTimeout(() => {
      // this.removeToasts(toastId);
    }, duration);

    const toastIndex = this.toasts.findIndex((t) => t.id === toastId);
    if (toastIndex !== -1) {
      this.toasts[toastIndex].timeoutId = timeoutId;
    }
  }

  calcOffset(offsetY: number, direction: 'top' | 'bottom') {
    switch (direction) {
      case 'bottom':
        return -(
          (this.initialHeight + this.gap) * offsetY +
          this.initialHeight +
          this.gap / 2
        );
      default:
        return (this.initialHeight + this.gap) * offsetY;
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
    const [y, x] = this.position.split('-');

    toastElements.forEach((el, index) => {
      // Reverse order: last element (newest) gets offsetY = length - 1
      const offsetY = toastElements.length - index - 1;
      const zIndex = index + 1;
      const visible = offsetY < this.maxItemToRender;

      (el as HTMLElement).style.setProperty(
        '--offset',
        `${this.calcOffset(offsetY, y as 'top' | 'bottom')}px`,
      );
      (el as HTMLElement).style.setProperty('--z-index', zIndex.toString());
      el.setAttribute('data-visible', visible.toString());
    });
  }

  createToastContent({ title, message, type = 'toast' }: ToastParams) {
    const content = document.createElement('div');
    content.className = 'toast-content';

    if (type === 'toast') {
      const titleEl = document.createElement('div');
      const descriptionEl = document.createElement('div');

      titleEl.setAttribute('data-toast-title', '');
      titleEl.textContent = title;
      descriptionEl.textContent = message;

      content.appendChild(titleEl);
      content.appendChild(descriptionEl);
    } else {
      const promiseEl = document.createElement('div');
      promiseEl.setAttribute('data-promise-content', '');
      content.appendChild(promiseEl);
    }

    return content;
  }

  private setToastIcon(type: ToastType) {
    const icon = document.createElement('span');
    icon.setAttribute('data-set-icon', '');

    switch (type) {
      case 'error':
        icon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert-icon lucide-circle-alert"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
        break;

      case 'warning':
        icon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
        break;

      case 'info':
        icon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-warning-icon lucide-message-square-warning"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M12 15h.01"/><path d="M12 7v4"/></svg>';
        break;
      case 'loader':
        icon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle-icon lucide-loader-circle"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';
        break;
      default:
        icon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-icon lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
        break;
    }

    return icon;
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
