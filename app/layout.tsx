import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'La Familia — Idle Mafia Tycoon',
  description:
    'Build a 1930s crime empire. Run rackets, hire capos, buy upgrades, and retire for Respect in this idle tycoon game.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'La Familia', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a1714',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${geist.variable} ${playfair.variable}`}>
      <head><script id="level29-google-tag-manager" dangerouslySetInnerHTML={{ __html: "(function(w,d){\n  'use strict';\n  // Web only: native game builds keep their existing privacy/ads integration.\n  if(!/^https?:$/.test(w.location.protocol)||w.Capacitor?.isNativePlatform?.())return;\n  try{if(w.top!==w&&w.top.__level29GTM==='GTM-MTKR4ZCD')return;}catch(_){/* Cross-origin frames cannot inspect their parent. */}\n  if(w.__level29GTM==='GTM-MTKR4ZCD')return;\n  w.__level29GTM='GTM-MTKR4ZCD';\n  w.dataLayer=w.dataLayer||[];\n  w.gtag=w.gtag||function(){w.dataLayer.push(arguments);};\n  // The site's CMP must update consent; loading the container does not grant it.\n  if(!w.google_tag_data?.ics)w.gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});\n  w.gtag('js',new Date());\n  w.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});\n  var script=d.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtm.js?id=GTM-MTKR4ZCD';\n  d.head.appendChild(script);\n})(window,document);" }} /></head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
