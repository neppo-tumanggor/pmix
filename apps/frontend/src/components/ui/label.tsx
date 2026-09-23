import * as React from "react";

/**
 * PMIX Design System - Label Component
 * Swiss Design Standard - Clear, Accessible
 */

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`
        text-sm 
        font-medium 
        text-gray-700 
        ${className || ''}
      `}
      {...props}
    />
  );
});
Label.displayName = "Label";

export { Label };
