import { useState, useId, useRef } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);

  // For replace mode: store the index of the image being replaced (-1 = not replacing)
  const [replaceIndex, setReplaceIndex] = useState<number>(-1);
  const replaceInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const uniqueId = useId();

  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const processFiles = async (files: File[], replacing = false) => {
    if (files.length === 0) return;

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReplaceIndex(-1);
    await processFiles(files);
    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleReplaceFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imgIndex: number
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setReplaceIndex(imgIndex);
    await processFiles([files[0]]);
    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setReplaceIndex(-1);
    await processFiles(files);
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
      if (replaceIndex >= 0) {
        await uploadAndReplace(newCroppedBlobs[0], replaceIndex);
      } else {
        await uploadAllImages(newCroppedBlobs);
      }
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
      setReplaceIndex(-1);
    }
  };

  // Upload a single blob and replace the image at the given position
  const uploadAndReplace = async (blob: Blob, imgIndex: number) => {
    setUploading(true);
    setUploadError('');

    try {
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

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const newUrl: string = data.secure_url;

      const newImages = [...value];
      newImages[imgIndex] = { ...newImages[imgIndex], url: newUrl };
      onChange(newImages);
    } catch (err) {
      setUploadError('Failed to replace image. Please try again.');
      console.error('Replace upload error:', err);
    } finally {
      setUploading(false);
      setImagesToProcess([]);
      setCurrentImageIndex(0);
      setCroppedBlobs([]);
      setReplaceIndex(-1);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImagesToProcess([]);
    setCurrentImageIndex(0);
    setCroppedBlobs([]);
    setReplaceIndex(-1);
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
  const cropModalTitle =
    replaceIndex >= 0
      ? `Replace Image ${replaceIndex + 1}`
      : totalImages > 1
      ? `Crop Image ${currentImageIndex + 1} of ${totalImages}`
      : 'Crop Image';

  return (
    <>
      <div className="multi-image-uploader modern-uploader">
        {label && <label className="multi-image-uploader-label">{label}</label>}

        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ position: 'relative' }}
        >
          {uploading && (
            <div className="uploading-overlay">
              <div className="spinner"></div>
              <span>{replaceIndex >= 0 ? 'Replacing...' : 'Uploading...'}</span>
            </div>
          )}
          <div className="dropzone-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <p className="dropzone-text">Drag and drop images here, or click to browse</p>
            <p className="dropzone-subtext">Supports JPG, PNG, WEBP (Max 10MB)</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="file-input"
              id={`multi-file-upload-crop-${uniqueId}`}
            />
            <label htmlFor={`multi-file-upload-crop-${uniqueId}`} className="btn-secondary dropzone-btn">
              {uploading ? 'Processing...' : 'Browse Files'}
            </label>
          </div>
        </div>

        {value && value.length > 0 && (
          <div className="image-grid-modern">
            {value.map((image, index) => (
              <div key={index} className="image-card-modern">
                {/* Hidden replace input per image */}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={(el) => { replaceInputRefs.current[index] = el; }}
                  onChange={(e) => handleReplaceFileSelect(e, index)}
                  disabled={uploading}
                />
                <div className="image-wrapper">
                  <img src={image.url} alt={image.alt || `Image ${index + 1}`} />
                  <div className="image-overlay">
                    <button type="button" className="icon-btn-small" onClick={() => moveImage(index, 'up')} disabled={index === 0} title="Move Left">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button
                      type="button"
                      className="icon-btn-small replace"
                      onClick={() => replaceInputRefs.current[index]?.click()}
                      disabled={uploading}
                      title="Replace image"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </button>
                    <button type="button" className="icon-btn-small" onClick={() => moveImage(index, 'down')} disabled={index === value.length - 1} title="Move Right">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <button type="button" className="icon-btn-small delete" onClick={() => handleRemove(index)} title="Remove">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  {/* Replace badge shown while this image is being replaced */}
                  {uploading && replaceIndex === index && (
                    <div className="uploading-overlay" style={{ borderRadius: '10px' }}>
                      <div className="spinner" style={{ width: 24, height: 24 }}></div>
                      <span style={{ fontSize: '0.75rem' }}>Replacing…</span>
                    </div>
                  )}
                </div>
                <div className="image-card-bottom">
                  <span className="image-index-badge">
                    {index === 0 ? '★ Thumbnail' : `#${index + 1}`}
                  </span>
                  <button
                    type="button"
                    className="btn-replace-image"
                    onClick={() => replaceInputRefs.current[index]?.click()}
                    disabled={uploading}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Replace
                  </button>
                </div>
                <input
                  type="text"
                  value={image.alt}
                  onChange={(e) => handleAltChange(index, e.target.value)}
                  placeholder="Alt text (SEO)"
                  className="modern-alt-input"
                />
              </div>
            ))}
          </div>
        )}

        {(error || uploadError) && (
          <div className="multi-image-uploader-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error || uploadError}
          </div>
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
