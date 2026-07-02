export default function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-[3px] border-line border-t-primary ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}
