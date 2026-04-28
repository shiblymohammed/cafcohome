import { useState, useId } from 'react';
import './MultiImageUploader.css';

interface ImageData {
  url: string;
  alt: string;
  order: number;
}

interface MultiImageUploaderProps {
  value: ImageData[];
  onChange: (images: ImageData[]) => void;
  label?: string;
  error?: string;
}

const MultiImageUploader = ({ value, onChange, label, error }: MultiImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const uniqueId = useId();

  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select only image files');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Each image must be less than 5MB');
        return;
      }
    }

    setUploading(true);
    setUploadError('');

    try {
      const uploadPromises = files.map(async (file) => {
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
          throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      const newImages: ImageData[] = urls.map((url, index) => ({
        url,
        alt: '',
        order: value.length + index,
      }));

      onChange([...value, ...newImages]);
    } catch (err) {
      setUploadError('Failed to upload images. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    // Reorder remaining images
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onChange(reorderedImages);
  };

  const handleAltChange = (index: number, alt: string) => {
    const newImages = [...value];
    newImages[index] = { ...newImages[index], alt };
    onChange(newImages);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === value.length - 1)
    ) {
      return;
    }

    const newImages = [...value];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    // Update order values
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onChange(reorderedImages);
  };

  return (
    <div className="multi-image-uploader" style={{ position: 'relative' }}>
      {uploading && (
        <div className="uploading-overlay">
          <div className="spinner"></div>
          <span>Uploading...</span>
        </div>
      )}
      {label && <label className="multi-image-uploader-label">{label}</label>}

      <div className="image-grid">
        {value && value.length > 0 ? (
          value.map((image, index) => (
            <div key={index} className="image-item">
              <img src={image.url} alt={image.alt || `Image ${index + 1}`} />
              <div className="image-controls">
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) => handleAltChange(index, e.target.value)}
                  placeholder="Alt text"
                  className="alt-input"
                />
                <div className="image-actions">
                  <button
                    type="button"
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === value.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="remove-btn"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No images uploaded yet
          </div>
        )}
      </div>

      <div className="upload-controls">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="file-input"
          id={`multi-file-upload-${uniqueId}`}
        />
        <label htmlFor={`multi-file-upload-${uniqueId}`} className="file-input-label">
          {uploading ? 'Uploading...' : 'Add Images'}
        </label>
      </div>

      {(error || uploadError) && (
        <div className="multi-image-uploader-error">{error || uploadError}</div>
      )}
    </div>
  );
};

export default MultiImageUploader;
