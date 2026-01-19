import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_main/profile/admin/meme/create/$templateId/'
)({
  component: MemeTemplateEditorPage,
});

function MemeTemplateEditorPage() {
  const { templateId } = Route.useParams();

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Meme Template Editor</h1>
        <p className="text-gray-600">Template ID: {templateId}</p>
        <p className="mt-4">Editor interface will be implemented here</p>
      </div>
    </div>
  );
}
