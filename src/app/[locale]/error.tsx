'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { Link } from '@/i18n/navigation';
import { paths } from '@/i18n/routing';

/** Error boundary of every page: a calm message and a retry. */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const t = useTranslations('Error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto grid max-w-6xl gap-4 px-4 py-20 sm:px-6 sm:py-28">
      <h1 className="max-w-[18ch] font-display text-[clamp(34px,5.2vw,60px)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance">
        {t('title')}
      </h1>
      <p className="max-w-[60ch] text-lg text-text-muted">{t('text')}</p>
      <p className="flex flex-wrap gap-2">
        <button type="button" onClick={() => retry()} className="btn-primary">
          {t('retry')}
        </button>
        <Link href={paths.home} className="btn-secondary">
          {t('back')}
        </Link>
      </p>
    </div>
  );
}
