import { useEffect } from 'react';
import { X } from 'lucide-react';
import { TERMS_LAST_UPDATED, TERMS_SECTIONS } from '../../constants/termsAndConditions';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

/**
 * Full Terms & Conditions, shown as a popup rather than inline text so it
 * reads like an actual agreement users are expected to review. `onAccept`
 * is optional so the same modal can be opened read-only (e.g. from a
 * footer link) or as part of the registration consent flow.
 */
export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-[fadeIn_150ms_ease-out]"
      >
        <div className="relative shrink-0 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 px-6 py-6 text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-900">
            Terms &amp; Conditions
          </span>
          <h2 id="terms-modal-title" className="mt-3 text-xl font-bold">
            JomDekan Terms &amp; Conditions
          </h2>
          <p className="mt-1 text-sm text-primary-100">
            Please read this agreement carefully before creating your account.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <p className="text-xs text-slate-400">Last updated: {TERMS_LAST_UPDATED}</p>
          <div className="mt-4 space-y-5">
            {TERMS_SECTIONS.map((section) => (
              <div key={section.heading}>
                <h3 className="text-sm font-semibold text-slate-900">{section.heading}</h3>
                {section.body.map((paragraph, i) => (
                  <p key={i} className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Close
          </button>
          {onAccept && (
            <button
              type="button"
              onClick={onAccept}
              className="rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              I agree
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
