import * as React from "react";

/**
 * PMIX Design System - Skeleton Component
 * Swiss Design Standard - Minimal Loading States
 */

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, ...props }, ref) => {
    const style: React.CSSProperties = {
      width: width,
      height: height,
    };
    
    const variantClasses: Record<string, string> = {
      text: 'h-4 w-full rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-md',
    };

    return (
      <div
        ref={ref}
        className={`
          animate-pulse 
          bg-gray-200 
          ${variantClasses[variant]}
          ${className || ''}
        `}
        style={style}
        aria-hidden="true"
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

/**
 * Skeleton Group - For loading complex layouts
 */
interface SkeletonGroupProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const SkeletonGroup = ({ rows = 3, columns = 1, className }: SkeletonGroupProps) => {
  return (
    <div className={`space-y-3 ${className || ''}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`grid gap-4 ${columns > 1 ? `grid-cols-${columns}` : ''}`}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`${rowIndex}-${colIndex}`} variant="rectangular" height={20} />
          ))}
        </div>
      ))}
    </div>
  );
};

export { Skeleton, SkeletonGroup };
export type { SkeletonProps, SkeletonGroupProps };
