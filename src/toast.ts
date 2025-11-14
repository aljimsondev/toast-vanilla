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

interface Toast {
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
  id: string | number;
}

/**
 * ToastVanilla - A vanilla JavaScript toast notification system
 * Provides a lightweight, configuration-driven toast notification display with support for
 * standard toasts and promise-based notifications with loading states.
 */
export class ToastVanilla {
  private maxItemToRender: number;
  private toastContainer!: HTMLDivElement;
  private toastContentWrapper!: HTMLOListElement;
  private toasts: Toast[] = [];
  private gap: number = 16;
  private initialHeight: number = 60;
  private offset: number = 16;
  private position: ToastPosition = 'top-right';
  private lastNode: HTMLLIElement | null = null;
  private duration: number;
  private styles: ToastStyle = {
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

  /**
   * Initializes the ToastVanilla instance with configuration
   * @param {ToastConfig} config - Configuration object for the toast system
   * @param {number} [config.maxItemToRender=3] - Maximum number of visible toasts
   * @param {ToastPosition} [config.position='top-right'] - Position of toast container
   * @param {ToastStyle} [config.styles] - Custom style overrides
   */
  constructor(config: ToastConfig) {
    const {
      maxItemToRender = 3,
      position = 'top-right',
      styles,
      duration = 3000,
    } = config;
    this.position = position;
    this.maxItemToRender = maxItemToRender;
    this.duration = duration;
    if (styles) {
      this.styles = { ...this.styles, ...styles };
    }

    this.createToastContainer();
    this.createToastContentWrapper({ position: position });
  }

  /**
   * Creates the main toast container element and appends it to the DOM
   * @private
   */
  private createToastContainer() {
    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-container';
    this.toastContainer.setAttribute('data-toaster-container', 'true');
    this.toastContainer.setAttribute('tab-index', '-1');
    this.toastContainer.setAttribute('aria-label', 'Toast Notifications!');
    document.body.appendChild(this.toastContainer);
  }

  /**
   * Creates the ordered list wrapper for toast items with position and styling
   * @param {ToastOptions} [options={}] - Options including position
   */
  private createToastContentWrapper(options: ToastOptions = {}) {
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

  /**
   * Clears the existing toast content wrapper and creates a new one
   * Useful for resetting the toast display state
   */
  private clearToastContentWrapper() {
    this.toastContentWrapper.remove();
    this.createToastContentWrapper();
  }

  /**
   * Displays a success toast notification
   * @param {string} message - The message content to display
   * @param {ToastOptions} [options={}] - Optional toast configuration
   */
  success(message: string, options: ToastOptions = {}) {
    const id = Date.now();
    this.setToast({
      timestamp: new Date(),
      type: 'success',
      message: message,
      options: options,
      id: id,
    });

    this.addToast(id, options);
  }

  /**
   * Displays a warning toast notification
   * @param {string} message - The message content to display
   * @param {ToastOptions} [options={}] - Optional toast configuration
   */
  warn(message: string, options: ToastOptions = {}) {
    const id = Date.now();

    this.setToast({
      timestamp: new Date(),
      type: 'warning',
      message: message,
      options: options,
      id: id,
    });

    this.addToast(id, options);
  }

  /**
   * Displays an error toast notification
   * @param {string} message - The message content to display
   * @param {ToastOptions} [options={}] - Optional toast configuration
   */
  error(message: string, options: ToastOptions = {}) {
    const id = Date.now();

    this.setToast({
      timestamp: new Date(),
      type: 'error',
      message: message,
      options: options,
      id: id,
    });

    this.addToast(id, options);
  }

  /**
   * Displays an info toast notification
   * @param {string} message - The message content to display
   * @param {ToastOptions} [options={}] - Optional toast configuration
   */
  info(message: string, options: ToastOptions = {}) {
    const id = Date.now();

    this.setToast({
      timestamp: new Date(),
      type: 'info',
      message: message,
      options: options,
      id: id,
    });

    this.addToast(id, options);
  }

  /**
   * Displays a promise-based toast that tracks loading, success, and error states
   * @template T - The type of data returned by the promise
   * @param {() => Promise<T>} callback - The async function to execute and track
   * @param {ToastPromiseOptions<T>} options - Configuration including loading/success/error messages
   * @returns {Promise<void>}
   */
  async promise<T>(
    callback: () => Promise<T>,
    options: ToastPromiseOptions<T>,
  ) {
    const id = Date.now();

    this.setToast({
      timestamp: new Date(),
      type: 'loader',
      message: '',
      options: options,
      id: id,
      callback: callback,
    });

    this.addToastPromise(id, callback, options);
  }

  /**
   * Internal method to handle promise toast creation and state transitions
   * Executes the callback and updates the toast based on promise resolution
   * @template T - The type of data returned by the promise
   * @param {number} toastId - Unique identifier for the toast
   * @param {() => Promise<T>} callback - The async function to execute
   * @param {ToastPromiseOptions<T>} options - Configuration for loading/success/error states
   * @private
   */
  private addToastPromise<T>(
    toastId: number,
    callback: () => Promise<T>,
    options: ToastPromiseOptions<T>,
  ) {
    const { error, loading, success } = options;
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
      type: 'promise',
      message: '',
      title: '',
      id: toastId,
    });

    // get toast promise content wrapper
    const toastContentMain = toastContent.querySelector(
      '[data-promise-content]',
    ) as Element;

    // loader icon
    const loaderIcon = this.setToastIcon('loader');
    loaderIcon.setAttribute('data-loader-icon', '');

    toastContentMain.appendChild(loaderIcon);
    // create text
    const text = document.createElement('p');
    text.textContent = loading;

    // append text
    toastContentMain.appendChild(text);
    // append toast content
    toastEl.appendChild(toastContent);

    if (this.lastNode) {
      this.toastContentWrapper.insertBefore(toastEl, this.lastNode);
    } else {
      this.toastContentWrapper.appendChild(toastEl);
    }

    // set as last node
    this.setLastNode(toastEl);

    // apply update css properties
    this.reorderToasts();

    callback()
      .then((data) => {
        const textResponse = success(data);
        this.updatePromiseToast(toastEl, {
          message: textResponse,
          status: 'success',
        });
      })
      .catch((e) => {
        const errorMessage = error(e);
        this.updatePromiseToast(toastEl, {
          message: errorMessage,
          status: 'error',
        });
      })
      .finally(() => {
        this.handleComplete(toastId);
      });
  }

