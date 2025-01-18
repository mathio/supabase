import { IntlProvider, useIntl } from 'react-intl'
import { PropsWithChildren, createContext, useContext, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'ui/src/components/shadcn/ui/dropdown-menu'

import enMessages from '~/i18n/en.json'
import jaMessages from '~/i18n/ja.json'

const i18nMessages: { [key: string]: any } = {
  en: enMessages,
  ja: jaMessages,
}

const languageNames: { [key: string]: string } = {
  en: 'English',
  ja: '日本語',
}

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps extends PropsWithChildren {
  initialLocale: string
}

export const LanguageProvider = ({ children, initialLocale }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState(initialLocale)

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage)
    if (typeof window !== 'undefined') {
      document.cookie = `preferred-language=${newLanguage}; path=/;`
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

const getSupportedLocale = (locale: string): string => {
  return locale in i18nMessages ? locale : 'en'
}

const getDefaultLocale = (acceptLanguage?: string) => {
  if (typeof window === 'undefined') {
    if (acceptLanguage) {
      const preferredLanguage = acceptLanguage.split(',')[0].split('-')[0]
      return preferredLanguage
    }
    return 'en'
  }
  return navigator.language.split('-')[0]
}

const getUserLocale = (headerCookies = '') => {
  const cookies = typeof window !== 'undefined' ? document.cookie : headerCookies
  const cookie = cookies.split(';').find((cookie) => cookie.trim().startsWith('preferred-language'))
  return cookie?.split('=')[1] ?? null
}

const getLocale = (acceptLanguage?: string, cookies?: string) => {
  const userLocale = getUserLocale(cookies)
  const locale = userLocale ? userLocale : getDefaultLocale(acceptLanguage)
  return getSupportedLocale(locale)
}

const IntlWithLanguage = ({ children }: PropsWithChildren) => {
  const { language } = useLanguage()
  const messages = i18nMessages[language]

  return (
    <IntlProvider messages={messages} locale={language} defaultLocale="en">
      {children}
    </IntlProvider>
  )
}

export interface IntlProviderProps extends PropsWithChildren {
  acceptLanguage?: string
  cookies?: string
}

export const Intl = ({ children, acceptLanguage, cookies }: IntlProviderProps) => {
  const locale = getLocale(acceptLanguage, cookies)
  return (
    <LanguageProvider initialLocale={locale}>
      <IntlWithLanguage>{children}</IntlWithLanguage>
    </LanguageProvider>
  )
}

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (locale: string) => {
    setLanguage(locale)
    setIsOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="flex items-center gap-2 text-sm text-foreground-light hover:text-foreground">
        {languageNames[language]}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        className="w-[160px] p-2 mt-2"
        sideOffset={8}
      >
        {Object.entries(i18nMessages).map(([locale, _]) => (
          <DropdownMenuItem
            key={locale}
            className={`group text-sm ${language === locale ? 'text-brand' : ''}`}
            onClick={() => handleLanguageChange(locale)}
          >
            {languageNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
