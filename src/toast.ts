export type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
export type ToastVariant = 'outline' | 'filled' | 'default';
export type ToastType = 'success' | 'warning' | 'error' | 'info' | 'loader';

interface PromiseOptions<T> {
  loading?: string;
  error?: (e: Error) => string | Promise<string>;
  success?: (data: T) => string | Promise<string>;
}

type RequiredPromiseCallbacks<T> = Required<PromiseOptions<T>>;

type BaseToastOptions = {
  title?: string;
  variant?: ToastVariant;
  duration?: number;
  position?: ToastPosition;
  dismissable?: boolean;
  showIcon?: boolean;
};

type ToastOptions<T = any> = BaseToastOptions &
  (
    | {
        toastType: 'toast';
        loading?: never;
        error?: never;
        success?: never;
        callback?: never;
        onDismissCallback?: never;
      }
    | {
        toastType: 'promise';
        loading: string;
        error: (e: Error) => string | Promise<string>;
        success: (data: T) => string | Promise<string>;
        callback: () => T;
        onDismissCallback?: () => void;
      }
  );

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
  /**
   * document body offset from the toast container
   */
  offset?: number;
  /**
   * Toast item border radius
   */
  borderRadius?: number;
  /**
   * Spacing between toast item
   */
  gap?: number;
  /**
   * Toast item background
   */
  background?: string;
  /**
   * Toast item border color
   */
  border?: string;

  // variant colors
  successColor?: string;
  errorColor?: string;
  warningColor?: string;
  infoColor?: string;

  /**
   * Toast title color
   */
  primaryTextColor?: string;
  /**
   * Toast title color for filled variant
   */
  primaryTextColorForeground?: string;
  /**
   * Toast message color
   */
  secondaryTextColor?: string;
  /**
   * Toast message color for filled variant
   */
  secondaryTextColorForeground?: string;
  /**
   * svg icon stroke color
   */
  strokeColor?: string;
  /**
   * svg icon stroke color for filled variant
   */
  strokeColorForeground?: string;
  /**
   * svg icon fill color
   */
  fillColor?: string;
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
  id: number;
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
  private position: ToastPosition = 'top-right';
  private lastNode: HTMLLIElement | null = null;
  private duration: number;
  private styles: ToastStyle = {
    borderRadius: 8,
    errorColor: 'oklch(0.577 0.245 27.325)',
    gap: 16,
    offset: 16,
    infoColor: 'oklch(0.546 0.245 262.881)',
    successColor: 'oklch(0.627 0.194 149.214)',
    warningColor: 'oklch(0.705 0.213 47.604)',
    primaryTextColor: '0.141 0.005 285.823',
    primaryTextColorForeground: 'oklch(1 0 0)',
    secondaryTextColor: 'oklch(0.21 0.006 285.885)',
    secondaryTextColorForeground: 'oklch(0.985 0 0)',
    background: 'oklch(1 0 0)',
    fillColor: 'oklch(1 0 0)',
    strokeColor: 'oklch(1 0 0)',
    strokeColorForeground: 'oklch(1 0 0)',
    border: 'oklch(95.514% 0.00011 271.152)',
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

    if (typeof document !== 'undefined') {
      this.createToastContainer();
      this.createToastContentWrapper();
    }
  }

  /**
   * Get the toast container element in the DOM
   * @returns
   */
  private getToastContainer() {
    return document.querySelector('#toast-container');
  }

  /**
   *  Get the toast content container element in the DOM
   * @returns
   */
  getToastContentContainer() {
    return this.toastContainer.querySelector('ol');
  }

  /**
   * Creates the main toast container element and appends it to the DOM
   * @private
   */
  private createToastContainer() {
    // container already created
    const container = this.getToastContainer();

    if (container) {
      this.toastContainer = container as HTMLDivElement;
      return;
    }

    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-container';
    this.toastContainer.setAttribute('data-toaster-container', 'true');
    this.toastContainer.setAttribute('tab-index', '-1');
    this.toastContainer.setAttribute('aria-label', 'Toast Notifications!');
    document.body.appendChild(this.toastContainer);
  }

  /**
   * Creates the ordered list wrapper for toast items with position and styling
   */
  private createToastContentWrapper() {
    // check if toast container already exists
    const contentContainer = this.getToastContentContainer();
    if (contentContainer) {
      this.toastContentWrapper = contentContainer;
      return;
    }
    // otherwise create
    const { x, y } = this.getToastXYPosition();

    // create the ordered list element
    this.toastContentWrapper = document.createElement('ol');
    this.toastContentWrapper.setAttribute('tab-index', '-1');
    this.toastContentWrapper.setAttribute('data-toaster-content', 'true');
    this.toastContentWrapper.setAttribute('data-position-y', y);
    this.toastContentWrapper.setAttribute('data-position-x', x);

    // todo add the necessary css variables
    this.toastContentWrapper.style = `
      --toast-offset:${this.styles.offset}px;
      --width: 356px;
      --border-radius:${this.styles.borderRadius}px;
      --success-color:${this.styles.successColor};
      --error-color:${this.styles.errorColor};
      --warning-color:${this.styles.warningColor};
      --info-color:${this.styles.infoColor};
      --text-color-secondary:${this.styles.secondaryTextColor};
      --text-color-secondary-foreground:${
        this.styles.secondaryTextColorForeground
      };
      --text-color-primary:${this.styles.primaryTextColor};
      --text-colore-primary-foreground:${
        this.styles.primaryTextColorForeground
      };
      --stroke-color:${this.styles.strokeColor};
      --stroke-color-foreground:${this.styles.strokeColorForeground};
      --fill-color:${this.styles.fillColor};
      --background-color:${this.styles.background};
      --gap:${this.styles.gap}px;
      --border-color:${this.styles.border};
      --translate-x:${x === 'right' ? '100%' : '-100%'};
    `;

    this.toastContainer.appendChild(this.toastContentWrapper);
  }

  /**
   * Get the toast x,y position
   * @returns
   */
  private getToastXYPosition() {
    const [y, x] = this.position.split('-');

    return {
      x,
      y,
    };
  }

  /**
   * Displays a success toast notification
   * @param {string} message - The message content to display
   * @param {ToastOptions} [options={}] - Optional toast configuration
   */
  success(message: string, options: BaseToastOptions = {}) {
    const id = Date.now();
    this.setToast({
      timestamp: new Date(),
      type: 'success',
      message: message,
      options: options as ToastOptions,
      id: id,
    });

    this.addToast(id, options as ToastOptions);
  }

  /**
   * Displays a warning toast notification
   * @param {string} message - The message content to display
   * @param {ToastOptions} [options={}] - Optional toast configuration
   */
  warn(message: string, options: BaseToastOptions = {}) {
    const id = Date.now();

    this.setToast({
      timestamp: new Date(),
      type: 'warning',
      message: message,
      options: options as ToastOptions,
      id: id,
    });

    this.addToast(id, options as ToastOptions);
  }

  /**
   * Displays an error toast notification
   * @param {string} message - The message content to display
   * @param {ToastOptions} [options={}] - Optional toast configuration
   */
  error(message: string, options: BaseToastOptions = {}) {
    const id = Date.now();

    this.setToast({
      timestamp: new Date(),
      type: 'error',
      message: message,
      options: options as ToastOptions,
      id: id,
    });

    this.addToast(id, options as ToastOptions);
  }

  /**
   * Displays an info toast notification
   * @param {string} message - The message content to display
   * @param {ToastOptions} [options={}] - Optional toast configuration
   */
  info(message: string, options: BaseToastOptions = {}) {
    const id = Date.now();

    this.setToast({
      timestamp: new Date(),
      type: 'info',
      message: message,
      options: options as ToastOptions,
      id: id,
    });

    this.addToast(id, options as ToastOptions);
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
    options: RequiredPromiseCallbacks<T> & {
      duration?: ToastOptions['duration'];
      dismissable?: ToastOptions['dismissable'];
      onDismissCallback?: () => void;
    },
  ) {
    const id = Date.now();
    const { dismissable = false, duration, loading, success, error } = options;

    this.setToast({
      timestamp: new Date(),
      type: 'loader',
      message: '',
      options: options as ToastOptions,
      id: id,
      callback: callback,
    });

    this.addToast(id, {
      toastType: 'promise',
      callback,
      loading: loading,
      success: success,
      error: error,
      duration: duration || this.duration,
      variant: 'default',
      dismissable: dismissable, // disable dismissable on promise toast by default
      onDismissCallback: options.onDismissCallback,
    });
  }

  /**
   * Create a toast element with base data attributes atttached
   * @param toast
   * @returns
   */
  private createToastElement(
    toast: Toast,
    options: { variant?: ToastVariant },
  ) {
    const { variant = 'default' } = options;
    // Create new toast element (only happens once per toast)
    const toastEl = document.createElement('li');
    toastEl.setAttribute('data-toast-item', 'true');
    toastEl.setAttribute('data-toast-type', toast.type);
    toastEl.setAttribute('data-toast-variant', variant);
    toastEl.setAttribute('data-toast-id', toast.id.toString());
    toastEl.setAttribute('data-expanded', 'true');
    toastEl.setAttribute('data-mounted', 'false');

    return toastEl;
  }

  /**
   * Set new toast
   * @param toast
   */
  private setToast(toast: Toast) {
    const old = this.toasts;
    // this will placed the new item to the first array
    this.toasts = [toast].concat(old);
  }

  /**
   * Set node as the last node added in the toast container
   * @param node
   */
  private setLastNode(node: HTMLLIElement) {
    this.lastNode = node;
  }

  /**
   * Update the last node if it is the item that is currently queued for removal
   * @param node
   */
  private updateLastNode(node: HTMLLIElement) {
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
  private handleComplete(toastId: number, duration?: number) {
    const toastDuration = duration || this.duration;
    // Handle promise with proper cleanup
    const timeoutId = setTimeout(() => {
      this.removeToast(toastId);
    }, toastDuration);

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
   *
   * This method handles the complete lifecycle of rendering a toast, including:
   * - Creating the DOM element and applying animations
   * - Building toast content with appropriate icons and messages
   * - Distinguishing between standard toasts and promise-based toasts
   * - Managing toast positioning and ordering
   * - Triggering callbacks for promise-based toasts
   *
   * @param {number} toastId - Unique identifier for the toast instance
   * @param {ToastOptions} [options={}] - Toast configuration object
   * @param {string} [options.title='Title'] - The title displayed in the toast
   * @param {'toast' | 'promise'} [options.toastType='toast'] - Type of toast to render
   * @param {string} [options.loading] - Loading text displayed for promise toasts during execution
   * @param {number} [options.duration] - Duration in milliseconds before toast auto-dismisses (only for standard toasts)
   * @param {ToastVariant} [options.variant] - Visual variant of the toast ('outline' | 'filled' | 'default')
   * @param {() => Promise<T>} [options.callback] - Async function to execute (required for promise toasts)
   * @param {(data: T) => string} [options.success] - Callback to generate success message from promise result (required for promise toasts)
   * @param {(error: Error) => string} [options.error] - Callback to generate error message if promise fails (required for promise toasts)
   *
   * @returns {void}
   *
   * @example
   * // Standard toast
   * this.addToast(1, {
   *   title: 'Success',
   *   toastType: 'toast',
   *   duration: 3000,
   *   variant: 'filled'
   * });
   *
   * @example
   * // Promise-based toast
   * this.addToast(2, {
   *   title: 'Uploading',
   *   toastType: 'promise',
   *   loading: 'Please wait...',
   *   callback: () => uploadFile(),
   *   success: (data) => `Uploaded: ${data.filename}`,
   *   error: (err) => `Failed: ${err.message}`
   * });
   *
   * @private
   * @throws Does not throw but silently returns if toast with given ID is not found
   */
  private addToast(
    toastId: number,
    options: ToastOptions = { toastType: 'toast' },
  ) {
    const {
      title = '',
      toastType = 'toast',
      loading,
      duration,
      variant,
      position,
      dismissable = true,
      showIcon = false,
      onDismissCallback,
    } = options;

    const toast = this.getToast(toastId);

    if (!toast) return;

    // Create new toast element (only happens once per toast)
    const toastEl = this.createToastElement(toast, { variant: variant });

    if (position && position !== this.position) {
      // update new toast position
      this.setToastPosition(position);
    }

    // Trigger mount animation by setting data attribute after initial render
    setTimeout(() => {
      toastEl.setAttribute('data-mounted', 'true');
    }, 100);

    // Build toast content structure with title and message
    const toastContent = this.createToastContent({
      title: title,
      message: toast.message,
      type: toastType,
      id: toastId,
    });

    if (toastType === 'toast') {
      // Check if hideIcon is not set to false
      if (!showIcon) {
        // Standard toast: append status icon (success, error, info, warning)
        const icon = this.setToastIcon(toast.type);
        toastEl.appendChild(icon);
      }
    } else {
      // Promise toast: append loader icon and loading text
      // Get the promise content wrapper element
      const toastContentMain = toastContent.querySelector(
        '[data-promise-content]',
      ) as Element;
      if (!toastContentMain)
        return console.warn('Toast main content not found!');

      // Create and append animated loader icon
      const loaderIcon = this.setToastIcon('loader');
      loaderIcon.setAttribute('data-loader-icon', '');
      toastContentMain.appendChild(loaderIcon);

      // Create and append loading message text
      const text = document.createElement('p');
      text.textContent = loading || 'Loading...';
      toastContentMain.appendChild(text);
    }

    // Append completed content structure to toast element
    toastEl.appendChild(toastContent);

    // Append dismiss element when required
    if (dismissable) {
      const dismissEl = this.createDismissElement(toastId, onDismissCallback);
      toastEl.appendChild(dismissEl);
    }

    // Insert toast into DOM (maintains proper z-index and ordering)
    this.insertToast(toastEl);

    // Track this as the most recently added toast
    this.setLastNode(toastEl);

    // Update visual ordering of all active toasts
    this.reorderToasts();

    // Execute promise callback and update UI based on result
    if (toastType === 'promise') {
      const callback = options.callback!;
      const error = options.error!;
      const success = options.success!;

      this.resolveCallback({
        callback,
        error,
        success,
        toastEl,
        toastId,
        duration,
      });
    } else {
      // Standard toast: schedule auto-dismissal based on duration
      this.handleComplete(toastId, duration);
    }
  }

  /**
   * Sets the toast container position and updates related CSS variables
   *
   * Calculates the unmount animation offset based on horizontal alignment
   * @param {ToastPosition} position - The position string in format "vertical-horizontal" (e.g., "top-right")
   */
  private setToastPosition(position: ToastPosition) {
    this.position = position;
    // update the toast container
    const container = document.querySelector(
      '[data-toaster-content]',
    ) as HTMLElement;

    if (container) {
      const [y, x] = position.split('-');
      const unmountOffset = x === 'left' ? '-100%' : '100%';
      container.setAttribute('data-position-y', y);
      container.setAttribute('data-position-x', x);
      container.style.setProperty('--translate-x', unmountOffset);
    }
  }

  /**
   * Resolve the toast promise callback
   *
   * Wraps the callback execution with Promise.resolve() to handle both:
   * - Synchronous errors thrown before the promise is returned
   * - Asynchronous rejections from the returned promise
   *
   * Updates the toast UI based on success or failure, then completes the toast lifecycle.
   */
  private resolveCallback<T>({
    callback,
    error,
    success,
    toastId,
    toastEl,
    duration,
  }: {
    callback: () => Promise<T>;
    success: RequiredPromiseCallbacks<T>['success'];
    error: RequiredPromiseCallbacks<T>['error'];
    toastId: number;
    toastEl: HTMLLIElement;
    duration?: number;
  }) {
    Promise.resolve()
      .then(() => callback())
      .then(async (data) => {
        // Only update if toast still exists in DOM
        if (!toastEl.isConnected) return;

        const textResponse = await Promise.resolve(success(data));
        this.updatePromiseToast(toastEl, {
          message: textResponse || 'Success!',
          status: 'success',
        });
      })
      .catch(async (e) => {
        try {
          // Only update if toast still exists in DOM
          if (!toastEl.isConnected) return;

          const errorMessage = await Promise.resolve(error(e));
          this.updatePromiseToast(toastEl, {
            message: errorMessage,
            status: 'error',
          });
        } catch (err) {
          let message = 'Something went wrong!';
          if (err instanceof Error) {
            message = err?.message;
          }
          // Only update if toast still exists in DOM
          if (!toastEl.isConnected) return;

          this.updatePromiseToast(toastEl, {
            message: message,
            status: 'error',
          });
        }
      })
      .finally(() => {
        // Only proceed if toast still exists in DOM
        if (toastEl.isConnected) {
          this.handleComplete(toastId, duration);
        }
      });
  }

  /**
   * Calculates the vertical offset for a toast based on its position in the stack
   * Used to properly position toasts vertically with gaps
   * @param {number} offsetY - The index position of the toast in the stack
   * @param {'top' | 'bottom'} direction - Whether toasts stack from top or bottom
   * @returns {number} The calculated offset in pixels
   * @private
   */
  private calcOffset({
    direction,
    offsetY,
    height,
  }: {
    offsetY: number;
    direction: 'top' | 'bottom';
    height: number;
  }) {
    switch (direction) {
      case 'bottom':
        return -(offsetY + height);
      default:
        return offsetY;
    }
  }

  /**
   * Insert toast element in the content wrapper
   * @param toastEl
   */
  private insertToast(toastEl: HTMLLIElement) {
    if (this.lastNode) {
      this.toastContentWrapper.insertBefore(toastEl, this.lastNode);
    } else {
      this.toastContentWrapper.appendChild(toastEl);
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
    const { y } = this.getToastXYPosition();

    let startY = 0;

    toastElements.forEach((el, index) => {
      const zIndex = toastElements.length - (index + 1);
      const visible = index + 1 <= this.maxItemToRender;
      const height = el.getBoundingClientRect().height;

      const offsetY = this.calcOffset({
        direction: y as 'top' | 'bottom',
        offsetY: startY,
        height,
      });

      (el as HTMLElement).style.setProperty('--offset', `${offsetY}px`);
      (el as HTMLElement).style.setProperty('--z-index', zIndex.toString());
      el.setAttribute('data-visible', visible.toString());

      startY += height + this.styles.gap!;
    });
  }

  /**
   * Creates the content wrapper element for a toast
   * Differentiates between standard toast and promise toast layouts
   * @param {ToastParams} params - Configuration for the toast content
   * @returns {HTMLDivElement} The created content wrapper element
   * @private
   */
  private createToastContent({
    title = '',
    message,
    type = 'toast',
  }: ToastParams) {
    const content = document.createElement('div');
    content.className = 'toast-content';

    if (type === 'toast') {
      // check if title is provided
      if (title) {
        const titleEl = document.createElement('div');
        titleEl.setAttribute('data-toast-title', '');
        titleEl.textContent = title;
        content.appendChild(titleEl);
      }

      const descriptionEl = document.createElement('div');
      descriptionEl.textContent = message;
      content.appendChild(descriptionEl);
    } else {
      const promiseEl = document.createElement('div');
      promiseEl.setAttribute('data-promise-content', '');
      content.appendChild(promiseEl);
    }

    return content;
  }

  createDismissElement(toastId: number, onDismissCallback = () => {}) {
    // Create close button element
    const dismissEl = document.createElement('button');
    dismissEl.setAttribute('data-dismiss-btn', '');
    dismissEl.type = 'button';
    dismissEl.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

    // Add Event listener
    dismissEl.addEventListener('click', (e) => {
      e.preventDefault();
      this.removeToast(toastId);
      onDismissCallback();
    });

    return dismissEl;
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
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
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
    this.updateToasts(id);

    const targetToast = this.toastContentWrapper?.querySelector(
      `[data-toast-id="${id}"]`,
    );
    if (targetToast && this.toastContentWrapper) {
      // play unmount animation
      targetToast.setAttribute('data-dismiss', '');
      setTimeout(() => {
        this.toastContentWrapper.removeChild(targetToast);
        // check of removed node is the lastNode in the memory
        this.updateLastNode(targetToast as HTMLLIElement);
        // reorder toast after the node removal
        this.reorderToasts();
      }, 500);
    }
  }
  /**
   * Update toasts and remove the toast referencing the params `id`
   * @param toastId - toast id to be removed
   */
  private updateToasts(toastId: number) {
    this.toasts = this.toasts.filter((toast) => toast.id !== toastId);
  }

  /**
   * Get toast from toasts array
   * @param toastId - the toast id to retrieve from the toasts
   * @returns
   */
  private getToast(toastId: number) {
    const toast = this.toasts.find((t) => t.id === toastId);

    return toast;
  }
}
