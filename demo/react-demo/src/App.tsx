import { ToastVanilla } from '../../../dist/index';
import '../../../dist/index.css';

const toast = new ToastVanilla({
  position: 'top-left',
  maxItemToRender: 3,
  styles: {
    background: 'var(--toast-background)',
    primaryTextColor: 'var(--foreground)',
    secondaryTextColor: 'var(--secondary-foreground)',
    strokeColor: 'var(--accent-foreground)',
    strokeColorForeground: 'var(--accent)',
  },
});

function App() {
  const handleErrorToast = () => {
    toast.error('An error occurred!', {
      variant: 'filled',
    });
  };
  const handleInfoToast = () => {
    toast.info('This is the toast info!', {
      variant: 'outline',
    });
  };

  const handleWarningToast = () => {
    toast.warn('A basic warning toast', {
      variant: 'outline',
    });
  };

  const handleSuccessToast = () => {
    toast.success('Ohh, you have a success toast!', {
      variant: 'filled',
    });
  };
  const handlePromiseToast = () => {
    toast.promise(myToastPromise, {
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

  async function myToastPromise(): Promise<{ id: number; text: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: 1, text: 'This is a promise resolved message!' });
      }, 4000);
    });
  }

  return (
    <div className="toast-actions">
      <button onClick={handleSuccessToast}>Toast Success</button>
      <button onClick={handleErrorToast}>Toast Error</button>
      <button onClick={handleInfoToast}>Toast Info</button>
      <button onClick={handleWarningToast}>Toast Warning</button>
      <button onClick={handlePromiseToast}>Toast Promise</button>
    </div>
  );
}

export default App;
