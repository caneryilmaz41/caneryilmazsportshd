import { BellIcon, CloseIcon } from './icons';

/** Hatırlatıcı zamanı gelince site içinde de gösterilir (bildirim izni yoksa tek uyarı budur). */
const ReminderToast = ({ reminder, onOpen, onClose }) => {
  if (!reminder) return null;
  return (
    <div
      role="alert"
      className="fixed inset-x-3 top-[4.25rem] z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-sky-400/30 bg-slate-900/95 p-3 shadow-2xl backdrop-blur lg:top-20"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
        <BellIcon active className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{reminder.name}</p>
        <p className="text-[11px] text-slate-400">Maç birazdan başlıyor</p>
      </div>
      <button
        type="button"
        onClick={() => onOpen(reminder)}
        className="shrink-0 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-400"
      >
        İzle
      </button>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
        aria-label="Kapat"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export default ReminderToast;
