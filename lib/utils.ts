import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKwanza(value: number | string): string {
  // garante que seja número
  const amount = typeof value === 'string' ? parseFloat(value) : value;

  // formata com Intl.NumberFormat
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getVideoEmbedUrl(videoUrl: string): string {
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoId = videoUrl.includes('youtu.be')
      ? videoUrl.split('youtu.be/')[1]?.split('?')[0]
      : videoUrl.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  if (videoUrl.includes('vimeo.com')) {
    if (videoUrl.includes('player.vimeo.com/video')) {
      return videoUrl;
    }

    const parts = videoUrl.split('vimeo.com/')[1];
    return `https://player.vimeo.com/video/${parts}`;
  }

  return videoUrl;
}
