import { GripVertical, ImagePlus, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import type { UploadedImage } from '../types/image'
import { createUploadedImages, normalizeImageIds } from '../utils/imageUtils'

type Props = {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
}

const reorder = (images: UploadedImage[], fromIndex: number, toIndex: number) => {
  const nextImages = [...images]
  const [moving] = nextImages.splice(fromIndex, 1)
  nextImages.splice(toIndex, 0, moving)
  return normalizeImageIds(nextImages)
}

export function ImageUploader({ images, onChange }: Props) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

  const addFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []).filter((file) => file.type.startsWith('image/'))
    if (!files.length) return
    const nextImages = await createUploadedImages(files)
    onChange(normalizeImageIds([...images, ...nextImages]))
  }

  return (
    <section className="control-section">
      <div className="section-title">
        <ImagePlus size={16} />
        <span>图片上传</span>
        <small>已上传 {images.length} 张</small>
      </div>
      <label
        className="drop-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          void addFiles(event.dataTransfer.files)
        }}
      >
        <Upload size={18} />
        <span>点击或拖拽上传图片</span>
        <input type="file" accept="image/*" multiple onChange={(event) => void addFiles(event.target.files)} />
      </label>
      {images.length > 0 && (
        <div className="image-strip">
          {images.map((image, index) => (
            <div
              key={`${image.id}-${image.url}`}
              className={draggingIndex === index ? 'image-thumb dragging' : 'image-thumb'}
              draggable
              onDragStart={(event) => {
                setDraggingIndex(index)
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', String(index))
              }}
              onDragEnd={() => setDraggingIndex(null)}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(event) => {
                event.preventDefault()
                const fromIndex = Number(event.dataTransfer.getData('text/plain'))
                setDraggingIndex(null)
                if (Number.isNaN(fromIndex) || fromIndex === index) return
                onChange(reorder(images, fromIndex, index))
              }}
            >
              <img src={image.url} alt={image.name} />
              <span>{image.id}</span>
              <div className="image-drag-handle" aria-hidden="true">
                <GripVertical size={14} />
              </div>
              <button
                type="button"
                aria-label="删除图片"
                onClick={() => onChange(normalizeImageIds(images.filter((item) => item.url !== image.url)))}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
