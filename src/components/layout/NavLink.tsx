'use client';

import type { ComponentProps } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
import type { AppPathname } from '@/i18n/routing';

type NavLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & { href: AppPathname };

/** `Link` that marks itself `aria-current="page"` on its own page. */
export function NavLink({ href, ...props }: NavLinkProps) {
  const pathname = usePathname();
  return <Link href={href} aria-current={pathname === href ? 'page' : undefined} {...props} />;
}
