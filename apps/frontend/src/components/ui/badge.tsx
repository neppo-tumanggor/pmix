'use client';

import { Badge as MantineBadge, BadgeProps as MantineBadgeProps } from '@mantine/core';
import { forwardRef } from 'react';

export interface BadgeProps extends MantineBadgeProps {}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (props, ref) => {
    return <MantineBadge ref={ref} {...props} />;
  }
);

Badge.displayName = 'Badge';
