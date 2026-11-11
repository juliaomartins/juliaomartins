import { contactDetails } from "@/data/contact";
import { galleryItems } from "@/data/gallery";
import { portrait } from "@/data/profile";
import { queueCase } from "@/data/queue-case";
import { skills } from "@/data/skills";
import { withoutEmoji } from "@/lib/emoji";
import en from "@/messages/en.json";

/**
 * What search engines are told about the site's images and videos, in one
 * place: the sitemap (src/app/sitemap.ts) lists them per page, and the JSON-LD
 * on each page describes them. Both read from here, so they cannot disagree.
 * Captions are the English ones from messages/en.json, with emoji removed (a
 * drawing cannot appear in search results); nothing is invented.
 */

export const SITE_URL = "https://juliaomartins.dev";
export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;

const NAME = "Julião Martins";
/** Every spelling people search for: most type it without the tilde. */
const ALTERNATE_NAMES = ["Juliao Martins", "Julião", "Juliao", "juliaomartins"];

/**
 * When the site's content last changed. The sitemap reports it, so search
 * engines can trust the date; bump it when pages or photos change.
 */
export const CONTENT_UPDATED = "2026-11-12";

/** Where photos were taken, as schema.org Places. */
const PLACE = {
  dili: "Dili, Timor-Leste",
  palmSpring: "Palm Spring, Dili, Timor-Leste",
  maubisse: "Mount Rabilau, Maubisse, Timor-Leste",
} as const;
const PERSON_ID = `${SITE_URL}/#person`;
const PORTRAIT_ID = `${SITE_URL}/#portrait`;

export type IndexedImage = {
  src: string;
  caption: string;
  width: number;
  height: number;
  /** Julião is in the photo, so it can be tied to him, not just the page. */
  showsJuliao?: boolean;
  /** Where it was taken, when known. */
  place?: string;
};

export type IndexedVideo = {
  src: string;
  poster: string;
  title: string;
  description: string;
  /** ISO date it was filmed. */
  date: string;
};

/* --------------------------------- Home ---------------------------------- */

const galleryPhotos = galleryItems.filter((item) => !item.video);
const galleryClips = galleryItems.filter((item) => item.video);

/** Gallery items Julião is in. */
const GALLERY_WITH_JULIAO = new Set(["drccmdInovtec"]);

/** Where each gallery item was taken, when known (from its caption). */
const GALLERY_PLACE: Record<string, string> = {
  hills: PLACE.maubisse,
  hacktoberfestCheer: PLACE.dili,
  hacktoberfestFriends: PLACE.dili,
  hacktoberfestGroup: PLACE.dili,
  drccmdInovtec: PLACE.palmSpring,
};

const caption = (id: string) =>
  withoutEmoji(en.gallery.captions[id as keyof typeof en.gallery.captions]);

export const homeImages: IndexedImage[] = [
  { ...portrait, caption: NAME, showsJuliao: true, place: PLACE.dili },
  ...galleryPhotos.map((item) => ({
    src: item.src,
    caption: caption(item.id),
    width: item.width,
    height: item.height,
    showsJuliao: GALLERY_WITH_JULIAO.has(item.id),
    place: GALLERY_PLACE[item.id],
  })),
];

export const homeVideos: IndexedVideo[] = galleryClips.map((item) => ({
  src: item.src,
  poster: item.video?.poster ?? "",
  title: caption(item.id),
  description: `${caption(item.id)}. From the gallery of ${NAME}, a developer in Dili, Timor-Leste.`,
  date: item.date.slice(0, 10),
}));

/* ------------------------------ Case study ------------------------------- */

const [stepVideo] = queueCase.steps.filter((step) => step.kind === "video");
const stepCopy = en.queueCase.steps;
const teamCopy = en.queueCase.team.photos;
const wallCopy = en.queueCase.photos;

