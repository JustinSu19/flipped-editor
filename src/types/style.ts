export type StyleConfig = {
  articleWidth: number
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
  fontFamily: 'songti' | 'fangsong' | 'serif'
  decorText: string
}

export const defaultStyleConfig: StyleConfig = {
  articleWidth: 390,
  backgroundColor: '#f5f5f2',
  paperColor: '#f7f3e8',
  textColor: '#66645c',
  titleColor: '#3f3d38',
  fontSize: 12,
  lineHeight: 1.9,
  paragraphSpacing: 20,
  sectionSpacing: 68,
  imageRadius: 18,
  imageFilterStrength: 0.8,
  whitespaceLevel: 'balanced',
  fontFamily: 'songti',
  decorText: '知古青年/ ZhiGu QingNian',
}
