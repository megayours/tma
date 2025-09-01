import type { ReactNode } from 'react';

export interface TopBarProps {
  title: string;
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
    <div className="bg-tg-secondary-bg border-tg-hint/20 relative border-b">
      {/* Header with title, icon and actions */}
      <div className="border-tg-hint/20 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          {icon && <div className="text-tg-hint">{icon}</div>}
          <h1 className="text-tg-text text-lg font-semibold">{title}</h1>
        </div>
        {actions && <div>{actions}</div>}
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
