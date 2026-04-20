'use client'
import dynamic from 'next/dynamic'
import type { UploadZoneProps } from './upload-zone'

export const UploadZoneDynamic = dynamic<UploadZoneProps>(
  () => import('./upload-zone').then(m => m.UploadZone),
  {
    ssr: false,
    loading: () => (
      <div className="border-2 border-dashed border-border rounded-xl p-10 text-center text-text-secondary text-sm animate-pulse">
        Ładowanie...
      </div>
    ),
  }
)
