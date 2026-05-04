import { useState, useRef, useId } from 'react';
import './ImageUploader.css';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  error?: string;
}

const ImageUploader = ({ value, onChange, label, error }: ImageUploaderProps) => {
  const uid = useId();
  const inputId = `file-upload-${uid}`;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryUploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cloudinary error response:', errorData);
        console.error('Cloud name:', cloudinaryCloudName, 'Preset:', cloudinaryUploadPreset);
        throw new Error(errorData?.error?.message || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.secure_url);
    } catch (err) {
      setUploadError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setUploadError('');
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader">
      {label && <label className="image-uploader-label">{label}</label>}
      
      <div className="image-uploader-content" style={{ position: 'relative' }}>
        {uploading && (
          <div className="uploading-overlay">
            <div className="spinner"></div>
            <span>Uploading...</span>
          </div>
        )}
        {value && (
          <div className="image-preview">
            <img src={value} alt="Preview" />
            <button
              type="button"
              className="image-remove"
              onClick={handleRemove}
              title="Remove image"
            >
              &times;
            </button>
          </div>
        )}

        <div className="image-uploader-controls">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="file-input"
            id={inputId}
          />
          <label htmlFor={inputId} className="file-input-label">
            {uploading ? 'Uploading...' : 'Choose Image'}
          </label>

          <div className="url-input-group">
            <span className="url-input-label">or</span>
            <input
              type="url"
              value={value}
              onChange={handleUrlChange}
              placeholder="Enter image URL"
              className="url-input"
              disabled={uploading}
            />
          </div>
        </div>
      </div>

      {(error || uploadError) && (
        <div className="image-uploader-error">{error || uploadError}</div>
      )}
    </div>
  );
};

export default ImageUploader;
