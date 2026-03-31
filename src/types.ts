export type Category = 'meditation' | 'yoga' | 'relations' | 'talks';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  category: Category;
  imageUrl?: string;
  audioUrl?: string;
  type: 'audio' | 'video' | 'text';
}

export interface Feeling {
  id: string;
  label: string;
  icon: string;
  contentId: string;
}
