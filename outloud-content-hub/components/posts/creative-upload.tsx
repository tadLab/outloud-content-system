'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MediaFile, Platform } from '@/types';
import { ImagePlus, X, FileText, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatFileSize, formatDuration, validateFile, processFile, getMediaWarnings } from '@/lib/media-utils';
import { MEDIA_REQUIREMENTS } from '@/lib/constants';

interface CreativeUploadProps {
  files: MediaFile[];
  onFilesChange: (files: MediaFile[]) => void;
  platform: Platform;
  disabled?: boolean;
}

export function CreativeUpload({ files, onFilesChange, platform, disabled = false }: CreativeUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight' && lightboxIndex < files.length - 1) setLightboxIndex(lightboxIndex + 1);
      if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, files.length]);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    setError(null);
    const newFiles: MediaFile[] = [];

    for (const file of Array.from(fileList)) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        continue;
      }
      const mediaFile = await processFile(file);
      newFiles.push(mediaFile);
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  }, [files, onFilesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileId: string) => {
    onFilesChange(files.filter((f) => f.id !== fileId));
  }, [files, onFilesChange]);

  const warnings = getMediaWarnings(files, platform);
  const reqs = MEDIA_REQUIREMENTS[platform];

  return (
    <div className="space-y-3">
      {/* File gallery */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {files.map((file, index) => (
            <div
              key={file.id}
              className="relative w-[120px] group"
            >
              <div
                className="w-[120px] h-[120px] bg-[var(--bg-tertiary)] rounded-[10px] overflow-hidden border border-[var(--border-default)] cursor-pointer"
                onClick={() => (file.type === 'image' || file.type === 'video') && setLightboxIndex(index)}
              >
                {file.type === 'image' && (
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                  />
                )}
                {file.type === 'video' && (
                  <>
                    {file.thumbnailUrl ? (
                      <img
                        src={file.thumbnailUrl}
                        alt={file.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={32} className="text-[var(--text-muted)]" />
                      </div>
                    )}
                    <div className="absolute bottom-8 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {formatDuration(file.duration)}
                    </div>
                  </>
                )}
                {file.type === 'document' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText size={32} className="text-[var(--text-muted)]" />
                  </div>
                )}

                {/* Remove button */}
                {!disabled && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--error)]"
                    type="button"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>

              {/* File info */}
              <p className="text-[10px] text-[var(--text-secondary)] truncate mt-1">{file.filename}</p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {formatFileSize(file.size)}
                {file.width && file.height && ` · ${file.width}×${file.height}`}
              </p>
            </div>
          ))}

          {/* Add more button */}
          {!disabled && (
            <div
              onClick={() => inputRef.current?.click()}
              className="w-[120px] h-[120px] bg-[var(--bg-secondary)] rounded-[10px] flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-default)] cursor-pointer hover:border-[var(--border-hover)] transition-colors"
            >
              <ImagePlus size={24} className="text-[var(--text-muted)] mb-1" />
              <span className="text-[11px] text-[var(--text-muted)]">Add</span>
            </div>
          )}
        </div>
      )}

      {/* Empty state / drop zone */}
      {files.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-[10px] p-8 text-center transition-colors ${
            disabled
              ? 'border-[var(--border-default)] opacity-50 cursor-not-allowed'
              : isDragOver
                ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5'
                : 'border-[var(--border-default)] hover:border-[var(--border-hover)] cursor-pointer'
          }`}
        >
          <ImagePlus size={32} className="mx-auto mb-2 text-[var(--text-muted)]" />
          <p className="text-[13px] text-[var(--text-primary)] mb-1">
            {isDragOver ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Images: JPG, PNG, GIF, WebP (max 10MB) · Videos: MP4, MOV (max 100MB)
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm,application/pdf"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-[12px] text-[var(--error)]">{error}</p>
      )}

      {/* Platform requirements */}
      <div className="text-[11px] text-[var(--text-muted)]">
        <span className="text-[var(--text-secondary)]">
          {platform === 'linkedin' ? '\u25A3' : platform === 'x' ? '\uD835\uDD4F' : '\uD83D\uDCF7'}{' '}
          {platform === 'linkedin' ? 'LinkedIn' : platform === 'x' ? 'X' : 'Instagram'}:
        </span>{' '}
        {reqs.image.recommended.width}x{reqs.image.recommended.height}px recommended, max {reqs.image.maxSize}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-[#FFB80010] border border-[#FFB80030] rounded-lg p-3">
          <p className="text-[12px] font-medium text-[#FFB800] mb-1">Warning: Platform recommendations</p>
          <ul className="text-[11px] text-[#FFB800]/80 space-y-0.5">
            {warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && files[lightboxIndex] && (
        <div
          className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-[201]"
            type="button"
          >
            <X size={20} />
          </button>

          {/* Previous */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-[201]"
              type="button"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Next */}
          {lightboxIndex < files.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-[201]"
              type="button"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Content */}
          <div className="max-w-[90vw] max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {files[lightboxIndex].type === 'image' && (
              <img
                src={files[lightboxIndex].url}
                alt={files[lightboxIndex].filename}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            )}
            {files[lightboxIndex].type === 'video' && (
              <video
                src={files[lightboxIndex].url}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-lg"
              />
            )}
            <div className="mt-3 text-center">
              <p className="text-[13px] text-white">{files[lightboxIndex].filename}</p>
              <p className="text-[11px] text-white/50">
                {formatFileSize(files[lightboxIndex].size)}
                {files[lightboxIndex].width && files[lightboxIndex].height && ` · ${files[lightboxIndex].width}×${files[lightboxIndex].height}`}
                {files.length > 1 && ` · ${lightboxIndex + 1} of ${files.length}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
