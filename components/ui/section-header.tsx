import { cn } from '@/lib/utils'
import { Eyebrow } from './eyebrow'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  centered?: boolean
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('space-y-3', centered && 'text-center', className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-display text-text-primary">{title}</h2>
      {description && (
        <p className="text-text-secondary max-w-xl">{description}</p>
      )}
    </div>
  )
}
