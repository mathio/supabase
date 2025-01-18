import { IntlProvider } from 'react-intl'
import { PropsWithChildren } from 'react'

import enMessages from '~/i18n/en.json'
import jaMessages from '~/i18n/ja.json'

const i18nMessages: { [key: string]: any } = {
  en: enMessages,
  ja: jaMessages,
}

// Get browser language with fallback
const getDefaultLocale = (acceptLanguage?: string) => {
  if (typeof window === 'undefined') {
    // Parse accept-language header if provided
    if (acceptLanguage) {
      const preferredLanguage = acceptLanguage.split(',')[0].split('-')[0]
      return preferredLanguage || 'en'
    }
    return 'en'
  }
  return navigator.language.split('-')[0] || 'en'
}

export interface IntlProviderProps extends PropsWithChildren {
  language?: string
}

export function Intl({ children, language }: IntlProviderProps) {
  const defaultLocale = getDefaultLocale(language)
  const locale = defaultLocale in i18nMessages ? defaultLocale : 'en'
  const messages = i18nMessages[locale]

  return (
    <IntlProvider messages={messages} locale={locale} defaultLocale="en">
      {children}
    </IntlProvider>
  )
}
