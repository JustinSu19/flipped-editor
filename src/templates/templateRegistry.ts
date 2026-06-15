import { ChapterCardsTemplate } from './ChapterCardsTemplate'
import { ImageEssayTemplate } from './ImageEssayTemplate'
import { NatureMagazineTemplate } from './NatureMagazineTemplate'
import { PoeticMinimalTemplate } from './PoeticMinimalTemplate'
import type { TemplateDefinition } from '../types/template'

export const templateRegistry: TemplateDefinition[] = [
  {
    id: 'nature-magazine',
    name: 'Nature Magazine',
    description: '自然影像、顶部大图、窄栏正文',
    Component: NatureMagazineTemplate,
  },
  {
    id: 'image-essay',
    name: 'Image Essay',
    description: '图文交错，适合旅行与城市观察',
    Component: ImageEssayTemplate,
  },
  {
    id: 'poetic-minimal',
    name: 'Poetic Minimal',
    description: '极简诗性，留白更大',
    Component: PoeticMinimalTemplate,
  },
  {
    id: 'chapter-cards',
    name: 'Chapter Cards',
    description: '章节卡片，适合笔记和深度文章',
    Component: ChapterCardsTemplate,
  },
]
