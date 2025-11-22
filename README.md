# ToastJs

A lightweight, vanilla JavaScript toast notification system with zero dependencies. Display elegant notifications with support for standard toasts and promise-based async operations.

## Features

- **No Dependencies** - Pure vanilla JavaScript
- **Accessible** - Built with ARIA labels and semantic HTML
- **Performant** - Lightweight and efficient DOM manipulation
- **Highly Customizable** - Control every aspect including colors, spacing, positioning, duration, and variants
- **Design System Integration** - Seamlessly integrate with shadcn/ui and other design systems using CSS variables
- **Multiple Toast Types** - Success, error, warning, info, and loader states
- **Promise Support** - Automatic loading, success, and error state management

## Installation

```bash
npm install toastjs
```

## Quick Start

```javascript
import { ToastVanilla } from 'toastjs';

// Initialize the toast system
const toast = new ToastVanilla({
  maxItemToRender: 3,
  position: 'top-right',
  duration: 3000,
});

// Show notifications
toast.success('Operation completed!');
toast.error('Something went wrong');
toast.warn('Please review this');
toast.info('Here's some information');
```

## Configuration

Initialize `ToastVanilla` with a configuration object:

```javascript
const toast = new ToastVanilla({
  maxItemToRender: 3, // Maximum visible toasts
  position: 'top-right', // top-left, top-right, bottom-left, bottom-right
  duration: 3000, // Auto-dismiss time in milliseconds
  styles: {
    // Custom styling (optional)
    borderRadius: 8,
    gap: 16,
    background: '#ffffff',
    // ... more style options
  },
});
```

### Position Options

- `top-left`
- `top-right`
- `bottom-left`
- `bottom-right`

## API

### Standard Toasts

#### `success(message, options?)`

Display a success notification.

```javascript
toast.success('File uploaded successfully', {
  title: 'Upload Complete',
  duration: 3000,
  variant: 'filled',
});
```

#### `error(message, options?)`

Display an error notification.

```javascript
toast.error('Failed to upload file', {
  title: 'Upload Failed',
  variant: 'outline',
});
```

#### `warn(message, options?)`

Display a warning notification.

```javascript
toast.warn('This action cannot be undone', {
  title: 'Warning',
});
```

#### `info(message, options?)`

Display an info notification.

```javascript
toast.info('Your session will expire soon', {
  title: 'Reminder',
});
```

### Promise-Based Toasts

Simple example of promise toast with AbortController

```javascript
const controller = new AbortController();

await toast.promise(
  async () => {
    // Your async operation
    const response = await fetch('/api/data', { signal: controller.signal });
    return response.json();
  },
  {
    loading: 'Loading data...',
    success: (data) => `Loaded ${data.items} items`,
    error: (err) => `Failed: ${err.message}`,
    dissmissable: true,
    onDismissCallback: () => controller.abort(),
  },
);
```

## Options

### Toast Options

| Option        | Type                                                           | Default       | Description                                              | Use Case                                                                              |
| ------------- | -------------------------------------------------------------- | ------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `title`       | `string`                                                       | `'Title'`     | The heading text displayed in the toast                  | Provide context about the notification type (e.g., "Success", "Error")                |
| `duration`    | `number`                                                       | `3000`        | Time in milliseconds before the toast auto-dismisses     | Longer for important info, shorter for quick confirmations                            |
| `variant`     | `'outline' \| 'filled' \| 'default'`                           | `'default'`   | Visual style of the toast                                | `outline` for subtle notifications, `filled` for emphasis, `default` for balance      |
| `dismissable` | `boolean`                                                      | `'true'`      | Allows user to dismiss the toast by clicking an X button | Disable for critical toasts to ensure users read the message before it auto-dismisses |
| `position`    | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | Where toasts appear on screen                            | Position based on UI layout and user attention flow                                   |

### Promise Options

