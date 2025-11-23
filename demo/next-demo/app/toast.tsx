'use client';
import { ToastVanilla } from 'toastjs';
import 'toastjs/dist/index.css';

export const toast = new ToastVanilla({
  maxItemToRender: 3,
  position: 'top-left',
  styles: {
    strokeColorForeground: 'white',
  },
});

function ToastDemo() {
  const showToast = () => {
    toast.success('Toast in nextjs', {
      variant: 'filled',
      duration: 10000,
    });
  };

  return (
    <div className="container mx-auto h-dvh w-full flex items-center justify-center">
      <button
        className="px-8 py-4 rounded-lg bg-gray-900 border-gray-700 border hover:bg-gray-950 duration-300 cursor-pointer"
        onClick={showToast}
      >
        Toast
      </button>
    </div>
  );
}

export default ToastDemo;
