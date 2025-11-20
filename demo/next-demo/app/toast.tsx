'use client';
import { ToastVanilla } from 'toast-vanilla';
import 'toast-vanilla/dist/index.css';

export const toast = new ToastVanilla({
  maxItemToRender: 3,
  position: 'top-left',
  styles: {
    strokeColorForeground: 'white',
  },
});

function ToastDemo() {
  const showToast = () => {
    toast.error('Toast in nextjs', {
      variant: 'filled',
      duration: 10000,
    });
  };

  return (
    <div>
      <button onClick={showToast}>Toast</button>
    </div>
  );
}

export default ToastDemo;
