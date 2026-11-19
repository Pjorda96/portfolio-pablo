import { PageTransition } from '@/components/motion/PageTransition';
import { getContent, type Locale } from '@/content';
import { Link } from '@/i18n/navigation';
import { paths } from '@/i18n/routing';

/** Body of the 404 page, shared by `app/global-not-found.tsx` and `app/[locale]/not-found.tsx`. */
export function NotFoundView({ locale }: { locale: Locale }) {
  const { notFound } = getContent(locale).meta;

  return (
    <PageTransition>
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-20 sm:px-6 sm:py-28">
        <p className="kicker">404</p>
        <h1 className="max-w-[18ch] font-display text-[clamp(34px,5.2vw,60px)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance">
          {notFound.title.split(' · ')[0]}
        </h1>
        <p className="max-w-[60ch] text-lg text-text-muted">{notFound.text}</p>
        <p>
          <Link href={paths.home} className="btn-primary">
            {notFound.back}
          </Link>
        </p>
      </div>
    </PageTransition>
  );
}
