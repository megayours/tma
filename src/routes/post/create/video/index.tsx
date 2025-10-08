import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/post/create/video/')({
  component: CreateVideoPostComponent,
});

function CreateVideoPostComponent() {
  return (
    <div className="bg-tg-bg min-h-screen p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            to="/post/create"
            className="text-tg-hint hover:text-tg-text mb-4 inline-flex items-center transition-colors"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
          <div className="mb-4 text-6xl">🎥</div>
          <h1 className="text-tg-text mb-2 text-3xl font-bold">
            Create Video Post
          </h1>
          <p className="text-tg-hint">Upload and share your videos</p>
        </div>

        {/* Content */}
        <div className="bg-tg-secondary-bg rounded-lg p-6 shadow-sm">
          <VideoUploadForm />
        </div>
      </div>
    </div>
  );
}

function VideoUploadForm() {
  return (
    <div className="space-y-6">
      <div className="border-tg-hint/30 rounded-lg border-2 border-dashed p-8 text-center">
        <div className="mb-4 text-4xl">🎬</div>
        <p className="text-tg-text mb-2">Drag and drop your video here</p>
        <p className="text-tg-hint mb-4 text-sm">or</p>
        <button className="bg-tg-button text-tg-button-text hover:bg-tg-button/80 rounded-lg px-6 py-2 transition-colors">
          Choose Video
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-tg-text mb-2 block font-medium">Title</label>
          <input
            type="text"
            className="bg-tg-bg border-tg-hint/30 text-tg-text placeholder-tg-hint w-full rounded-lg border p-3"
            placeholder="Give your video a title..."
          />
        </div>

        <div>
          <label className="text-tg-text mb-2 block font-medium">
            Description
          </label>
          <textarea
            className="bg-tg-bg border-tg-hint/30 text-tg-text placeholder-tg-hint w-full resize-none rounded-lg border p-3"
            rows={3}
            placeholder="Describe your video..."
          />
        </div>

        <button className="bg-tg-button text-tg-button-text hover:bg-tg-button/80 w-full rounded-lg py-3 font-medium transition-colors">
          Share Video
        </button>
      </div>
    </div>
  );
}
