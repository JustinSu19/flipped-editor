import type { ContentBlock, ImageVariant } from '../types/content'
import type { TemplateProps } from '../types/template'
import { Decor, ImageBlock, articleStyle, renderTextBlock, spacing } from './TemplatePrimitives'

const fixedHeroBlock: ContentBlock = { type: 'image', id: 'hero', variant: 'hero' }

const isStandardFrameVariant = (variant: ImageVariant) => variant === '4-3' || variant === '3-4' || variant === '9-16'

const poeticImageClass = (variant: ImageVariant) => {
  if (isStandardFrameVariant(variant)) return 'image-near-edge'
  if (variant === 'wide') return 'poetic-image poetic-image-wide'
  if (variant === 'square') return 'poetic-image poetic-image-square'
  if (variant === 'portrait' || variant === 'split') return 'poetic-image poetic-image-portrait'
  if (variant === 'small') return 'poetic-image image-small-center'
  return 'poetic-image'
}

export function PoeticMinimalTemplate({
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
    <article className="article-canvas poetic-template" style={articleStyle(styleConfig)}>
      <ImageBlock
        block={heroBlock}
        images={images}
        styleConfig={styleConfig}
        className="template-fixed-hero poetic-fixed-hero"
        onImageChange={onImageChange}
        onImageUpload={onImageUpload}
        onImageDelete={onImageDelete}
      />
      <div className="poetic-inner">
        <Decor>{styleConfig.decorText}</Decor>
        {blocks.map((block, index) => {
          if (index === heroIndex) return null
          if (block.type === 'paragraph') {
            return (
              <p
                key={index}
                className="article-p poetic-line"
                style={{ marginBottom: spacing(styleConfig, styleConfig.paragraphSpacing + 18) }}
                dangerouslySetInnerHTML={{ __html: block.text }}
              />
            )
          }
          if (block.type === 'image') {
            return (
              <ImageBlock
                key={index}
                block={block}
                images={images}
                styleConfig={styleConfig}
                className={poeticImageClass(block.variant)}
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
