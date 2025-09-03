import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  data?: any[];
}

interface ConsoleLogDevtoolsProps {
  initialIsOpen?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  maxLogs?: number;
  onReady?: () => void;
}

export function ConsoleLogDevtools({
  initialIsOpen = false,
  position = 'top-left',
  maxLogs = 100,
  onReady,
}: ConsoleLogDevtoolsProps) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Override console methods to capture logs
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (level: LogEntry['level'], ...args: any[]) => {
      const id = Math.random().toString(36).substr(2, 9);
      const message = args
        .map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(' ');

      setLogs(prev => {
        const newLogs = [
          ...prev,
          {
            id,
            timestamp: new Date(),
            level,
            message,
            data: args,
          },
        ];

        // Keep only the last maxLogs entries
        return newLogs.slice(-maxLogs);
      });
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', ...args);
    };

    console.info = (...args) => {
      originalInfo(...args);
      addLog('info', ...args);
    };

    // Signal that the console override is ready
    if (onReady) {
      onReady();
    }

    // Restore original console methods on cleanup
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, [maxLogs, onReady]);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-300';
    }
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-600 bg-gray-800 text-white shadow-lg hover:bg-gray-700"
          title="Console Logs"
        >
          📋
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div className="flex h-96 w-96 flex-col rounded-lg border border-gray-600 bg-gray-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-lg border-b border-gray-600 bg-gray-800 p-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white">Console Logs</span>
            <span className="rounded bg-gray-600 px-2 py-1 text-xs text-gray-300">
              {logs.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearLogs}
              className="rounded px-2 py-1 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-lg text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        {/* Logs Container */}
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No logs yet...</div>
          ) : (
            logs.map(log => (
              <div
                key={log.id}
                className="rounded border-l-2 border-gray-600 bg-gray-800 p-2 font-mono text-xs"
              >
                <div className="flex items-start space-x-2">
                  <span className={getLevelColor(log.level)}>
                    {getLevelIcon(log.level)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`${getLevelColor(log.level)} font-semibold`}
                    >
                      {log.level.toUpperCase()}
                    </div>
                    <div className="break-words text-gray-300">
                      {log.message}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
