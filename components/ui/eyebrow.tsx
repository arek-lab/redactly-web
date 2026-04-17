import { cn } from '@/lib/utils'

interface EyebrowProps {
  className?: string
  children: React.ReactNode
}

export function Eyebrow({ className, children }: EyebrowProps) {
  return (
    <span
      className={cn(
        'inline-block text-[12px] font-semibold tracking-[0.06em] uppercase',
        'text-text-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}
