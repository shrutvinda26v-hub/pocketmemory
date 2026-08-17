export type PokemonType =
  | 'grass'
  | 'fire'
  | 'water'
  | 'electric'
  | 'normal'
  | 'psychic'
  | 'ghost'
  | 'dragon'
  | 'fairy'
  | 'fighting'
  | 'poison'
  | 'flying'
  | 'steel'
  | 'ground'

export interface Pokemon {
  id: number
  name: string
  types: PokemonType[]
  sprite: string
}

export const TYPE_COLORS: Record<PokemonType, string> = {
  grass: '#7ac74c',
  fire: '#f57d31',
  water: '#6390f0',
  electric: '#f7d02c',
  normal: '#e6dcc8',
  psychic: '#f95587',
  ghost: '#735797',
  dragon: '#6f35fc',
  fairy: '#eebae9',
  fighting: '#c22e28',
  poison: '#a33ea1',
  flying: '#a98ff3',
  steel: '#b7b7ce',
  ground: '#e2bf65',
}

export const ROSTER: Pokemon[] = [
  { id: 1, name: 'Bulbasaur', types: ['grass', 'poison'], sprite: '/pokemon/001.png' },
  { id: 4, name: 'Charmander', types: ['fire'], sprite: '/pokemon/004.png' },
  { id: 6, name: 'Charizard', types: ['fire', 'flying'], sprite: '/pokemon/006.png' },
  { id: 7, name: 'Squirtle', types: ['water'], sprite: '/pokemon/007.png' },
  { id: 25, name: 'Pikachu', types: ['electric'], sprite: '/pokemon/025.png' },
  { id: 39, name: 'Jigglypuff', types: ['normal', 'fairy'], sprite: '/pokemon/039.png' },
  { id: 52, name: 'Meowth', types: ['normal'], sprite: '/pokemon/052.png' },
  { id: 54, name: 'Psyduck', types: ['water'], sprite: '/pokemon/054.png' },
  { id: 94, name: 'Gengar', types: ['ghost', 'poison'], sprite: '/pokemon/094.png' },
  { id: 133, name: 'Eevee', types: ['normal'], sprite: '/pokemon/133.png' },
  { id: 143, name: 'Snorlax', types: ['normal'], sprite: '/pokemon/143.png' },
  { id: 149, name: 'Dragonite', types: ['dragon', 'flying'], sprite: '/pokemon/149.png' },
  { id: 150, name: 'Mewtwo', types: ['psychic'], sprite: '/pokemon/150.png' },
  { id: 151, name: 'Mew', types: ['psychic'], sprite: '/pokemon/151.png' },
  { id: 445, name: 'Garchomp', types: ['dragon', 'ground'], sprite: '/pokemon/445.png' },
  { id: 448, name: 'Lucario', types: ['fighting', 'steel'], sprite: '/pokemon/448.png' },
  { id: 658, name: 'Greninja', types: ['water'], sprite: '/pokemon/658.png' },
  { id: 778, name: 'Mimikyu', types: ['ghost', 'fairy'], sprite: '/pokemon/778.png' },
]

export function padDex(id: number): string {
  return String(id).padStart(3, '0')
}

export function accentFor(pokemon: Pokemon): string {
  return TYPE_COLORS[pokemon.types[0] ?? 'normal']
}

export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0
  return ((index % length) + length) % length
}