| Option              | Type                       | Required | Description                                               | Use Case                                                                        |
| ------------------- | -------------------------- | -------- | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `loading`           | `string`                   | ✓        | Message displayed while the promise is pending            | Show user the operation is in progress (e.g., "Uploading file...")              |
| `success`           | `(data: T) => string`      | ✓        | Function that returns success message from promise result | Display result data (e.g., `(data) => 'Uploaded 5 files'`)                      |
| `error`             | `(error: Error) => string` | ✓        | Function that returns error message from the error object | Show helpful error info (e.g., `(err) => 'Failed: ${err.message}'`)             |
| `duration`          | `number`                   | ✗        | Time before toast dismisses after completion              | Override default duration for specific operations                               |
| `onDismissCallback` | `()=>void`                 | ✗        | A callback on dismissing toast                            | Promise cleanup callback e.g. fetching in the API with AbortController clean up |
| `dismissable`       | `boolean`                  | ✗        | Allows user to dismiss the toast by clicking an X button  | Disable for important promise operation                                         |

### Configuration Options

| Option            | Type                                                           | Default       | Description                               | Use Case                                               |
| ----------------- | -------------------------------------------------------------- | ------------- | ----------------------------------------- | ------------------------------------------------------ |
| `position`        | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | Where toasts appear on screen             | Position based on UI layout and user attention flow    |
| `maxItemToRender` | `number`                                                       | `3`           | Maximum number of visible toasts at once  | Prevent toast overflow; use 1-5 based on screen size   |
| `duration`        | `number`                                                       | `3000`        | Default auto-dismiss time in milliseconds | Adjust based on message complexity (2000-5000 typical) |
| `styles`          | `ToastStyle`                                                   | `{}`          | Custom colors and dimensions              | Override defaults or integrate with design system      |

### Style Options

#### Layout & Spacing

| Property       | Type     | Default | Description                              | Use Case                                 |
| -------------- | -------- | ------- | ---------------------------------------- | ---------------------------------------- |
| `offset`       | `number` | `16`    | Distance in pixels from screen edges     | Increase for mobile-safe spacing         |
| `borderRadius` | `number` | `8`     | Corner radius in pixels                  | Match your design system's border radius |
| `gap`          | `number` | `16`    | Spacing between stacked toasts in pixels | Increase for more visual separation      |

#### Background & Border

| Property     | Type     | Default                            | Description                                | Use Case                                |
| ------------ | -------- | ---------------------------------- | ------------------------------------------ | --------------------------------------- |
| `background` | `string` | `'oklch(1 0 0)'`                   | Toast background color (default & outline) | White or light backgrounds for contrast |
| `border`     | `string` | `'oklch(95.514% 0.00011 271.152)'` | Border color (outline variant)             | Subtle gray border for definition       |

#### Status Colors

| Property       | Type     | Default                        | Description             | Use Case                           |
| -------------- | -------- | ------------------------------ | ----------------------- | ---------------------------------- |
| `successColor` | `string` | `'oklch(0.627 0.194 149.214)'` | Success indicator color | Green-tinted for positive feedback |
| `errorColor`   | `string` | `'oklch(0.577 0.245 27.325)'`  | Error indicator color   | Red-tinted for errors              |
| `warningColor` | `string` | `'oklch(0.705 0.213 47.604)'`  | Warning indicator color | Orange-tinted for caution          |
| `infoColor`    | `string` | `'oklch(0.546 0.245 262.881)'` | Info indicator color    | Blue-tinted for information        |

#### Text Colors (Default & Outline Variants)

| Property             | Type     | Default                        | Description        | Use Case                               |
| -------------------- | -------- | ------------------------------ | ------------------ | -------------------------------------- |
| `primaryTextColor`   | `string` | `'oklch(0.141 0.005 285.823)'` | Title text color   | Dark for high contrast and readability |
| `secondaryTextColor` | `string` | `'oklch(0.21 0.006 285.885)'`  | Message text color | Slightly lighter than primary text     |

#### Text Colors (Filled Variant)

