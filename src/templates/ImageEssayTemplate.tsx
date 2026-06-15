import type { ContentBlock } from '../types/content'
import type { TemplateProps } from '../types/template'
import { Decor, ImageBlock, articleStyle, renderTextBlock } from './TemplatePrimitives'

const fixedHeroBlock: ContentBlock = { type: 'image', id: 'hero', variant: 'hero' }

export function ImageEssayTemplate({ blocks, images, styleConfig, onImageChange }: TemplateProps) {
  const heroIndex = blocks.findIndex((block) => block.type === 'image' && block.variant === 'hero')
  const heroBlock = heroIndex >= 0 ? blocks[heroIndex] : fixedHeroBlock

  return (
    <article className="article-canvas image-essay-template" style={articleStyle(styleConfig)}>
      <ImageBlock block={heroBlock} images={images} styleConfig={styleConfig} className="template-fixed-hero" onImageChange={onImageChange} />
      <div className="article-body">
        <Decor>{styleConfig.decorText}</Decor>
        {blocks.map((block, index) => {
          if (index === heroIndex) return null
          if (block.type === 'image') {
            const small = index % 2 === 0 || block.variant === 'small' || block.variant === 'square'
            return (
              <ImageBlock
                key={index}
                block={block}
                images={images}
                styleConfig={styleConfig}
                className={small ? 'image-small-center' : 'image-full-bleed'}
                onImageChange={onImageChange}
              />
            )
          }
          if (block.type === 'paragraph' && index > 0 && index % 5 === 0) {
            return (
              <div key={index} className="essay-break">
                {renderTextBlock(block, styleConfig, index)}
              </div>
            )
          }
          return renderTextBlock(block, styleConfig, index)
        })}
      </div>
    </article>
  )
}
