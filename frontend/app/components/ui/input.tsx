import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2)}`;
    
    const inputClasses = `
      flex h-10 w-full rounded-md border px-3 py-2 text-sm 
      file:border-0 file:bg-transparent file:text-sm file:font-medium 
      placeholder:text-stone-500 
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
      disabled:cursor-not-allowed disabled:opacity-50
      ${error 
        ? 'border-red-300 focus-visible:ring-red-500 dark:border-red-600' 
        : 'border-stone-300 focus-visible:ring-stone-500 dark:border-stone-600'
      }
      bg-white dark:bg-stone-800 
      text-stone-900 dark:text-stone-100
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium leading-none text-stone-700 dark:text-stone-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={inputClasses}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 