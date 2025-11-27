export function TopLoadingBar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 overflow-hidden"
      role="progressbar"
      aria-label="Loading"
    >
      <div className="h-full w-full animate-pulse bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%]" />
    </div>
  );
}
