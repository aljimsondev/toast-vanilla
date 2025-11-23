'use client';
import { BaseToastOptions, ToastVanilla } from 'toastjs';
import 'toastjs/dist/index.css';

export const toast = new ToastVanilla({
  maxItemToRender: 3,
  position: 'top-left',
  styles: {
    strokeColorForeground: 'white',
  },
});

function ToastDemo() {
  const showToast = (options: BaseToastOptions) => {
    toast.success('Toast in nextjs', {
      variant: 'filled',
      ...options,
    });
  };

  return (
    <div className="container mx-auto h-dvh w-full flex items-center gap-4 justify-center">
      <button
        className="px-8 py-4 rounded-lg bg-gray-900 border-gray-700 border hover:bg-gray-950 duration-300 cursor-pointer"
        onClick={() => showToast({})}
      >
        Toast
      </button>
      <button
        className="px-8 py-4 rounded-lg bg-gray-900 border-gray-700 border hover:bg-gray-950 duration-300 cursor-pointer"
        onClick={() => showToast({ position: 'top-right' })}
      >
        Top Right
      </button>
      <button
        className="px-8 py-4 rounded-lg bg-gray-900 border-gray-700 border hover:bg-gray-950 duration-300 cursor-pointer"
        onClick={() => showToast({ position: 'bottom-left' })}
      >
        Bottom Left
      </button>
      <button
        className="px-8 py-4 rounded-lg bg-gray-900 border-gray-700 border hover:bg-gray-950 duration-300 cursor-pointer"
        onClick={() => showToast({ position: 'bottom-right' })}
      >
        Bottom Right
      </button>
    </div>
  );
}

export default ToastDemo;
