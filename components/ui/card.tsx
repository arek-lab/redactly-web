import { cn } from '@/lib/utils'

interface CardProps {
  accentBorder?: boolean
  className?: string
  children: React.ReactNode
}

export function Card({ accentBorder = false, className, children }: CardProps) {
  return (
    <div
      className={cn(
        'bg-bg-white rounded-[12px] border border-border-soft p-6',
        accentBorder && 'border-l-2 border-l-accent',
        className,
      )}
    >
      {children}
    </div>
  )
}
