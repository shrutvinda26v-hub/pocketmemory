import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(26,34,28,0.45)]"
            aria-label="Close dialog"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[var(--line)] bg-[#f7f2ea] p-5 shadow-2xl sm:rounded-3xl sm:p-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id="modal-title" className="font-display text-3xl text-[var(--ink)]">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-[var(--muted)] hover:bg-[rgba(74,107,82,0.1)] hover:text-[var(--ink)]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
