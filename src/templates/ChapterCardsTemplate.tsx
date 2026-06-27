import type { ContentBlock, ImageVariant } from '../types/content'
import type { TemplateProps } from '../types/template'
import { Decor, ImageBlock, articleStyle, renderTextBlock } from './TemplatePrimitives'

const fixedHeroBlock: ContentBlock = { type: 'image', id: 'hero', variant: 'hero' }

const isStandardFrameVariant = (variant: ImageVariant) => variant === '4-3' || variant === '3-4' || variant === '9-16'

const chapterImageClass = (variant: ImageVariant) => {
  if (isStandardFrameVariant(variant)) return 'image-near-edge'
  if (variant === 'wide') return 'image-wide-contained'
  if (variant === 'square') return 'image-square-center'
  if (variant === 'portrait' || variant === 'split') return 'image-portrait-center'
  if (variant === 'small') return 'image-small-center'
  return ''
}

type Chapter = {
  title?: ContentBlock
  blocks: ContentBlock[]
}

const buildChapters = (blocks: ContentBlock[]) => {
  const intro: ContentBlock[] = []
  const chapters: Chapter[] = []
  let current: Chapter | null = null

  blocks.forEach((block) => {
    if (block.type === 'h2') {
      current = { title: block, blocks: [] }
      chapters.push(current)
      return
    }
    if (current) current.blocks.push(block)
    else intro.push(block)
  })

  return { intro, chapters }
}

export function ChapterCardsTemplate({
  blocks,
  images,
  styleConfig,
  onImageChange,
  onImageUpload,
  onImageDelete,
}: TemplateProps) {
  const { intro, chapters } = buildChapters(blocks)
  const heroIndex = blocks.findIndex((block) => block.type === 'image' && block.variant === 'hero')
  const heroBlock = heroIndex >= 0 ? blocks[heroIndex] : fixedHeroBlock

  return (
    <article className="article-canvas chapter-template" style={articleStyle(styleConfig)}>
      <ImageBlock
        block={heroBlock}
        images={images}
        styleConfig={styleConfig}
        className="template-fixed-hero"
        onImageChange={onImageChange}
        onImageUpload={onImageUpload}
        onImageDelete={onImageDelete}
      />
      <div className="article-body">
        <Decor>{styleConfig.decorText}</Decor>
        {intro.map((block, index) => {
          if (block === blocks[heroIndex]) return null
          if (block.type === 'image') {
            return (
              <ImageBlock
                key={index}
                block={block}
                images={images}
                styleConfig={styleConfig}
                className={chapterImageClass(block.variant)}
                onImageChange={onImageChange}
                onImageUpload={onImageUpload}
                onImageDelete={onImageDelete}
              />
            )
          }
          return renderTextBlock(block, styleConfig, index)
        })}
        {chapters.map((chapter, chapterIndex) => (
          <section key={chapterIndex} className="chapter-card">
            <span className="chapter-number">{String(chapterIndex + 1).padStart(2, '0')}</span>
            {chapter.title && renderTextBlock(chapter.title, styleConfig, chapterIndex)}
            {chapter.blocks.map((block, blockIndex) => {
              if (block === blocks[heroIndex]) return null
              if (block.type === 'image') {
                return (
                  <ImageBlock
                    key={blockIndex}
                    block={block}
                    images={images}
                    styleConfig={styleConfig}
                    className={chapterImageClass(block.variant)}
                    onImageChange={onImageChange}
                    onImageUpload={onImageUpload}
                    onImageDelete={onImageDelete}
                  />
                )
              }
              return renderTextBlock(block, styleConfig, blockIndex)
            })}
          </section>
        ))}
      </div>
    </article>
  )
}
