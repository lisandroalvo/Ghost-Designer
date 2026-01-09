import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  label: string;
  currentUrl?: string;
  onUpload: (file: File) => Promise<string>;
  onUrlChange: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, currentUrl, onUpload, onUrlChange }) => {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [useUrl, setUseUrl] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const url = await onUpload(file);
      onUrlChange(url);
      setUrlInput(url);
      alert('Image uploaded successfully!');
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUrlChange(urlInput.trim());
    }
  };

  return (
    <div className="space-y-3 relative z-10">
      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
        {label}
      </label>

      {/* Toggle between Upload and URL */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setUseUrl(false)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            !useUrl
              ? 'glass-dist text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <span className={!useUrl ? 'relative z-10' : ''}>Upload File</span>
        </button>
        <button
          type="button"
          onClick={() => setUseUrl(true)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            useUrl
              ? 'glass-dist text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <span className={useUrl ? 'relative z-10' : ''}>Use URL</span>
        </button>
      </div>

      {/* File Upload Mode */}
      {!useUrl && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-white/20 rounded-xl px-4 py-8 text-center hover:border-white/40 hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="space-y-2">
                <div className="animate-spin w-8 h-8 border-4 border-white/40 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-white/70">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl">📁</div>
                <p className="text-sm font-semibold text-white/90">
                  Click to upload image
                </p>
                <p className="text-xs text-white/60">
                  PNG, JPG, GIF, WebP up to 5MB
                </p>
              </div>
            )}
          </button>
        </div>
      )}

      {/* URL Input Mode */}
      {useUrl && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={handleUrlSubmit}
            placeholder="https://..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 outline-none"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="glass-dist text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            <span className="relative z-10">Set</span>
          </button>
        </div>
      )}

      {/* Current Image Preview */}
      {currentUrl && (
        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs text-white/60 mb-2">Current image:</p>
          <img
            src={currentUrl}
            alt={label}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
