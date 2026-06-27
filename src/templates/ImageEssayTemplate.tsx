import type { ContentBlock } from '../types/content'
import type { ImageVariant } from '../types/content'
import type { TemplateProps } from '../types/template'
import { Decor, ImageBlock, articleStyle, renderTextBlock } from './TemplatePrimitives'

const fixedHeroBlock: ContentBlock = { type: 'image', id: 'hero', variant: 'hero' }

const isStandardFrameVariant = (variant: ImageVariant) => variant === '4-3' || variant === '3-4' || variant === '9-16'

const imageEssayClass = (variant: ImageVariant) => {
  if (isStandardFrameVariant(variant)) return 'image-near-edge'
  if (variant === 'wide') return 'image-full-bleed'
  if (variant === 'square') return 'image-square-center'
  if (variant === 'portrait') return 'image-portrait-center'
  if (variant === 'small') return 'image-small-center'
  if (variant === 'split') return 'image-portrait-center'
  return 'image-full-bleed'
}

export function ImageEssayTemplate({
  blocks,
  images,
  styleConfig,
  onImageChange,
  onImageUpload,
  onImageDelete,
}: TemplateProps) {
  const heroIndex = blocks.findIndex((block) => block.type === 'image' && block.variant === 'hero')
  const heroBlock = heroIndex >= 0 ? blocks[heroIndex] : fixedHeroBlock

  return (
    <article className="article-canvas image-essay-template" style={articleStyle(styleConfig)}>
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
        {blocks.map((block, index) => {
          if (index === heroIndex) return null
          if (block.type === 'image') {
            return (
              <ImageBlock
                key={index}
                block={block}
                images={images}
                styleConfig={styleConfig}
                className={imageEssayClass(block.variant)}
                onImageChange={onImageChange}
                onImageUpload={onImageUpload}
                onImageDelete={onImageDelete}
              />
            )
          }
          return renderTextBlock(block, styleConfig, index)
        })}
      </div>
    </article>
  )
}
