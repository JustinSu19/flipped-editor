import type { TemplateProps } from '../types/template'
import type { ContentBlock } from '../types/content'
import { getImageByBlock } from '../utils/imageUtils'
import { Decor, ImageBlock, articleStyle, overlayTextColor, renderTextBlock } from './TemplatePrimitives'

const fixedHeroBlock: ContentBlock = { type: 'image', id: 'hero', variant: 'hero' }

export function NatureMagazineTemplate({ blocks, images, styleConfig, onImageChange }: TemplateProps) {
  const heroIndex = blocks.findIndex((block) => block.type === 'image' && block.variant === 'hero')
  const titleBlock = blocks.find((block) => block.type === 'h1')
  const heroBlock = heroIndex >= 0 ? blocks[heroIndex] : fixedHeroBlock
  const heroImage = getImageByBlock(heroBlock, images)
  const heroTitleColor = overlayTextColor(heroImage, styleConfig.titleColor)

  return (
    <article className="article-canvas nature-template" style={articleStyle(styleConfig)}>
      <div className="nature-hero">
        <ImageBlock block={heroBlock} images={images} styleConfig={styleConfig} onImageChange={onImageChange} />
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
          if (block.type === 'image') return <ImageBlock key={index} block={block} images={images} styleConfig={styleConfig} onImageChange={onImageChange} />
          return renderTextBlock(block, styleConfig, index)
        })}
      </div>
    </article>
  )
}