| Property                       | Type     | Default              | Description                              | Use Case                                       |
| ------------------------------ | -------- | -------------------- | ---------------------------------------- | ---------------------------------------------- |
| `primaryTextColorForeground`   | `string` | `'oklch(1 0 0)'`     | Title text color on colored background   | White/light text for filled backgrounds        |
| `secondaryTextColorForeground` | `string` | `'oklch(0.985 0 0)'` | Message text color on colored background | Off-white for secondary text in filled variant |

#### Icon Stroke (Default & Outline Variants)

| Property      | Type     | Default          | Description                         | Use Case                   |
| ------------- | -------- | ---------------- | ----------------------------------- | -------------------------- |
| `strokeColor` | `string` | `'oklch(1 0 0)'` | Icon stroke color (default variant) | White for thin icon lines  |
| `fillColor`   | `string` | `'oklch(1 0 0)'` | Icon fill color (default variant)   | White for solid icon areas |

#### Icon Stroke (Filled Variant)

| Property                | Type     | Default              | Description                             | Use Case                                     |
| ----------------------- | -------- | -------------------- | --------------------------------------- | -------------------------------------------- |
| `strokeColorForeground` | `string` | `'oklch(0.985 0 0)'` | Icon stroke color on colored background | Light color for contrast on dark backgrounds |

#### Complete Style Configuration Example

```javascript
const toast = new ToastVanilla({
  styles: {
    // Layout
    offset: 16,
    borderRadius: 8,
    gap: 16,

    // Colors - Default & Outline
    background: '#ffffff',
    border: '#e5e7eb',

    // Status Colors
    successColor: '#10b981',
    errorColor: '#ef4444',
    warningColor: '#f59e0b',
    infoColor: '#3b82f6',

    // Text - Default & Outline
    primaryTextColor: '#1f2937',
    secondaryTextColor: '#6b7280',

    // Text - Filled Variant
    primaryTextColorForeground: '#ffffff',
    secondaryTextColorForeground: '#f3f4f6',

    // Icons - Default & Outline
    strokeColor: '#ffffff',
    fillColor: '#ffffff',

    // Icons - Filled Variant
    strokeColorForeground: '#fafafa',
  },
});
```

## Styling

Customize the appearance with the `styles` configuration:

```javascript
const toast = new ToastVanilla({
  styles: {
    offset: 16, // Distance from viewport edge
    borderRadius: 8, // Corner radius
    gap: 16, // Space between toasts
    background: '#ffffff', // Toast background
    border: '#e5e7eb', // Border color
    successColor: 'oklch(0.627 0.194 149.214)',
    errorColor: 'oklch(0.577 0.245 27.325)',
    warningColor: 'oklch(0.705 0.213 47.604)',
    infoColor: 'oklch(0.546 0.245 262.881)',
    primaryTextColor: 'oklch(0.141 0.005 285.823)',
    secondaryTextColor: 'oklch(0.21 0.006 285.885)',
    strokeColor: '#ffffff',
    fillColor: '#ffffff',
  },
});
```

## Dark Theme

Toastjs does not support dark theme by default however to achieve dark theme you can use your application css variables that supports dark/light theme

```css
/* Light mode */
:root {
  --background: #e4e4e4;
  --foreground: #161616;
  --card: #eeeded;
  --primary: #0e0e0e;
  --primary-foreground: #fceded;
  --secondary: #1a1a1a;
  --border: #8f8f8f;
}
/* Dark mode */
.dark {
  --background: #161616;
  --foreground: #e4e4e4;
  --card: #292727;
  --primary: #fceded;
  --primary-foreground: #fceded;
  --secondary: #c7c7c7;
  --border: #363636;
}
```

Add css variables into your toast instance styles configuration

```javascript
import { ToastVanilla as Toast } from 'toastjs';
const toast = new Toast({
  position: 'bottom-left',
  styles: {
    background: 'var(--card)',
    primaryTextColor: 'var(--primary)',
    primaryTextColorForeground: 'var(--primary-foreground)',
    secondaryTextColor: 'var(--secondary)',
    border: 'var(--border)',
    // ... more style options
  },
});
```

