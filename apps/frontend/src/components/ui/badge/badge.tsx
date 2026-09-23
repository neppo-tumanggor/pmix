import * as React from "react";

/**
 * PMIX Design System - Badge Component
 * Swiss Design Standard - Minimal, Functional
 */

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<string, string> = {
  default: 'bg-primary-100 text-primary-700 border-primary-200',
  secondary: 'bg-gray-100 text-gray-700 border-gray-200',
  success: 'bg-success-50 text-success-700 border-success-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  error: 'bg-error-50 text-error-700 border-error-200',
  info: 'bg-info-50 text-info-700 border-info-200',
};

const sizeClasses: Record<string, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex 
          items-center 
          font-medium 
          border 
          rounded-full
          transition-colors duration-150 ease-out
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
export type { BadgeProps };
