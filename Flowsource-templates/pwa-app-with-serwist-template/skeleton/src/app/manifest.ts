import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sample PWA App using Next.js with Serwist ',
    short_name: 'PWA Sample',
    description: 'This is My Sample PWA App using Next.js to learn how to build a PWA using Serwist',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: 'icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'icons/icon-384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: 'icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