## Examples

### Simple Notification

```javascript
toast.success('Changes saved');
```

### Notification with Custom Title

```javascript
toast.info('New features available', {
  title: 'Update',
  variant: 'filled',
});
```

### Track an API Call

```javascript
const controller = new AbortController();

await toast.promise(
  () =>
    fetch('/api/users', { signal: controller.signal }).then((r) => r.json()),
  {
    loading: 'Fetching users...',
    success: (users) => `Loaded ${users.length} users`,
    error: (err) =>
      err.name === 'AbortError' ? 'Request cancelled' : `Error: ${err.message}`,
    dismissable: true,
    onDismissCallback: () => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    },
  },
);
```

### File Upload with Loading State

```javascript
await toast.promise(
  async () => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/upload', { method: 'POST', body: formData });
    return res.json();
  },
  {
    loading: 'Uploading file...',
    success: (result) => `Uploaded: ${result.filename}`,
    error: (err) => `Upload failed: ${err.message}`,
    duration: 4000,
  },
);
```

## React Integration

Use ToastVanilla seamlessly in React applications. Initialize it outside of components to maintain a singleton instance:

```jsx
import { ToastVanilla } from 'toastjs';
import 'toastjs/dist/index.css';

// Initialize outside component to persist across renders
const toast = new ToastVanilla({
  position: 'top-right',
  maxItemToRender: 3,
});

export default function MyComponent() {
  return <button onClick={() => toast.success('Saved!')}>Save</button>;
}
```

### With shadcn/ui CSS Variables

ToastVanilla integrates beautifully with shadcn/ui design systems. Map the toast styles to your design tokens:

```jsx
import { ToastVanilla } from 'toastjs';
import 'toastjs/dist/index.css';

const toast = new ToastVanilla({
  position: 'top-left',
  maxItemToRender: 3,
  styles: {
    background: 'var(--background)',
    border: 'var(--border)',
    primaryTextColor: 'var(--foreground)',
    secondaryTextColor: 'var(--muted-foreground)',
    strokeColor: 'var(--accent)',
    strokeColorForeground: 'var(--accent-foreground)',
    successColor: 'var(--success)',
    errorColor: 'var(--destructive)',
    warningColor: 'var(--warning)',
    infoColor: 'var(--info)',
  },
});

export default function App() {
  return (
    <div>
      <button onClick={() => toast.success('Success!')}>Show Toast</button>
    </div>
  );
}
```

### Complete React Example

```jsx
import { useEffect, useState } from 'react';
import { ToastVanilla, type ToastVariant } from 'toastjs';
import 'toastjs/dist/index.css';

const toast = new ToastVanilla({
  position: 'top-left',
  maxItemToRender: 3,
  styles: {
    background: 'var(--background)',
    primaryTextColor: 'var(--foreground)',
    secondaryTextColor: 'var(--muted-foreground)',
    border: 'var(--border)',
  },
});

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const handleSuccessToast = (variant: ToastVariant) => {
    toast.success('Operation successful!', { variant });
  };

  const handlePromiseToast = async () => {
    await toast.promise(() => simulateApiCall(), {
      loading: 'Processing your request...',
      success: (data) => `Completed: ${data.message}`,
      error: (err) => `Failed: ${err.message}`,
      variant: 'filled',
    });
  };

  const simulateApiCall = () =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ message: 'All done!' });
      }, 3000);
    });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div>
      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? 'Light' : 'Dark'} Mode
      </button>

      <section>
        <h2>Default Variant</h2>
        <button onClick={() => handleSuccessToast('default')}>
          Show Success
        </button>

        <h2>Filled Variant</h2>
        <button onClick={() => handleSuccessToast('filled')}>
          Show Filled
        </button>

        <h2>Promise</h2>
        <button onClick={handlePromiseToast}>Start Async Operation</button>
      </section>
    </div>
  );
}
```

## Browser Support

Works in all modern browsers that support ES2020 and CSS variables.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
