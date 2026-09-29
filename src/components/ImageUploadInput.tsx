import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Link, Check, Cloud } from 'lucide-react';
import { uploadImageToStorage, StorageBucket } from '../services/storageService';

interface ImageUploadInputProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: 'square' | 'banner' | 'product';
  maxSizeMB?: number;
  className?: string;
  id?: string;
  storageBucket?: StorageBucket;
  folder?: string;
}

/**
 * Optimizes an image file from phone camera/gallery using HTML5 Canvas.
 * Keeps file size lightweight (under 300KB) while maintaining crisp resolution.
 */
const compressImageFile = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image preview'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  sublabel,
  value,
  onChange,
  aspect = 'square',
  maxSizeMB = 10,
  className = '',
  id = 'image-upload-input',
  storageBucket,
  folder,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derive target bucket from aspect if not explicitly specified
  const effectiveBucket: StorageBucket = 
    storageBucket || (aspect === 'banner' ? 'covers' : aspect === 'product' ? 'products' : 'avatars');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP, HEIC)');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`Image size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const maxDim = aspect === 'banner' ? 1600 : 1200;
      // 1. Optimize image locally first for fast transfer
      const optimized = await compressImageFile(file, maxDim, maxDim, 0.85);

      // 2. Upload directly to Supabase Storage bucket
      const permanentStorageUrl = await uploadImageToStorage(optimized, {
        bucket: effectiveBucket,
        folder: folder || effectiveBucket,
        fileNamePrefix: aspect,
      });

      onChange(permanentStorageUrl);
    } catch (err) {
      console.error('Error optimizing and uploading image to storage:', err);
      setErrorMsg('Failed to process image. Please try another photo.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft('');
      setShowUrlInput(false);
      setErrorMsg(null);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-mono-tech text-[#C0C0C0] uppercase font-semibold">
            {label}
          </label>
          {sublabel && (
            <p className="text-[11px] text-[#8E8E93] mt-0.5">{sublabel}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-[#8E8E93] hover:text-white flex items-center gap-1 transition-colors"
        >
          <Link className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL' : 'Use web link'}</span>
        </button>
      </div>

      {/* Hidden File Input for Phone Gallery / Camera */}
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept="image/png, image/jpeg, image/webp, image/gif, image/heic"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Upload Box / Preview Card */}
      <div className="relative group">
        {value ? (
          /* Preview state */
          <div 
            className={`relative rounded-2xl overflow-hidden border border-[#333333] group-hover:border-[#C0C0C0] transition-all bg-[#0A0A0A] ${
              aspect === 'banner' 
                ? 'h-36 sm:h-44 w-full' 
                : aspect === 'square'
                ? 'h-36 w-36 sm:h-40 sm:w-40 mx-auto'
                : 'h-48 w-full'
            }`}
          >
            <img
              src={value}
              alt="Upload preview"
              className="w-full h-full object-cover"
              onError={() => setErrorMsg('Failed to load image preview')}
            />

            {/* Hover / Tap Overlay Actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Change</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-full bg-[#1A1A1A]/90 hover:bg-red-500/80 text-white text-xs transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtle active badge */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 border border-white/20 text-[10px] font-mono-tech text-white flex items-center gap-1">
              <Check className="w-3 h-3 text-[#C0C0C0]" />
              <span>Uploaded</span>
            </div>
          </div>
        ) : (
          /* Empty upload prompt: Tap to choose from phone or take photo */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className={`w-full border-2 border-dashed border-[#2B2B2B] hover:border-[#C0C0C0]/70 rounded-2xl p-5 text-center transition-all bg-[#111111]/60 hover:bg-[#161616] flex flex-col items-center justify-center cursor-pointer group active:scale-[0.99] ${
              aspect === 'banner' ? 'py-8' : 'py-6'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-black border border-[#333333] group-hover:border-white text-[#C0C0C0] group-hover:text-white flex items-center justify-center mb-2.5 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </div>

            <p className="text-xs font-semibold text-white tracking-wide">
              {isProcessing ? 'Optimizing photo...' : 'Upload from Phone or Computer'}
            </p>
            <p className="text-[11px] text-[#8E8E93] mt-1 max-w-xs">
              Tap to take a photo with your camera or select from photo library
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#1A1A1A] border border-[#2B2B2B] text-[10px] font-mono-tech text-[#A8ACB4]">
              PNG, JPG, HEIC up to {maxSizeMB}MB
            </span>
          </button>
        )}
      </div>

      {/* Alternative URL paste mode */}
      {showUrlInput && (
        <div className="p-3 rounded-xl bg-[#111111] border border-[#2B2B2B] space-y-2 animate-fadeIn">
          <label className="block text-[10px] font-mono-tech uppercase text-[#8E8E93]">
            Or Paste Direct Image Web Link
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-black border border-[#333333] focus:border-[#C0C0C0] text-xs text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-2 rounded-lg bg-[#222222] hover:bg-white hover:text-black text-xs font-semibold text-white transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] text-red-400 font-mono-tech tracking-tight">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
