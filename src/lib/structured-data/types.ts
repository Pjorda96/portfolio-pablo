/**
 * Minimal schema.org types for the JSON-LD this site emits. Only the
 * properties used here are modelled; `schema-dts` would cover everything but
 * is not a dependency.
 */

export const SCHEMA_CONTEXT = 'https://schema.org';

/** Reference to a node defined elsewhere (same page or another page). */
export interface IdRef {
  '@id': string;
}

export interface PostalAddressLd {
  '@type': 'PostalAddress';
  addressLocality: string;
  addressRegion: string;
  addressCountry: string;
}

export interface PlaceLd {
  '@type': 'Country' | 'City' | 'AdministrativeArea';
  name: string;
}

export interface PersonLd {
  '@type': 'Person';
  '@id': string;
  name: string;
  url: string;
  jobTitle: string;
  description?: string;
  email: string;
  address: PostalAddressLd;
  knowsLanguage: readonly string[];
  knowsAbout?: readonly string[];
  mainEntityOfPage?: string;
  /** Profiles of the same person elsewhere (GitHub, LinkedIn). */
  sameAs?: readonly string[];
}

export interface ProfessionalServiceLd {
  '@type': 'ProfessionalService';
  '@id': string;
  name: string;
  url: string;
  description: string;
  email: string;
  address: PostalAddressLd;
  areaServed: readonly PlaceLd[];
  knowsLanguage: readonly string[];
  founder: IdRef;
}

/** Short form of the business, for pages that only point at it. */
export interface ProfessionalServiceRefLd extends IdRef {
  '@type': 'ProfessionalService';
  name: string;
  url: string;
}

export interface WebSiteLd {
  '@type': 'WebSite';
  '@id': string;
  url: string;
  name: string;
  description: string;
  inLanguage: string;
  publisher: IdRef;
}

export interface ServiceLd {
  '@type': 'Service';
  '@id': string;
  name: string;
  serviceType: string;
  description: string;
  url: string;
  provider: ProfessionalServiceRefLd;
  areaServed: readonly PlaceLd[];
}

export interface OrganizationLd {
  '@type': 'Organization';
  name: string;
  url: string;
}

/** schema.org Role: the person plus the role they had in the work. */
export interface ContributorRoleLd {
  '@type': 'Role';
  roleName: string;
  contributor: IdRef & { '@type': 'Person'; name: string };
}

export interface CreativeWorkLd {
  '@type': 'CreativeWork';
  '@id': string;
  name: string;
  description: string;
  abstract: string;
  url: string;
  mainEntityOfPage: string;
  inLanguage: string;
  creator: OrganizationLd;
  contributor: ContributorRoleLd;
  keywords: string;
}

export interface ListItemLd {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbListLd {
  '@type': 'BreadcrumbList';
  '@id': string;
  itemListElement: readonly ListItemLd[];
}

export interface QuestionLd {
  '@type': 'Question';
  name: string;
  acceptedAnswer: { '@type': 'Answer'; text: string };
}

export interface FAQPageLd {
  '@type': 'FAQPage';
  '@id': string;
  url: string;
  name: string;
  inLanguage: string;
  mainEntity: readonly QuestionLd[];
}

export type StructuredNode =
  | PersonLd
  | ProfessionalServiceLd
  | WebSiteLd
  | ServiceLd
  | CreativeWorkLd
  | BreadcrumbListLd
  | FAQPageLd;

export type StructuredType = StructuredNode['@type'];

/** One JSON-LD document: every node of a page in a single `@graph`. */
export interface StructuredGraph {
  '@context': typeof SCHEMA_CONTEXT;
  '@graph': readonly StructuredNode[];
}
