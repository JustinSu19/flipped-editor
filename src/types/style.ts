export type StyleConfig = {
  articleWidth: number
  pageMargin: number
  wechatPageMargin: number
  backgroundColor: string
  paperColor: string
  textColor: string
  titleColor: string
  accentColor: string
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  sectionSpacing: number
  imageRadius: number
  imageFilterStrength: number
  whitespaceLevel: 'compact' | 'balanced' | 'airy'
  textAlign: 'left' | 'center' | 'right'
  fontFamily: 'songti' | 'fangsong' | 'serif' | 'yahei'
  decorText: string
}

export const defaultStyleConfig: StyleConfig = {
  articleWidth: 390,
  pageMargin: 43,
  wechatPageMargin: 22,
  backgroundColor: '#f6f6f4',
  paperColor: '#ffffff',
  textColor: '#625a4a',
  titleColor: '#3b3429',
  accentColor: '#26231f',
  fontSize: 14,
  lineHeight: 1.9,
  paragraphSpacing: 20,
  sectionSpacing: 68,
  imageRadius: 18,
  imageFilterStrength: 0.8,
  whitespaceLevel: 'balanced',
  textAlign: 'left',
  fontFamily: 'serif',
  decorText: '知古青年/ ZhiGu QingNian',
}
