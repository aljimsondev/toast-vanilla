import { useEffect, useState } from 'react';
import { ToastVanilla, type ToastVariant } from 'toastjs';
import 'toastjs/dist/index.css';

const toast = new ToastVanilla({
  position: 'top-left',
  maxItemToRender: 3,
  styles: {
    background: 'var(--toast-background)',
    primaryTextColor: 'var(--foreground)',
    secondaryTextColor: 'var(--secondary-foreground)',
    strokeColor: 'var(--accent-foreground)',
    strokeColorForeground: 'oklch(0.985 0 0)',
    border: 'var(--border)',
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const handleErrorToast = (variant: ToastVariant) => {
    toast.error('An error occurred!', {
      variant,
    });
  };
  const handleInfoToast = (variant: ToastVariant) => {
    toast.info('This is the toast info!', {
      variant,
    });
  };

  const handleWarningToast = (variant: ToastVariant) => {
    toast.warn('A basic warning toast', {
      variant,
    });
  };

  const handleSuccessToast = (variant: ToastVariant) => {
    toast.success('Ohh, you have a success toast!', {
      variant,
    });
  };
  const handlePromiseToast = (variant: 'error' | 'success') => {
    toast.promise(() => myToastPromise(variant), {
      loading: 'Processing...',
      error: (e) => {
        return e?.message;
      },
      success: (data) => {
        return data.text;
      },
      variant: 'filled',
    });
  };

  async function myToastPromise(
    variant: 'error' | 'success',
  ): Promise<{ id: number; text: string }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (variant === 'error') {
          reject({ message: 'Toast promise rejection example!' });
        }
        resolve({ id: 1, text: 'This is a promise resolved message!' });
      }, 4000);
    });
  }

  const handleToogleMode = () => {
    setDarkMode((prev) => !prev);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <section>
      <button onClick={handleToogleMode}>Toggle Dark Mode</button>
      <div>
        <h1>Default Variant</h1>
        <div className="toast-actions">
          <button onClick={() => handleSuccessToast('default')}>
            Toast Success
          </button>
          <button onClick={() => handleErrorToast('default')}>
            Toast Error
          </button>
          <button onClick={() => handleInfoToast('default')}>Toast Info</button>
          <button onClick={() => handleWarningToast('default')}>
            Toast Warning
          </button>
        </div>
      </div>
      <div>
        <h1>Outline Variant</h1>
        <div className="toast-actions">
          <button onClick={() => handleSuccessToast('outline')}>
            Toast Success
          </button>
          <button onClick={() => handleErrorToast('outline')}>
            Toast Error
          </button>
          <button onClick={() => handleInfoToast('outline')}>Toast Info</button>
          <button onClick={() => handleWarningToast('outline')}>
            Toast Warning
          </button>
        </div>
      </div>
      <div>
        <h1>Filled Variant</h1>
        <div className="toast-actions">
          <button onClick={() => handleSuccessToast('filled')}>
            Toast Success
          </button>
          <button onClick={() => handleErrorToast('filled')}>
            Toast Error
          </button>
          <button onClick={() => handleInfoToast('filled')}>Toast Info</button>
          <button onClick={() => handleWarningToast('filled')}>
            Toast Warning
          </button>
        </div>
      </div>
      <div>
        <h1>Promise</h1>
        <div className="toast-actions">
          <button onClick={() => handlePromiseToast('success')}>
            Toast Promise Success
          </button>
          <button onClick={() => handlePromiseToast('error')}>
            Toast Promise Error
          </button>
        </div>
      </div>
    </section>
  );
}

export default App;
