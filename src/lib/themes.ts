export type ThemeId =
  | 'default'
  | 'monochrome'
  | 'pastel-dream'
  | 'midnight-ocean'
  | 'autumn-leaves'
  | 'earthy-green'
  | 'botanical'
  | 'holographic'
  | 'rainbow'

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
    name: 'Monochrome',
    unlockLevel: 2,
    background: '#F5F5F5',
    card: '#FFFFFF',
    primary: '#333333',
    secondary: '#777777',
    text: '#111111',
    textMuted: '#666666',
    preview: ['#F5F5F5', '#333333', '#777777'],
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    unlockLevel: 3,
    background: '#FDF0F8',
    card: '#FFF5FB',
    primary: '#C17BAC',
    secondary: '#A8C5E8',
    text: '#3D2B38',
    textMuted: '#8A6880',
    preview: ['#FDF0F8', '#C17BAC', '#A8C5E8'],
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
    id: 'botanical',
    name: 'Botanical Garden',
    unlockLevel: 20,
    background: '#EEF4EC',
    card: '#F5F9F4',
    primary: '#3D6B47',
    secondary: '#89B87A',
    text: '#1A2E1C',
    textMuted: '#5E8065',
    preview: ['#EEF4EC', '#3D6B47', '#89B87A'],
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
]

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
