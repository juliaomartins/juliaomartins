/**
 * Structured data for search engines. A Server Component: the JSON is in the
 * HTML a crawler receives, with no client JS. `<` is escaped so a caption can
 * never close the script tag.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
