import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 py-10 dark:border-slate-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold">Lernen</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Deutsch lernen für arabische Lernende.</p>
        </div>
        <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/learn">Dashboard</Link>
          <Link href="/learn/vocabulary">Vokabeln</Link>
          <Link href="/learn/exercises">Übungen</Link>
        </div>
      </div>
    </footer>
  );
}
