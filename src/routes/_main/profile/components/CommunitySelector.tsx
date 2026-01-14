import { useNavigate } from '@tanstack/react-router';
import { useTelegramTheme } from '@/auth/useTelegram';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';

export function CommunitySelector() {
  const { selectedCommunity } = useSelectCommunity();
  const { isDark } = useTelegramTheme();
  const navigate = useNavigate();

  const handleCommunityClick = () => {
    if (selectedCommunity) {
      navigate({
        to: '/selectCommunity',
        search: {
          redirectTo: window.location.pathname,
        },
      });
    }
  };

  if (!selectedCommunity) return null;

  return (
    <div className="mb-4 flex flex-row items-center justify-between gap-2">
      <button
        onClick={handleCommunityClick}
        className="flex items-center gap-2 transition-opacity hover:opacity-80 active:opacity-60"
      >
        {selectedCommunity.image ? (
          <img
            src={selectedCommunity.image}
            alt={selectedCommunity.name}
            className="h-8 w-8 rounded-md object-cover"
          />
        ) : (
          <div className="bg-tg-button flex h-8 w-8 items-center justify-center rounded-md">
            <span className="text-sm font-bold text-white">
              {selectedCommunity.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span
          className={`text-xl font-bold ${
            isDark ? 'text-[#03FFC2]' : 'text-black'
          }`}
        >
          {selectedCommunity.name}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="text-tg-hint h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
    </div>
  );
}
