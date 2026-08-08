import Link from 'next/link'

export default function OrdersPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  return (
    <div className="flex items-center justify-center gap-4 pt-8">
      {currentPage > 1 && (
        <Link
          href={`/orders?page=${currentPage - 1}`}
          className="px-4 py-2 border border-border rounded-sm text-sm text-foreground hover:bg-secondary/50 transition"
        >
          ← Prev
        </Link>
      )}
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link
          href={`/orders?page=${currentPage + 1}`}
          className="px-4 py-2 border border-border rounded-sm text-sm text-foreground hover:bg-secondary/50 transition"
        >
          Next →
        </Link>
      )}
    </div>
  )
}