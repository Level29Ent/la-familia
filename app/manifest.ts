import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'La Familia — Idle Mafia Tycoon',
    short_name: 'La Familia',
    description: 'Build your family empire, one neighborhood at a time.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090e18',
    theme_color: '#090e18',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