  /**
   * Set new toast
   * @param toast
   */
  setToast(toast: Toast) {
    const old = this.toasts;
    // this will placed the new item to the first array
    this.toasts = [toast].concat(old);
  }

  /**
   * Set node as the last node added in the toast container
   * @param node
   */
  setLastNode(node: HTMLLIElement) {
    this.lastNode = node;
  }

  /**
   * Update the last node if it is the item that is currently queued for removal
   * @param node
   */
  updateLastNode(node: HTMLLIElement) {
    if (this.lastNode && this.lastNode === node) {
      this.lastNode = null;
    }
  }

  /**
   * Handles the completion of a promise toast
   * Sets a timeout to automatically remove the toast and stores the timeout ID for cleanup
   * @param {number} toastId - Unique identifier of the toast to complete
   * @private
   */
  private handleComplete(toastId: number) {
    // Handle promise with proper cleanup
    const timeoutId = setTimeout(() => {
      this.removeToast(toastId);
    }, this.duration);

    // Store timeout ID for cleanup if toast is manually dismissed
    const toastIndex = this.toasts.findIndex((t) => t.id === toastId);
    if (toastIndex !== -1) {
      this.toasts[toastIndex].timeoutId = timeoutId;
    }
  }

  /**
   * Updates a promise toast with new status and message
   * @param {HTMLLIElement} toastEl - The toast DOM element to update
   * @param {Object} config - Configuration object
   * @param {'success' | 'error'} config.status - The new status of the promise
   * @param {string} config.message - The message to display
   * @private
   */
  private updatePromiseToast(
    toastEl: HTMLLIElement,
    { message, status }: { status: 'success' | 'error'; message: string },
  ) {
    this.updatePromiseIcon(toastEl, status);
    this.updatePromiseMessage(toastEl, message);
  }

  /**
   * Updates the message text of a promise toast
   * @param {HTMLLIElement} toastEl - The toast DOM element
   * @param {string} message - The new message text to display
   * @private
   */
  private updatePromiseMessage(toastEl: HTMLLIElement, message: string) {
    const toastContent = toastEl.querySelector(`[data-promise-content]`);
    if (!toastContent) return;

    const text = toastContent.querySelector('p');
    if (text) {
      text.textContent = message;
    }
  }

