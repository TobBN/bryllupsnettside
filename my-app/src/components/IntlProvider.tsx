'use client';

import {ReactNode, createContext, useContext, useState} from 'react';
import {NextIntlClientProvider} from 'next-intl';
import no from '../../public/locales/no.json';
import en from '../../public/locales/en.json';

const messages = {no, en} as const;
type Locale = keyof typeof messages;

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'no',
  setLocale: () => {}
});

export function useLocaleContext() {
  return useContext(LocaleContext);
}

export function IntlProvider({children}: {children: ReactNode}) {
  const [locale, setLocale] = useState<Locale>('no');

  return (
    <LocaleContext.Provider value={{locale, setLocale}}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
