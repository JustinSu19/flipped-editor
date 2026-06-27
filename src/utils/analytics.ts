type UmamiPayload = Record<string, string | number | boolean>

type UmamiClient = {
  track?: (eventName: string, payload?: UmamiPayload) => void
}

declare global {
  interface Window {
    umami?: UmamiClient
  }
}

export const trackEvent = (eventName: string, payload?: UmamiPayload) => {
  if (typeof window === 'undefined') return

  try {
    window.umami?.track?.(eventName, payload)
  } catch (error) {
    console.warn('Umami event tracking failed.', error)
  }
}
