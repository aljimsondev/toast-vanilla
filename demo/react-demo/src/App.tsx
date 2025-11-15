import { ToastVanilla } from '../../../dist/index';
import '../../../dist/index.css';
import './App.css';

const toast = new ToastVanilla({
  position: 'top-left',
  maxItemToRender: 3,
  styles: {
    background: 'var(--foreground)',
    textColor: 'var(--secondary)',
    highlightColor: 'var(--primary-foreground)',
    offset: 0,
    gap: 10,
  },
});

function App() {
  const handleErrorToast = () => {
    toast.error('An error occurred!');
  };
  const handleInfoToast = () => {
    toast.info('This is the toast info!');
  };

  const handleWarningToast = () => {
    toast.warn('A basic warning toast');
  };

  const handleSuccessToast = () => {
    toast.success('Ohh, you have a success toast!');
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
    <div>
      <button onClick={handleSuccessToast}>Toast Success</button>
      <button onClick={handleErrorToast}>Toast Error</button>
      <button onClick={handleInfoToast}>Toast Info</button>
      <button onClick={handleWarningToast}>Toast Warning</button>
      <button onClick={handlePromiseToast}>Toast Promise</button>
    </div>
  );
}

export default App;
