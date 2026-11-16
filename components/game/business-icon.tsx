import {
  Croissant,
  Flower2,
  Fish,
  Warehouse,
  Radio,
  Shirt,
  Store,
  Scissors,
  Gem,
  Film,
  Hotel,
  Watch,
  Car,
  Dices,
  Landmark,
  Music,
  Shield,
  Ship,
  Spade,
  Ticket,
  Wine,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  bread: Croissant,
  flower: Flower2,
  fish: Fish,
  warehouse: Warehouse,
  radio: Radio,
  shirt: Shirt,
  store: Store,
  scissors: Scissors,
  gem: Gem,
  film: Film,
  hotel: Hotel,
  watch: Watch,
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
