/** The emoji the site draws as SVG (components/ui/EmojiText): ❤ / ❤️, 👏, 🔥.
 * The capture group keeps the matches when splitting. */
export const EMOJI = /(❤️?|\u{1F44F}|\u{1F525})/u;

/** Text with those emoji removed, for what search engines read (structured
 * data, sitemaps), where a drawing cannot appear. */
export const withoutEmoji = (text: string) =>
  text
    .replace(new RegExp(EMOJI.source, "gu"), "")
    .replace(/\s{2,}/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
