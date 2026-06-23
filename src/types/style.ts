export type StyleConfig = {
  articleWidth: number
  pageMargin: number
  backgroundColor: string
  paperColor: string
  textColor: string
  titleColor: string
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  sectionSpacing: number
  imageRadius: number
  imageFilterStrength: number
  whitespaceLevel: 'compact' | 'balanced' | 'airy'
  fontFamily: 'songti' | 'fangsong' | 'serif' | 'yahei'
  decorText: string
}

export const defaultStyleConfig: StyleConfig = {
  articleWidth: 390,
  pageMargin: 22,
  backgroundColor: '#f5f5f2',
  paperColor: '#f8f1dc',
  textColor: '#665f50',
  titleColor: '#3f392f',
  fontSize: 14,
  lineHeight: 1.9,
  paragraphSpacing: 20,
  sectionSpacing: 68,
  imageRadius: 18,
  imageFilterStrength: 0.8,
  whitespaceLevel: 'balanced',
  fontFamily: 'songti',
  decorText: '知古青年/ ZhiGu QingNian',
}
