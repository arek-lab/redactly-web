'use client'

import { useState } from 'react'
import type { PdfJob } from '@/types/database'
import { Card } from '@/components/ui/card'

interface Props {
  jobs: PdfJob[]
}

const PAGE_SIZE = 10

const STATUS_LABELS: Record<string, string> = {
  done: 'Gotowy',
  processing: 'Przetwarzanie',
  error: 'Blad',
  pending: 'Oczekuje',
}

export function FileHistoryTable({ jobs }: Props) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const visible = jobs.slice(start, start + PAGE_SIZE)

  return (
    <section>
      <h2 className="text-[15px] font-semibold text-text-primary mb-4">
        Historia plików
      </h2>
      <Card className="p-0 overflow-hidden">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <p className="text-text-muted text-[13px]">
              Historia przetworzonych plików pojawi sie tutaj.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border-soft">
                    <th className="text-left text-text-muted font-medium px-5 py-3">
                      Nazwa pliku
                    </th>
                    <th className="text-left text-text-muted font-medium px-5 py-3">
                      Data
                    </th>
                    <th className="text-left text-text-muted font-medium px-5 py-3">
                      Strony
                    </th>
                    <th className="text-left text-text-muted font-medium px-5 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-border-soft last:border-0"
                    >
                      <td className="px-5 py-3 text-text-primary font-medium">
                        {job.filename}
                      </td>
                      <td className="px-5 py-3 text-text-secondary">
                        {new Date(job.created_at).toLocaleDateString('pl-PL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3 text-text-secondary">{job.pages}</td>
                      <td className="px-5 py-3 text-text-secondary">
                        {STATUS_LABELS[job.status] ?? job.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border-soft">
                <span className="text-[12px] text-text-muted">
                  Strona {page} z {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-[12px] rounded-md border border-border-soft text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
                  >
                    Poprzednia
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-[12px] rounded-md border border-border-soft text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
                  >
                    Następna
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </section>
  )
}
