import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<IconSize, string> = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
};

interface IconProps {
  /** The Lucide icon component to render */
  icon: LucideIcon;
  /** Size preset for consistent sizing across the app */
  size?: IconSize;
  /** Accessible label - required for meaningful icons (announced by screen readers) */
  label?: string;
  /** Set to true for decorative icons (hidden from screen readers) */
  decorative?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible icon wrapper component.
 * 
 * Use `label` for meaningful icons that convey information.
 * Use `decorative` for icons that are purely visual (when text is nearby).
 * 
 * @example
 * // Meaningful icon - screen reader announces "Cook"
 * <Icon icon={Flame} label="Cook" />
 * 
 * // Decorative icon - hidden from screen readers
 * <Icon icon={Leaf} decorative /> Low energy
 */
export function Icon({ 
  icon: LucideIcon, 
  size = 'md', 
  label, 
  decorative = false,
  className 
}: IconProps) {
  if (decorative) {
    return <LucideIcon className={cn(sizes[size], className)} aria-hidden="true" />;
  }
  
  return (
    <LucideIcon 
      className={cn(sizes[size], className)} 
      role="img"
      aria-label={label}
    />
  );
}
