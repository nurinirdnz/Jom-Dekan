export function Footer() {
  return (
    <footer className="border-t border-[#E7E6F3] bg-white py-4 text-center text-sm text-slate-500 transition-colors motion-safe:duration-200 dark:border-[#2E2A54] dark:bg-[#1B1836] dark:text-slate-400">
      <p>&copy; {new Date().getFullYear()} JomDekan. Built for Malaysian university students.</p>
    </footer>
  );
}
