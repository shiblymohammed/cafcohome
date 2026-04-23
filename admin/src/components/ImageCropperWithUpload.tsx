import { useState, useRef } from 'react';
import ImageCropModal from './ImageCropModal';
import { readFile } from '../utils/cropImage';
import './ImageUploader.css';

interface ImageCropperWithUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  error?: string;
  aspectRatio?: number;
}

const ImageCropperWithUpload = ({
  value,
  onChange,
  label,
  error,
  aspectRatio = 4 / 3, // Default 4:3 for products
}: ImageCropperWithUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
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

    // Validate file size (max 10MB before crop)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB');
      return;
    }

    setUploadError('');

    try {
      // Read file as data URL
      const imageDataUrl = await readFile(file);
      setImageToCrop(imageDataUrl);
      setShowCropModal(true);
    } catch (err) {
      setUploadError('Failed to read image file');
      console.error('File read error:', err);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setShowCropModal(false);
    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', croppedImageBlob, 'cropped-image.jpg');
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
      onChange(data.secure_url);
    } catch (err) {
      setUploadError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop('');
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <>
      <div className="image-uploader">
        {label && <label className="image-uploader-label">{label}</label>}

        <div className="image-uploader-content">
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
              id="file-upload-crop"
            />
            <label htmlFor="file-upload-crop" className="file-input-label">
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

      <ImageCropModal
        isOpen={showCropModal}
        imageUrl={imageToCrop}
        aspectRatio={aspectRatio}
        onComplete={handleCropComplete}
        onCancel={handleCropCancel}
        title="Crop Image"
      />
    </>
  );
};

export default ImageCropperWithUpload;
