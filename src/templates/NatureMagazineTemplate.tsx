import type { TemplateProps } from '../types/template'
import type { ContentBlock, ImageVariant } from '../types/content'
import { getImageByBlock } from '../utils/imageUtils'
import { Decor, ImageBlock, articleStyle, overlayTextColor, renderTextBlock } from './TemplatePrimitives'

const fixedHeroBlock: ContentBlock = { type: 'image', id: 'hero', variant: 'hero' }

const isStandardFrameVariant = (variant: ImageVariant) => variant === '4-3' || variant === '3-4' || variant === '9-16'

const natureImageClass = (variant: ImageVariant) => {
  if (isStandardFrameVariant(variant)) return 'image-near-edge'
  if (variant === 'wide') return 'image-full-bleed'
  if (variant === 'square') return 'image-square-center'
  if (variant === 'portrait' || variant === 'split') return 'image-portrait-center'
  if (variant === 'small') return 'image-small-center'
  return ''
}

export function NatureMagazineTemplate({
  blocks,
  images,
  styleConfig,
  onImageChange,
  onImageUpload,
  onImageDelete,
}: TemplateProps) {
  const heroIndex = blocks.findIndex((block) => block.type === 'image' && block.variant === 'hero')
  const titleBlock = blocks.find((block) => block.type === 'h1')
  const heroBlock = heroIndex >= 0 ? blocks[heroIndex] : fixedHeroBlock
  const heroImage = getImageByBlock(heroBlock, images)
  const heroTitleColor = overlayTextColor(heroImage, styleConfig.titleColor)

  return (
    <article className="article-canvas nature-template" style={articleStyle(styleConfig)}>
      <div className="nature-hero">
        <ImageBlock
          block={heroBlock}
          images={images}
          styleConfig={styleConfig}
          onImageChange={onImageChange}
          onImageUpload={onImageUpload}
          onImageDelete={onImageDelete}
        />
        {titleBlock?.type === 'h1' && (
          <div className="nature-title">
            <Decor>{styleConfig.decorText}</Decor>
            <h1 style={{ color: heroTitleColor }} dangerouslySetInnerHTML={{ __html: titleBlock.text }} />
          </div>
        )}
      </div>
      <div className="article-body narrow">
        {blocks.map((block, index) => {
          if (index === heroIndex || block.type === 'h1') return null
          if (block.type === 'image')
            return (
              <ImageBlock
                key={index}
                block={block}
                images={images}
                styleConfig={styleConfig}
                className={natureImageClass(block.variant)}
                onImageChange={onImageChange}
                onImageUpload={onImageUpload}
                onImageDelete={onImageDelete}
              />
            )
          return renderTextBlock(block, styleConfig, index)
        })}
      </div>
    </article>
  )
}
