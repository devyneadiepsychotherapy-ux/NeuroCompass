export type ThemeId =
  | 'default'
  | 'monochrome'
  | 'pastel-dream'
  | 'midnight-ocean'
  | 'deep-amethyst'
  | 'sand-stone'
  | 'autumn-leaves'
  | 'cloudy-day'
  | 'rose-quartz'
  | 'earthy-green'
  | 'citrus-grove'
  | 'botanical'
  | 'berry-patch'
  | 'holographic'
  | 'winter-frost'
  | 'rainbow'
  | 'stormy-night'
  | 'cherry-blossom'
  | 'hyperfocus'
  | 'sensory-rest'

export interface Theme {
  id: ThemeId
  name: string
  unlockLevel: number
  background: string
  card: string
  primary: string
  secondary: string
  text: string
  textMuted: string
  preview: string[]
}

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Forest Sage',
    unlockLevel: 1,
    background: '#B8D0AE',
    card: '#F0F4EF',
    primary: '#6B8F71',
    secondary: '#8FAF94',
    text: '#2D3B2E',
    textMuted: '#6B7A6C',
    preview: ['#B8D0AE', '#6B8F71', '#2D3B2E'],
  },
  {
    id: 'monochrome',
    name: 'Warm Parchment',
    unlockLevel: 2,
    background: '#F2EBE0',
    card: '#FAF7F4',
    primary: '#6F4E35',
    secondary: '#A68B6E',
    text: '#2E1A08',
    textMuted: '#7A6550',
    preview: ['#F2EBE0', '#6F4E35', '#A68B6E'],
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    unlockLevel: 3,
    background: '#FBF2FD',
    card: '#FFF7FE',
    primary: '#D080BE',
    secondary: '#B4CCEF',
    text: '#3A2040',
    textMuted: '#9E7DAA',
    preview: ['#FBF2FD', '#E8B0D8', '#B4CCEF'],
  },
  {
    id: 'midnight-ocean',
    name: 'Midnight Ocean',
    unlockLevel: 5,
    background: '#0D1B2A',
    card: '#1B2D3E',
    primary: '#4A9EBF',
    secondary: '#2E6B8A',
    text: '#E8F4F8',
    textMuted: '#8BB5C8',
    preview: ['#0D1B2A', '#4A9EBF', '#E8F4F8'],
  },
  {
    id: 'deep-amethyst',
    name: 'Deep Amethyst',
    unlockLevel: 7,
    background: '#1A1030',
    card: '#271A45',
    primary: '#9B7FD4',
    secondary: '#C484B0',
    text: '#EDE8F8',
    textMuted: '#A090CC',
    preview: ['#1A1030', '#9B7FD4', '#C484B0'],
  },
  {
    id: 'sand-stone',
    name: 'Sand & Stone',
    unlockLevel: 8,
    background: '#F0E8D8',
    card: '#FAF5ED',
    primary: '#8B6840',
    secondary: '#C4A882',
    text: '#3D2A14',
    textMuted: '#806040',
    preview: ['#F0E8D8', '#8B6840', '#C4A882'],
  },
  {
    id: 'autumn-leaves',
    name: 'Autumn Leaves',
    unlockLevel: 10,
    background: '#FBF1E9',
    card: '#FDF6EF',
    primary: '#C4622D',
    secondary: '#E09547',
    text: '#3B2010',
    textMuted: '#8B5A35',
    preview: ['#FBF1E9', '#C4622D', '#E09547'],
  },
  {
    id: 'cloudy-day',
    name: 'Cloudy Day',
    unlockLevel: 12,
    background: '#E8EAEE',
    card: '#F4F6F8',
    primary: '#5A7080',
    secondary: '#8AA0B0',
    text: '#2A3240',
    textMuted: '#607080',
    preview: ['#E8EAEE', '#5A7080', '#8AA0B0'],
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    unlockLevel: 13,
    background: '#F8EEF2',
    card: '#FEF8FA',
    primary: '#C4849A',
    secondary: '#D4A8B8',
    text: '#3A2030',
    textMuted: '#9A6878',
    preview: ['#F8EEF2', '#C4849A', '#D4A8B8'],
  },
  {
    id: 'earthy-green',
    name: 'Earthy Green',
    unlockLevel: 15,
    background: '#EAF0E6',
    card: '#F0F5EC',
    primary: '#4A7C59',
    secondary: '#7BA88A',
    text: '#1E3025',
    textMuted: '#567363',
    preview: ['#EAF0E6', '#4A7C59', '#7BA88A'],
  },
  {
    id: 'citrus-grove',
    name: 'Citrus Grove',
    unlockLevel: 18,
    background: '#FFF8E4',
    card: '#FFFDF4',
    primary: '#C87C28',
    secondary: '#4A8A7C',
    text: '#2A1808',
    textMuted: '#806040',
    preview: ['#FFF8E4', '#C87C28', '#4A8A7C'],
  },
  {
    id: 'botanical',
    name: 'Botanical Garden',
    unlockLevel: 20,
    background: '#EDF3EE',
    card: '#F4F9F4',
    primary: '#4A7A58',
    secondary: '#9B6FB8',
    text: '#1A2420',
    textMuted: '#5A7060',
    preview: ['#EDF3EE', '#4A7A58', '#9B6FB8'],
  },
  {
    id: 'berry-patch',
    name: 'Berry Patch',
    unlockLevel: 22,
    background: '#F4EEF8',
    card: '#FBF7FE',
    primary: '#8B3A7A',
    secondary: '#B87498',
    text: '#2A0A28',
    textMuted: '#8A5280',
    preview: ['#F4EEF8', '#8B3A7A', '#B87498'],
  },
  {
    id: 'holographic',
    name: 'Holographic',
    unlockLevel: 25,
    background: '#F0EEF8',
    card: '#F8F7FC',
    primary: '#8B6FBF',
    secondary: '#6FB8BF',
    text: '#1E1530',
    textMuted: '#7A6A96',
    preview: ['#F0EEF8', '#8B6FBF', '#6FB8BF'],
  },
  {
    id: 'winter-frost',
    name: 'Winter Frost',
    unlockLevel: 27,
    background: '#EEF4F8',
    card: '#F8FCFE',
    primary: '#3A6A8A',
    secondary: '#7AAABB',
    text: '#1A2838',
    textMuted: '#5A7888',
    preview: ['#EEF4F8', '#3A6A8A', '#7AAABB'],
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    unlockLevel: 30,
    background: '#FFF8F0',
    card: '#FFFCF8',
    primary: '#E06B6B',
    secondary: '#6B9FE0',
    text: '#1A1A2E',
    textMuted: '#8A7A9A',
    preview: ['#FFF8F0', '#E06B6B', '#6B9FE0'],
  },
  {
    id: 'stormy-night',
    name: 'Stormy Night',
    unlockLevel: 32,
    background: '#080F18',
    card: '#0E1A28',
    primary: '#00C4E0',
    secondary: '#0088A8',
    text: '#DDF0F8',
    textMuted: '#5090A8',
    preview: ['#080F18', '#00C4E0', '#5090A8'],
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    unlockLevel: 35,
    background: '#FFF0F4',
    card: '#FFFCFD',
    primary: '#CC607A',
    secondary: '#E8A0B4',
    text: '#3A1820',
    textMuted: '#9A6070',
    preview: ['#FFF0F4', '#CC607A', '#E8A0B4'],
  },
  {
    id: 'hyperfocus',
    name: 'Hyperfocus',
    unlockLevel: 40,
    background: '#0A0A0E',
    card: '#141420',
    primary: '#00FF88',
    secondary: '#FF4488',
    text: '#F0F0FF',
    textMuted: '#8888AA',
    preview: ['#0A0A0E', '#00FF88', '#FF4488'],
  },
  {
    id: 'sensory-rest',
    name: 'Sensory Rest',
    unlockLevel: 45,
    background: '#F2F2F2',
    card: '#FAFAFA',
    primary: '#5A5A68',
    secondary: '#8A8A98',
    text: '#1A1A22',
    textMuted: '#6A6A78',
    preview: ['#F2F2F2', '#5A5A68', '#8A8A98'],
  },
]

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
