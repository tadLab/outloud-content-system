import { MediaFile, Platform } from '@/types';
import { MEDIA_REQUIREMENTS, MAX_FILE_SIZES } from '@/lib/constants';

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}

export function getVideoMetadata(
  file: File
): Promise<{ width: number; height: number; duration: number; thumbnailUrl: string }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      video.currentTime = 1;
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        thumbnailUrl: canvas.toDataURL('image/jpeg'),
      });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () =>
      resolve({ width: 0, height: 0, duration: 0, thumbnailUrl: '' });
    video.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getFileType(file: File): 'image' | 'video' | 'document' {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'document';
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const type = getFileType(file);
  const maxSize = MAX_FILE_SIZES[type];

  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm',
    'application/pdf',
  ];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type "${file.type}" is not supported` };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large (${formatFileSize(file.size)}). Max for ${type}: ${formatFileSize(maxSize)}`,
    };
  }

  return { valid: true };
}

export function getMediaWarnings(
  files: MediaFile[],
  platform: Platform
): string[] {
  const warnings: string[] = [];
  const reqs = MEDIA_REQUIREMENTS[platform];

  for (const file of files) {
    if (file.type === 'image' && reqs.image) {
      const rec = reqs.image.recommended;
      if (
        file.width &&
        file.height &&
        (file.width < rec.width || file.height < rec.height)
      ) {
        warnings.push(
          `${file.filename} is ${file.width}\u00D7${file.height}px \u2014 recommended: ${rec.width}\u00D7${rec.height}px`
        );
      }
    }
    if (file.type === 'video' && reqs.video) {
      const rec = reqs.video.recommended;
      if (
        file.width &&
        file.height &&
        (file.width < rec.width || file.height < rec.height)
      ) {
        warnings.push(
          `${file.filename} is ${file.width}\u00D7${file.height}px \u2014 recommended: ${rec.width}\u00D7${rec.height}px`
        );
      }
    }
  }

  return warnings;
}

export async function processFile(file: File): Promise<MediaFile> {
  const type = getFileType(file);
  const url = URL.createObjectURL(file);

  let width: number | undefined;
  let height: number | undefined;
  let duration: number | undefined;
  let thumbnailUrl: string | undefined;

  if (type === 'image') {
    const dims = await getImageDimensions(file);
    width = dims.width;
    height = dims.height;
  } else if (type === 'video') {
    const meta = await getVideoMetadata(file);
    width = meta.width;
    height = meta.height;
    duration = meta.duration;
    thumbnailUrl = meta.thumbnailUrl;
  }

  return {
    id: crypto.randomUUID(),
    url,
    filename: file.name,
    size: file.size,
    type,
    mimeType: file.type,
    width,
    height,
    duration,
    thumbnailUrl,
  };
}
