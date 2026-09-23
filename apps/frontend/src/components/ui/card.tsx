'use client';

import { Paper } from '@mantine/core';
import type { PaperProps } from '@mantine/core';
import { forwardRef } from 'react';
import classes from './card.module.css';

export interface CardProps extends Omit<PaperProps, 'children'> {
  children?: React.ReactNode;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, interactive = false, className, ...props }, ref) => {
    const cardClassName = [classes.card, interactive && classes.interactive, className]
      .filter(Boolean)
      .join(' ');
    return <Paper ref={ref} className={cardClassName} {...props}>{children}</Paper>;
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={[classes.header, className].filter(Boolean).join(' ')} {...props}>
        {children}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <h3 ref={ref} className={[classes.title, className].filter(Boolean).join(' ')} {...props}>
        {children}
      </h3>
    );
  }
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={[classes.description, className].filter(Boolean).join(' ')} {...props}>
        {children}
      </p>
    );
  }
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={[classes.footer, className].filter(Boolean).join(' ')} {...props}>
        {children}
      </div>
    );
  }
);
CardFooter.displayName = 'CardFooter';
