'use client';

import { TextInput, TextInputProps } from '@mantine/core';
import { forwardRef } from 'react';

export interface InputProps extends TextInputProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return <TextInput ref={ref} {...props} />;
  }
);

Input.displayName = 'Input';
