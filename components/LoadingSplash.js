export default function LoadingSplash() {
  return (
    <div
      aria-hidden="true"
      className="splash-root fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-bg"
    >
      <img src="/logo.svg" alt="" className="h-14 sm:h-16 w-auto" />
      <div className="w-56 h-1 rounded-full bg-border/15 overflow-hidden">
        <div className="splash-progress-fill h-full rounded-full bg-accent" />
      </div>
    </div>
  );
}
