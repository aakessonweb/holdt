import { ContentItem, Feeling } from './types';

export const CONTENT: ContentItem[] = [
  {
    id: 'm1',
    title: 'Find Indre Ro',
    duration: '10 min',
    category: 'meditation',
    imageUrl: 'https://picsum.photos/seed/med1/400/300',
    type: 'audio'
  },
  {
    id: 'm2',
    title: 'Skab Rolig Vejrtrækning',
    duration: '7 min',
    category: 'meditation',
    imageUrl: 'https://picsum.photos/seed/med2/400/300',
    type: 'audio'
  },
  {
    id: 'm3',
    title: 'Slap Af i Krop og Sind',
    duration: '12 min',
    category: 'meditation',
    imageUrl: 'https://picsum.photos/seed/med3/400/300',
    type: 'audio'
  },
  {
    id: 'm4',
    title: 'Taksnemmelighed',
    duration: '9 min',
    category: 'meditation',
    imageUrl: 'https://picsum.photos/seed/med4/400/300',
    type: 'audio'
  },
  {
    id: 'y1',
    title: 'Åben dit hjerte',
    duration: '8 min',
    category: 'yoga',
    imageUrl: 'https://picsum.photos/seed/yoga1/400/300',
    type: 'video'
  },
  {
    id: 'y2',
    title: 'Taknemmelighed',
    duration: '7 min',
    category: 'yoga',
    imageUrl: 'https://picsum.photos/seed/yoga2/400/300',
    type: 'video'
  },
  {
    id: 'y3',
    title: 'Giv slip',
    duration: '10 min',
    category: 'yoga',
    imageUrl: 'https://picsum.photos/seed/yoga3/400/300',
    type: 'video'
  },
  {
    id: 'y4',
    title: 'Afspænding',
    duration: '12 min',
    category: 'yoga',
    imageUrl: 'https://picsum.photos/seed/yoga4/400/300',
    type: 'video'
  },
  {
    id: 't1',
    title: 'Hvorfor vælger vi de partnere, vi gør?',
    description: 'Om mønstre, tiltrækning og barndom',
    category: 'talks',
    type: 'audio'
  },
  {
    id: 't2',
    title: 'Når kommunikationen går i stykker',
    description: 'Lær at forstå og blive forstået',
    category: 'talks',
    type: 'audio'
  },
  {
    id: 't3',
    title: 'Tillid - relationens fundament',
    description: 'Hvordan skaber og genopbygger vi tillid?',
    category: 'talks',
    type: 'audio'
  },
  {
    id: 'r1',
    title: 'Parforhold',
    description: 'Kommunikation, konflikter, tillid',
    category: 'relations',
    imageUrl: 'https://picsum.photos/seed/rel1/400/300',
    type: 'text'
  },
  {
    id: 'r2',
    title: 'Narcissistiske relationer',
    description: 'Manipulation, gaslighting, grænser',
    category: 'relations',
    imageUrl: 'https://picsum.photos/seed/rel2/400/300',
    type: 'text'
  },
  {
    id: 'r3',
    title: 'Selvværd i relationer',
    description: 'Grænser, respekt, selvværd',
    category: 'relations',
    imageUrl: 'https://picsum.photos/seed/rel3/400/300',
    type: 'text'
  }
];

export const FEELINGS: Feeling[] = [
  { id: 'f1', label: 'Jeg føler mig forkert', icon: '❤️', contentId: 'm1' },
  { id: 'f2', label: 'Jeg tvivler på min relation', icon: '💔', contentId: 't1' },
  { id: 'f3', label: 'Jeg har haft en konflikt', icon: '🧡', contentId: 't2' },
  { id: 'f4', label: 'Jeg føler mig manipuleret', icon: '🤎', contentId: 'm2' },
  { id: 'f5', label: 'Jeg føler mig alene', icon: '💚', contentId: 'm3' },
  { id: 'f6', label: 'Jeg har brug for ro', icon: '🌿', contentId: 'm4' },
];
