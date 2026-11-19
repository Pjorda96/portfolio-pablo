import { serializeJsonLd, type StructuredGraph } from '@/lib/structured-data';

/**
 * Structured data of a page as a JSON-LD script (a plain `<script>`, not
 * `next/script`: it is data, not code). Server Component.
 */
export function JsonLd({ data }: { data: StructuredGraph }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
