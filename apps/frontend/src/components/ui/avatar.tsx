'use client';

import { Avatar as MantineAvatar, AvatarProps as MantineAvatarProps } from '@mantine/core';
import { forwardRef } from 'react';

export interface AvatarProps extends MantineAvatarProps {}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (props, ref) => {
    return <MantineAvatar ref={ref} {...props} />;
  }
);

Avatar.displayName = 'Avatar';
