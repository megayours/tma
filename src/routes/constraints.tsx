import { createFileRoute } from '@tanstack/react-router';
import { viewport, useSignal } from '@telegram-apps/sdk-react';

export const Route = createFileRoute('/constraints')({
  component: ConstraintsPage,
});

function ConstraintsPage() {
  // Use signals to reactively get viewport data
  const safeAreaInsets = useSignal(viewport.safeAreaInsets);
  const contentSafeAreaInsets = useSignal(viewport.contentSafeAreaInsets);
  const viewportWidth = useSignal(viewport.width);
  const viewportHeight = useSignal(viewport.height);
  const viewportStableHeight = useSignal(viewport.stableHeight);

  const safeAreaInset = {
    top: safeAreaInsets?.top || 0,
    bottom: safeAreaInsets?.bottom || 0,
    left: safeAreaInsets?.left || 0,
    right: safeAreaInsets?.right || 0,
  };

  const contentSafeAreaInset = {
    top: contentSafeAreaInsets?.top || 0,
    bottom: contentSafeAreaInsets?.bottom || 0,
    left: contentSafeAreaInsets?.left || 0,
    right: contentSafeAreaInsets?.right || 0,
  };

  const viewportDimensions = {
    width: viewportWidth || window.innerWidth,
    height: viewportHeight || window.innerHeight,
    stableHeight: viewportStableHeight || window.innerHeight,
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {/* Safe Area Inset Visualization (System UI) */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          borderTopWidth: `${safeAreaInset.top}px`,
          borderBottomWidth: `${safeAreaInset.bottom}px`,
          borderLeftWidth: `${safeAreaInset.left}px`,
          borderRightWidth: `${safeAreaInset.right}px`,
          borderColor: 'rgba(59, 130, 246, 0.5)', // Blue with 50% opacity
          borderStyle: 'solid',
        }}
      >
        {/* Labels for Safe Area Insets */}
        {safeAreaInset.top > 0 && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-500 px-2 py-1 text-xs font-bold text-white"
            style={{ marginTop: `${safeAreaInset.top / 2 - 10}px` }}
          >
            Safe Area Top: {safeAreaInset.top}px
          </div>
        )}
        {safeAreaInset.bottom > 0 && (
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-blue-500 px-2 py-1 text-xs font-bold text-white"
            style={{ marginBottom: `${safeAreaInset.bottom / 2 - 10}px` }}
          >
            Safe Area Bottom: {safeAreaInset.bottom}px
          </div>
        )}
        {safeAreaInset.left > 0 && (
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 -rotate-90 bg-blue-500 px-2 py-1 text-xs font-bold text-white"
            style={{ marginLeft: `${safeAreaInset.left / 2 - 10}px` }}
          >
            Safe Area Left: {safeAreaInset.left}px
          </div>
        )}
        {safeAreaInset.right > 0 && (
          <div
            className="absolute top-1/2 right-0 -translate-y-1/2 rotate-90 bg-blue-500 px-2 py-1 text-xs font-bold text-white"
            style={{ marginRight: `${safeAreaInset.right / 2 - 10}px` }}
          >
            Safe Area Right: {safeAreaInset.right}px
          </div>
        )}
      </div>

      {/* Content Safe Area Inset Visualization (Telegram UI) */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          borderTopWidth: `${contentSafeAreaInset.top}px`,
          borderBottomWidth: `${contentSafeAreaInset.bottom}px`,
          borderLeftWidth: `${contentSafeAreaInset.left}px`,
          borderRightWidth: `${contentSafeAreaInset.right}px`,
          borderColor: 'rgba(234, 88, 12, 0.5)', // Orange with 50% opacity
          borderStyle: 'solid',
        }}
      >
        {/* Labels for Content Safe Area Insets */}
        {contentSafeAreaInset.top > 0 && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-orange-600 px-2 py-1 text-xs font-bold text-white"
            style={{
              marginTop: `${safeAreaInset.top + contentSafeAreaInset.top / 2 - 10}px`,
            }}
          >
            Content Safe Top: {contentSafeAreaInset.top}px
          </div>
        )}
        {contentSafeAreaInset.bottom > 0 && (
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-orange-600 px-2 py-1 text-xs font-bold text-white"
            style={{
              marginBottom: `${safeAreaInset.bottom + contentSafeAreaInset.bottom / 2 - 10}px`,
            }}
          >
            Content Safe Bottom: {contentSafeAreaInset.bottom}px
          </div>
        )}
        {contentSafeAreaInset.left > 0 && (
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 -rotate-90 bg-orange-600 px-2 py-1 text-xs font-bold text-white"
            style={{
              marginLeft: `${safeAreaInset.left + contentSafeAreaInset.left / 2 - 10}px`,
            }}
          >
            Content Safe Left: {contentSafeAreaInset.left}px
          </div>
        )}
        {contentSafeAreaInset.right > 0 && (
          <div
            className="absolute top-1/2 right-0 -translate-y-1/2 rotate-90 bg-orange-600 px-2 py-1 text-xs font-bold text-white"
            style={{
              marginRight: `${safeAreaInset.right + contentSafeAreaInset.right / 2 - 10}px`,
            }}
          >
            Content Safe Right: {contentSafeAreaInset.right}px
          </div>
        )}
      </div>

      {/* Central Information Panel */}
      <div className="absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Constraints Visualization
        </h1>

        <div className="space-y-4">
          {/* Safe Area Inset Section */}
          <div className="rounded-md border-2 border-blue-500 bg-blue-50 p-3 dark:bg-blue-950">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
              <div className="h-4 w-4 rounded bg-blue-500"></div>
              Safe Area Inset (System UI)
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
              <div>Top: {safeAreaInset.top}px</div>
              <div>Bottom: {safeAreaInset.bottom}px</div>
              <div>Left: {safeAreaInset.left}px</div>
              <div>Right: {safeAreaInset.right}px</div>
            </div>
          </div>

          {/* Content Safe Area Inset Section */}
          <div className="rounded-md border-2 border-orange-600 bg-orange-50 p-3 dark:bg-orange-950">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-orange-700 dark:text-orange-300">
              <div className="h-4 w-4 rounded bg-orange-600"></div>
              Content Safe Area Inset (Telegram UI)
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
              <div>Top: {contentSafeAreaInset.top}px</div>
              <div>Bottom: {contentSafeAreaInset.bottom}px</div>
              <div>Left: {contentSafeAreaInset.left}px</div>
              <div>Right: {contentSafeAreaInset.right}px</div>
            </div>
          </div>

          {/* Viewport Dimensions */}
          <div className="rounded-md border-2 border-gray-400 bg-gray-50 p-3 dark:bg-gray-950">
            <h2 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              Viewport Dimensions
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
              <div>Width: {viewportDimensions.width}px</div>
              <div>Height: {viewportDimensions.height}px</div>
              <div className="col-span-2">
                Stable Height: {viewportDimensions.stableHeight}px
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2 border-t border-gray-300 pt-4 text-xs dark:border-gray-600">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 border-2 border-blue-500 bg-blue-100 dark:bg-blue-900"></div>
            <span className="text-gray-700 dark:text-gray-300">
              Blue border = System UI safe areas (notches, status bar)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 border-2 border-orange-600 bg-orange-100 dark:bg-orange-900"></div>
            <span className="text-gray-700 dark:text-gray-300">
              Orange border = Telegram UI safe areas
            </span>
          </div>
        </div>
      </div>

      {/* Corner Markers for Visual Reference */}
      <div className="pointer-events-none absolute top-0 left-0 z-40 h-8 w-8 border-t-2 border-l-2 border-purple-500"></div>
      <div className="pointer-events-none absolute top-0 right-0 z-40 h-8 w-8 border-t-2 border-r-2 border-purple-500"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 z-40 h-8 w-8 border-b-2 border-l-2 border-purple-500"></div>
      <div className="pointer-events-none absolute right-0 bottom-0 z-40 h-8 w-8 border-r-2 border-b-2 border-purple-500"></div>
    </div>
  );
}
