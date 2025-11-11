import type { ReactNode } from 'react';

export interface TopBarProps {
  title: string | ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

/**
 * Generic TopBar component that can be used across different routes.
 * Displays a title with an optional icon and actions, plus optional children content below.
 *
 * @param title - The title to display in the top bar
 * @param icon - Optional icon component to display next to the title
 * @param actions - Optional action buttons/components to display on the right
 * @param children - Optional children content to render below the header
 *
 * @example
 * ```tsx
 * <TopBar
 *   title="Prompt Settings"
 *   icon={<BsGear />}
 *   actions={<button>Save</button>}
 * >
 *   <SettingsContent />
 * </TopBar>
 * ```
 */
export const TopBar = ({ title, icon, actions, children }: TopBarProps) => {
  return (
    <div className="relative">
      {/* Header with title, icon and actions */}
      <div className="grid grid-cols-[1fr_2fr_1fr] items-center px-4 py-2">
        {/* Left column - empty */}
        <div></div>

        {/* Center column - title */}
        <div className="flex items-center justify-center gap-2">
          {icon && <div className="text-tg-hint text-sm">{icon}</div>}
          {typeof title === 'string' ? (
            <h1 className="text-tg-text text-center text-sm font-medium">
              {title}
            </h1>
          ) : (
            title
          )}
        </div>

        {/* Right column - actions */}
        <div className="flex justify-end">{actions}</div>
      </div>

      {/* Children content - positioned absolutely to overlay content below */}
      {children && (
        <div className="bg-tg-secondary-bg border-tg-hint/20 absolute top-full right-0 left-0 z-50 shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
};
