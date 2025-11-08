interface ToastOptions {
  position?: 'top' | 'left' | 'bottom' | 'right';
}

export class ToastVanilla {
  toastContainer!: HTMLDivElement;
  constructor() {
    this.createToastContainer();
    console.log('running toast');
  }
  init() {}

  createToastContainer() {
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';

    document.body.appendChild(this.toastContainer);
  }

  success(message: 'string', options: ToastOptions = {}) {
    const {} = options;
    console.log(message);
  }

  showToast() {
    const toast = document.createElement('div');

    this.toastContainer.appendChild(toast);
  }
}
