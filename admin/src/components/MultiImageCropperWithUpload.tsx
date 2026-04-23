import { useState, useId } from 'react';
import ImageCropModal from './ImageCropModal';
import { readFile } from '../utils/cropImage';
import './MultiImageUploader.css';

interface ImageData {
  url: string;
  alt: string;
  order: number;
}

interface MultiImageCropperWithUploadProps {
  value: ImageData[];
  onChange: (images: ImageData[]) => void;
  label?: string;
  error?: string;
  aspectRatio?: number;
}

interface ImageToProcess {
  file: File;
  dataUrl: string;
  index: number;
}

const MultiImageCropperWithUpload = ({
  value,
  onChange,
  label,
  error,
  aspectRatio = 4 / 3, // Default 4:3 for products
}: MultiImageCropperWithUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [imagesToProcess, setImagesToProcess] = useState<ImageToProcess[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [croppedBlobs, setCroppedBlobs] = useState<Blob[]>([]);
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
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Each image must be less than 10MB');
        return;
      }
    }

    setUploadError('');

    try {
      // Read all files as data URLs
      const imagePromises = files.map(async (file, index) => ({
        file,
        dataUrl: await readFile(file),
        index,
      }));

      const images = await Promise.all(imagePromises);
      setImagesToProcess(images);
      setCurrentImageIndex(0);
      setCroppedBlobs([]);
      setShowCropModal(true);
    } catch (err) {
      setUploadError('Failed to read image files');
      console.error('File read error:', err);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    const newCroppedBlobs = [...croppedBlobs, croppedImageBlob];
    setCroppedBlobs(newCroppedBlobs);

    // Check if there are more images to crop
    if (currentImageIndex < imagesToProcess.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // All images cropped, now upload them
      setShowCropModal(false);
      await uploadAllImages(newCroppedBlobs);
    }
  };

  const uploadAllImages = async (blobs: Blob[]) => {
    setUploading(true);
    setUploadError('');

    try {
      const uploadPromises = blobs.map(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'cropped-image.jpg');
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
      setImagesToProcess([]);
      setCurrentImageIndex(0);
      setCroppedBlobs([]);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImagesToProcess([]);
    setCurrentImageIndex(0);
    setCroppedBlobs([]);
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

  const currentImage = imagesToProcess[currentImageIndex];
  const totalImages = imagesToProcess.length;
  const cropModalTitle = totalImages > 1
    ? `Crop Image ${currentImageIndex + 1} of ${totalImages}`
    : 'Crop Image';

  return (
    <>
      <div className="multi-image-uploader">
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
            id={`multi-file-upload-crop-${uniqueId}`}
          />
          <label htmlFor={`multi-file-upload-crop-${uniqueId}`} className="file-input-label">
            {uploading ? 'Uploading...' : 'Add Images'}
          </label>
        </div>

        {(error || uploadError) && (
          <div className="multi-image-uploader-error">{error || uploadError}</div>
        )}
      </div>

      {currentImage && (
        <ImageCropModal
          isOpen={showCropModal}
          imageUrl={currentImage.dataUrl}
          aspectRatio={aspectRatio}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
          title={cropModalTitle}
        />
      )}
    </>
  );
};

export default MultiImageCropperWithUpload;
