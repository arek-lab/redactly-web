import { cn } from '@/lib/utils'

type BadgeVariant = 'accent' | 'muted' | 'found' | 'ok' | 'error'

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  accent: 'bg-accent/10 text-accent border border-accent/20',
  muted:  'bg-bg-surface text-text-muted border border-border-soft',
  found:  'bg-badge-found/10 text-badge-found border border-badge-found/20',
  ok:     'bg-badge-ok/20 text-text-primary border border-badge-ok/30',
  error:  'bg-bg-surface text-badge-error border border-border-soft',
}

export function Badge({ variant = 'muted', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-[4px]',
        'text-[13px] font-medium leading-tight',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
