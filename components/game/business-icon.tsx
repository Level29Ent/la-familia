import { Car, Dices, Landmark, Music, Shield, Ship, Spade, Ticket, Wine, type LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  dice: Dices,
  ticket: Ticket,
  wine: Wine,
  shield: Shield,
  car: Car,
  spade: Spade,
  ship: Ship,
  music: Music,
  landmark: Landmark,
}

export function BusinessIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] ?? Dices
  return <Icon className={className} aria-hidden="true" />
}
