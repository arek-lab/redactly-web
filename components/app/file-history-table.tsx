import type { PdfJob } from '@/types/database'
import { Card } from '@/components/ui/card'

interface Props {
  jobs: PdfJob[]
}

const STATUS_LABELS: Record<string, string> = {
  done: 'Gotowy',
  processing: 'Przetwarzanie',
  error: 'Blad',
  pending: 'Oczekuje',
}

export function FileHistoryTable({ jobs }: Props) {
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
                {jobs.map((job) => (
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
        )}
      </Card>
    </section>
  )
}