/** Every case-study photo was taken at the event, at Palm Spring. */
export const caseImages: IndexedImage[] = [
  { ...queueCase.lead, caption: en.queueCase.leadAlt },
  ...queueCase.steps.flatMap((step, index) =>
    step.kind === "photo"
      ? [{ src: step.src, width: step.width, height: step.height, caption: stepCopy[index].alt }]
      : []
  ),
  ...queueCase.wall.flat().map((photo) => ({
    src: photo.src,
    width: photo.width,
    height: photo.height,
    caption: wallCopy[photo.id as keyof typeof wallCopy],
  })),
  ...queueCase.team.photos.map((photo) => ({
    src: photo.src,
    width: photo.width,
    height: photo.height,
    caption: teamCopy[photo.id as keyof typeof teamCopy].caption,
    showsJuliao: true,
  })),
].map((image) => ({ ...image, place: PLACE.palmSpring }));

export const caseVideos: IndexedVideo[] = [
  {
    src: stepVideo.src,
    poster: stepVideo.poster,
    title: `${en.queueCase.title}: ${stepCopy[3].title}`,
    description: stepCopy[3].alt,
    date: "2026-10-02",
  },
];

/* -------------------------------- JSON-LD -------------------------------- */

const place = (name: string) => ({ "@type": "Place", name });

const imageObject = (image: IndexedImage) => ({
  "@type": "ImageObject",
  contentUrl: absoluteUrl(image.src),
  url: absoluteUrl(image.src),
  name: image.caption,
  caption: image.caption,
  width: image.width,
  height: image.height,
  // No creator or copyright here: most of these photos were taken by event
  // photographers, and claiming them would be false.
  ...(image.showsJuliao ? { about: { "@id": PERSON_ID } } : {}),
  ...(image.place ? { contentLocation: place(image.place) } : {}),
});

const videoObject = (video: IndexedVideo) => ({
  "@type": "VideoObject",
  name: video.title,
  description: video.description,
  contentUrl: absoluteUrl(video.src),
  thumbnailUrl: absoluteUrl(video.poster),
  uploadDate: video.date,
});

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: NAME,
  givenName: "Julião",
  familyName: "Martins",
  alternateName: ALTERNATE_NAMES,
  url: SITE_URL,
  image: {
    "@type": "ImageObject",
    "@id": PORTRAIT_ID,
    contentUrl: absoluteUrl(portrait.src),
    url: absoluteUrl(portrait.src),
    width: portrait.width,
    height: portrait.height,
    caption: NAME,
  },
  jobTitle: "Developer",
  description: en.home.intro,
  worksFor: { "@type": "Organization", name: "Viettel Timor, Unipessoal, Lda. (Telemor)" },
  memberOf: { "@type": "Organization", name: "Inovtec", url: queueCase.team.site },
  knowsAbout: skills.map((skill) => skill.name),
  homeLocation: place(PLACE.dili),
  address: { "@type": "PostalAddress", addressLocality: "Dili", addressCountry: "TL" },
  sameAs: [`https://github.com/${contactDetails.github.user}`],
};

/** Home: who Julião is, his portrait, and the gallery tied to the page. */
export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    person,
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: NAME,
      alternateName: ALTERNATE_NAMES,
      inLanguage: ["en", "tet"],
      author: { "@id": PERSON_ID },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#page`,
      url: SITE_URL,
      name: `${NAME} (Juliao) – Developer in Dili, Timor-Leste`,
      dateModified: CONTENT_UPDATED,
      mainEntity: { "@id": PERSON_ID },
      primaryImageOfPage: { "@id": PORTRAIT_ID },
      image: homeImages.slice(1).map(imageObject),
      video: homeVideos.map(videoObject),
    },
  ],
};

/** Case study: an article by Julião, with every photo and the lobby footage. */
export const caseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: en.queueCase.metaTitle,
  description: en.queueCase.metaDescription,
  url: absoluteUrl(queueCase.href),
  datePublished: "2026-10-24",
  inLanguage: ["en", "tet"],
  author: { "@type": "Person", "@id": PERSON_ID, name: NAME, url: SITE_URL },
  image: caseImages.map(imageObject),
  video: caseVideos.map(videoObject),
  about: {
    "@type": "SoftwareApplication",
    name: en.queueCase.title,
    applicationCategory: "BusinessApplication",
    creator: { "@type": "Organization", name: "Inovtec", url: queueCase.team.site },
  },
};
