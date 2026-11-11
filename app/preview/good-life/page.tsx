import { notFound } from 'next/navigation'
import { GoodLifePreview } from '@/components/game/good-life-preview'

export const dynamic = 'force-static'

export default function GoodLifePreviewPage() {
  // Compile this fixture only on Vercel previews; production exports serve a 404 here.
  if (process.env.VERCEL_ENV !== 'preview') notFound()
  return <GoodLifePreview />
}
