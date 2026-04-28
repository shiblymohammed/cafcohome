import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import './ImageCropModal.css';

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  aspectRatio: number;
  onComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  title?: string;
}

const ImageCropModal = ({
  isOpen,
  imageUrl,
  aspectRatio,
  onComplete,
  onCancel,
  title = 'Crop Image',
}: ImageCropModalProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);
    try {
      const croppedImage = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation
      );
      onComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !processing) {
      handleCropConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="crop-modal-overlay" onClick={onCancel} onKeyDown={handleKeyDown}>
      <div className="crop-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="crop-modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="crop-modal-close"
            onClick={onCancel}
            disabled={processing}
          >
            ×
          </button>
        </div>

        <div className="crop-container">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="crop-controls">
          <div className="crop-control-group">
            <label htmlFor="zoom-slider">
              Zoom: {zoom.toFixed(1)}x
            </label>
            <input
              id="zoom-slider"
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="crop-slider"
            />
          </div>

          <div className="crop-control-group">
            <label htmlFor="rotation-slider">
              Rotation: {rotation}°
            </label>
            <div className="rotation-controls">
              <button
                type="button"
                onClick={handleRotateLeft}
                className="rotation-btn"
                title="Rotate left 90°"
              >
                ↶ -90°
              </button>
              <input
                id="rotation-slider"
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="crop-slider"
              />
              <button
                type="button"
                onClick={handleRotateRight}
                className="rotation-btn"
                title="Rotate right 90°"
              >
                ↷ 90°
              </button>
            </div>
          </div>
        </div>

        <div className="crop-modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleCropConfirm}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Crop & Upload'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageCropModal;
