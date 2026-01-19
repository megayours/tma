import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { FiUpload, FiX } from 'react-icons/fi';

interface Props {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function MemeTemplateUpload({ onUpload, isUploading }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="flex h-screen flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-tg-text text-3xl font-bold">
          Create Meme Template
        </h1>
        <p className="text-tg-hint mt-2">
          Upload an image to create a new meme template
        </p>
      </div>

      {/* Upload area or preview */}
      {!selectedFile ? (
        <div
          className={`border-tg-section-separator bg-tg-secondary-bg flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
            isDragging ? 'border-tg-link bg-tg-link/10' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <FiUpload className="text-tg-hint" size={64} />
            <div className="text-center">
              <p className="text-tg-text text-lg font-semibold">
                Drag and drop your image here
              </p>
              <p className="text-tg-hint mt-2">or click to browse files</p>
            </div>
            <Button mode="filled" size="l">
              Select Image
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4">
          {/* Preview */}
          <div className="bg-tg-section-bg relative flex-1 overflow-hidden rounded-2xl">
            <button
              onClick={handleClear}
              className="bg-tg-secondary-bg hover:bg-tg-section-bg absolute top-4 right-4 z-10 rounded-full p-2 transition-colors"
              disabled={isUploading}
            >
              <FiX size={24} />
            </button>

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            )}
          </div>

          {/* File info */}
          <div className="bg-tg-section-bg rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-tg-text font-medium">{selectedFile.name}</p>
                <p className="text-tg-hint text-sm">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Upload button */}
          <Button
            mode="filled"
            size="l"
            stretched
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Creating Template...' : 'Create Template'}
          </Button>
        </div>
      )}
    </div>
  );
}
