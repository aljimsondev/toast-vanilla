export var ToastVanilla = {
  init: () => {},

  createToastContainer: () => {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';

    document.body.appendChild(toastContainer);
  },
};
