import type { TemplateProps } from '../types/template'
import type { ContentBlock } from '../types/content'
import { getImageByBlock } from '../utils/imageUtils'
import { Decor, ImageBlock, articleStyle, overlayTextColor, renderTextBlock } from './TemplatePrimitives'

const fixedHeroBlock: ContentBlock = { type: 'image', id: 'hero', variant: 'hero' }

export function HeroOpeningTemplate({ blocks, images, styleConfig, onImageChange }: TemplateProps) {
  const heroIndex = blocks.findIndex((block) => block.type === 'image' && block.variant === 'hero')
  const titleBlock = blocks.find((block) => block.type === 'h1')
  const heroBlock = heroIndex >= 0 ? blocks[heroIndex] : fixedHeroBlock
  const heroImage = getImageByBlock(heroBlock, images)
  const heroTitleColor = overlayTextColor(heroImage, '#f8f5ed')

  return (
    <article className="article-canvas hero-opening-template" style={articleStyle(styleConfig)}>
      <section className="hero-opening has-image">
        <ImageBlock block={heroBlock} images={images} styleConfig={styleConfig} className="hero-tall" onImageChange={onImageChange} />
        <div className="hero-opening-title" style={{ color: heroTitleColor }}>
          <Decor>{styleConfig.decorText}</Decor>
          {titleBlock?.type === 'h1' && <h1 dangerouslySetInnerHTML={{ __html: titleBlock.text }} />}
        </div>
      </section>
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
