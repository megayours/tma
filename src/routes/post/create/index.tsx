import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/post/create/')({
  component: CreatePostComponent,
});

function CreatePostComponent() {
  const options = [
    {
      type: 'image' as const,
      label: 'Image Post',
      icon: '🖼️',
      description: 'Share photos and images',
      to: '/post/create/image' as const,
      className: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    },
    {
      type: 'video' as const,
      label: 'Video Post',
      icon: '🎥',
      description: 'Share videos and clips',
      to: '/post/create/video' as const,
      className: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    },
    {
      type: 'sticker' as const,
      label: 'Sticker Post',
      icon: '✨',
      description: 'Share custom stickers',
      to: '/post/create/sticker' as const,
      className: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
    },
  ];

  return (
    <div className="bg-tg-bg min-h-screen p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-6xl">✨</div>
          <h1 className="text-tg-text mb-2 text-3xl font-bold">
            Create New Post
          </h1>
          <p className="text-tg-hint">
            Choose what type of content you want to share
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {options.map(option => (
            <Link
              key={option.type}
              to={option.to}
              className={`block w-full rounded-lg border-2 p-6 transition-all duration-200 ${option.className} hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{option.icon}</div>
                <div className="text-left">
                  <div className="text-tg-text text-lg font-semibold">
                    {option.label}
                  </div>
                  <div className="text-tg-hint">{option.description}</div>
                </div>
                <div className="ml-auto">
                  <svg
                    className="text-tg-hint h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
