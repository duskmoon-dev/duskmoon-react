import { cn } from '../../utils';
import type { ButtonVariant, ButtonSize } from './Button.types';

export function getButtonClasses({
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  className?: string;
}) {
  return cn(
    'btn', // Base class
    `btn-${variant}`,
    `btn-${size}`,
    isLoading && 'btn-loading',
    className
  );
}