  /**
   * Updates the icon of a promise toast based on the new status
   * @param {HTMLLIElement} toastEl - The toast DOM element
   * @param {'success' | 'error'} status - The status determining which icon to display
   * @private
   */
  private updatePromiseIcon(
    toastEl: HTMLLIElement,
    status: 'success' | 'error',
  ) {
    const toastContent = toastEl.querySelector(`[data-promise-content]`);
    if (!toastContent) return;

    const icon = toastContent.querySelector('[data-set-icon]');

    let newIcon: HTMLSpanElement;

    switch (status) {
      case 'error':
        newIcon = this.setToastIcon('error');
        break;
      default:
        newIcon = this.setToastIcon('success');
        break;
    }

    toastContent.replaceChild(newIcon, icon!);
  }

  /**
   * Internal method to create and display a standard toast notification
   * @param {number} toastId - Unique identifier for the toast
   * @param {ToastOptions} [options={}] - Toast configuration
   * @private
   */
  private addToast(toastId: number, options: ToastOptions = {}) {
    const { title = 'Title' } = options;
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
      type: 'toast',
      id: toastId,
    });

    const icon = this.setToastIcon(toast.type);
    toastEl.appendChild(icon);
    toastEl.appendChild(toastContent);
    // if theres an old node inserted, insert before the node to appear first
    if (this.lastNode) {
      this.toastContentWrapper.insertBefore(toastEl, this.lastNode);
    } else {
      this.toastContentWrapper.appendChild(toastEl);
    }

    // mark as last node attached
    this.setLastNode(toastEl);

    // reorder toasts
    this.reorderToasts();
    // handle the toast completion
    this.handleComplete(toastId);
  }

  /**
   * Calculates the vertical offset for a toast based on its position in the stack
   * Used to properly position toasts vertically with gaps
   * @param {number} offsetY - The index position of the toast in the stack
   * @param {'top' | 'bottom'} direction - Whether toasts stack from top or bottom
   * @param {number} elementHeight - Toast element height
   * @returns {number} The calculated offset in pixels
   * @private
   */
  private calcOffset({
    direction,
    offsetY,
    elementHeight,
  }: {
    offsetY: number;
    direction: 'top' | 'bottom';
    elementHeight: number;
  }) {
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
   * Reorders all toasts by updating their CSS variables for positioning and z-index
   * Newest toast appears on top (index 0) and only visible toasts up to maxItemToRender are shown
   * @private
   */
  private reorderToasts() {
    const toastElements = this.toastContentWrapper.querySelectorAll(
      '[data-toast-item="true"]',
    );
    const [y, x] = this.position.split('-');

    let startY = 0;

    toastElements.forEach((el, index) => {
      const zIndex = index + 1;
      const visible = index + 1 <= this.maxItemToRender;
      const height = el.getBoundingClientRect().height;

      (el as HTMLElement).style.setProperty('--offset', `${startY}px`);
      (el as HTMLElement).style.setProperty('--z-index', zIndex.toString());
      el.setAttribute('data-visible', visible.toString());

      startY += height + this.gap;
    });
  }

  /**
   * Creates the content wrapper element for a toast
   * Differentiates between standard toast and promise toast layouts
   * @param {ToastParams} params - Configuration for the toast content
   * @returns {HTMLDivElement} The created content wrapper element
   * @private
   */
  private createToastContent({ title, message, type = 'toast' }: ToastParams) {
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

  /**
   * Creates an SVG icon element based on the toast type
   * @param {ToastType} type - The type of toast (success, error, warning, info, loader)
   * @returns {HTMLSpanElement} The icon element with embedded SVG
   * @private
   */
  private setToastIcon(type: ToastType) {
    const icon = document.createElement('span');
    icon.setAttribute('data-set-icon', '');
    icon.setAttribute('data-icon-type', type);

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

  /**
   * Removes a toast notification from both the DOM and internal tracking array
   * Also clears any pending timeout to prevent memory leaks
   * @param {number} id - The unique identifier of the toast to remove
   */
  private removeToast(id: number) {
    // clear toast timeout
    const toastIndex = this.toasts.findIndex((toast) => toast.id === id);
    if (toastIndex !== -1 && this.toasts[toastIndex].timeoutId) {
      clearTimeout(this.toasts[toastIndex].timeoutId);
    }

    // update toasts array
    this.toasts = this.toasts.filter((toast) => toast.id !== id);

    const targetToast = this.toastContentWrapper?.querySelector(
      `[data-toast-id="${id}"]`,
    );
    if (targetToast && this.toastContentWrapper) {
      this.toastContentWrapper.removeChild(targetToast);
      this.updateLastNode(targetToast as HTMLLIElement);
    }
  }
}
