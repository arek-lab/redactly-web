import { cn } from '@/lib/utils'

type ButtonVariant = 'accent' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  accent:
    'bg-accent text-white hover:bg-accent-hover active:bg-accent-hover',
  outline:
    'bg-transparent border border-border-mid text-text-primary hover:border-accent hover:text-accent',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
}

export function Button({
  variant = 'accent',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'rounded-[7px] cursor-pointer select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
