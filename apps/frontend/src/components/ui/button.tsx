import * as React from 'react';
import { Button as MantineButton } from '@mantine/core';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const variantMap: Record<string, string> = {
  default: 'filled',
  destructive: 'filled',
  outline: 'outline',
  secondary: 'light',
  ghost: 'subtle',
  link: 'link',
};

const colorMap: Record<string, string> = {
  destructive: 'red',
};

const sizeMap: Record<string, string> = {
  default: 'md',
  sm: 'xs',
  lg: 'lg',
  icon: 'icon-sm',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    if (asChild) {
      return (
        <MantineButton
          ref={ref}
          variant={variantMap[variant] || 'filled'}
          color={colorMap[variant]}
          size={sizeMap[size] || 'md'}
          className={className}
          {...props}
        >
          {children}
        </MantineButton>
      );
    }

    return (
      <MantineButton
        ref={ref}
        variant={variantMap[variant] || 'filled'}
        color={colorMap[variant]}
        size={sizeMap[size] || 'md'}
        className={className}
        {...props}
      >
        {children}
      </MantineButton>
    );
  }
);
Button.displayName = 'Button';

export { Button };
