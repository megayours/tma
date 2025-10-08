import { createContext, useContext, useState, type ReactNode } from 'react';

// Create context for settings state
interface SettingsContextType {
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <SettingsContext.Provider value={{ settingsOpen, setSettingsOpen }}>
      {children}
    </SettingsContext.Provider>
  );
};
