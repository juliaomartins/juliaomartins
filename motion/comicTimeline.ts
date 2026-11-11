import { gsap } from "@/motion/registry";
import { comic } from "@/motion/tokens";

const { cue, duration, ease, from } = comic;

type Timeline = gsap.core.Timeline;
type Target = gsap.TweenTarget;

/** Out: shrink away and hide. */
const leave = (target: Target) =>
  gsap.to(target, {
    autoAlpha: 0,
    scale: from.outScale,
    duration: duration.out,
    ease: ease.out,
    stagger: duration.flash,
  });

/** A caption or bubble popping in with overshoot, from small and tilted. */
const pop = (target: Target, tilt: number, scale: number = from.captionScale) =>
  gsap.fromTo(
    target,
    { autoAlpha: 0, scale, rotation: tilt },
    { autoAlpha: 1, scale: 1, rotation: 0, duration: duration.pop, ease: ease.pop }
  );

/** A small star spinning in. */
const twinkle = (target: Target) =>
  gsap.fromTo(
    target,
    { autoAlpha: 0, scale: 0, rotation: from.starTilt },
    {
      autoAlpha: 1,
      scale: 1,
      rotation: 0,
      duration: duration.fade,
      ease: ease.pop,
      stagger: comic.stagger,
      immediateRender: false,
    }
  );

/**
 * An impact: the burst snaps open behind the word, the word slams down from
 * large and squashes on landing, the speed lines flash and the overlay shakes.
 * The word lands exactly `duration.slam` after the scene starts, so callers
 * place the scene that much before the shout.
 */
function impact(
  stage: Target,
  lines: Target,
  word: Target,
  burst: Target | null,
  linesRest: number,
  wordFrom: gsap.TweenVars = { scale: from.slamScale }
): Timeline {
  const tl = gsap.timeline();
  if (burst) {
    tl.fromTo(
      burst,
      { autoAlpha: 0, scale: from.burstScale, rotation: from.burstTilt },
      { autoAlpha: 1, scale: 1, rotation: 0, duration: duration.burst, ease: ease.burst },
      0
    );
  }
  tl.fromTo(
    word,
    { autoAlpha: 0, ...wordFrom },
    { autoAlpha: 1, scale: 1, rotation: 0, duration: duration.slam, ease: ease.slam },
    0
  )
    .addLabel("hit")
    .to(
      word,
      { scale: comic.squash, duration: duration.flash, ease: ease.fade, yoyo: true, repeat: 1 },
      "hit"
    )
    .to(lines, { autoAlpha: comic.lines.peak, duration: duration.flash, ease: ease.fade }, "hit")
    .to(lines, { autoAlpha: linesRest, duration: duration.fade, ease: ease.fade }, ">")
    .fromTo(
      stage,
      { x: comic.shake.x, y: comic.shake.y },
      { x: 0, y: 0, duration: duration.shake, ease: ease.shake, immediateRender: false },
      "hit"
    );
  return tl;
}

/** Reduced motion: every caption appears and disappears on its cue, no movement. */
function stillTimeline(q: gsap.utils.SelectorFunc): Timeline {
  const tl = gsap.timeline({ paused: true });
  const show = (selector: string, at: number, until?: number) => {
    tl.set(q(selector), { autoAlpha: 1 }, at);
    if (until !== undefined) tl.set(q(selector), { autoAlpha: 0 }, until);
  };
  show("[data-comic='intro']", cue.intro, cue.introOut);
  show("[data-comic='bubble']", cue.speech, cue.speechOut);
  cue.yes.forEach((at, index) => {
    show(`[data-comic='yes-${index + 1}'] [data-comic-part]`, at, cue.yesOut);
  });
  show("[data-comic='clap']", cue.clap, cue.sfxOut);
  show("[data-comic='cheer']", cue.cheer, cue.sfxOut);
  show("[data-comic='title']", cue.title);
  return tl.to({}, { duration: 0 }, cue.end);
}

/**
 * The whole comic overlay as one paused timeline whose time is the video's
 * time: ComicClip sets `tl.time(video.currentTime)` every frame, so the
 * overlay can never drift from the sound — pause, seek, loop and replay all
 * just work. Scenes are labelled and placed on the cues measured from the
 * audio (motion/tokens.ts).
 */
export function buildComicTimeline(root: HTMLElement, still: boolean): Timeline {
  const q = gsap.utils.selector(root);
  if (still) return stillTimeline(q);

  const stage = q("[data-comic-stage]");
  const lines = q("[data-comic='lines']");
  const dots = q("[data-comic='dots']");
  const stars = q("[data-comic='star']");
  const bubble = q("[data-comic='bubble']");
  const sfx = [q("[data-comic='clap']"), q("[data-comic='cheer']")];
  const tl = gsap.timeline({ paused: true });

  // Scene 1 — the quiet before: a small caption.
  tl.addLabel("intro", cue.intro)
    .add(pop(q("[data-comic='intro']"), from.captionTilt), "intro")
    .add(leave(q("[data-comic='intro']")), cue.introOut);

  // Scene 2 — she speaks: the bubble pops from its tail, bounces, then
  // sways gently for as long as the line lasts.
  tl.addLabel("speech", cue.speech)
    .add(pop(bubble, from.bubbleTilt, 0), "speech")
    .to(
      bubble,
      { yPercent: comic.bob, duration: duration.out, ease: ease.wobble, yoyo: true, repeat: 1 },
      `speech+=${duration.pop}`
    )
    .to(
      bubble,
      { rotation: comic.wobble, duration: duration.wobble, ease: ease.wobble, yoyo: true, repeat: 2 },
      ">"
    )
    .add(leave(bubble), cue.speechOut);

  // The room claps before the chant: halftone and two stars, no words.
  tl.addLabel("applause", cue.applause)
    .to(dots, { autoAlpha: comic.dots.applause, duration: duration.fade, ease: ease.fade }, "applause")
    .add(twinkle(stars.slice(0, 2)), "applause")
    .to(dots, { autoAlpha: 0, duration: duration.fade, ease: ease.out }, cue.applauseOut)
    .add(leave(stars.slice(0, 2)), cue.applauseOut);

  // Scene 3 — YES! YES! YES! Each word lands on its own shout.
  cue.yes.forEach((at, index) => {
    const piece = `[data-comic='yes-${index + 1}']`;
    tl.addLabel(`yes${index + 1}`, at - duration.slam)
      .add(
        impact(stage, lines, q(`${piece} [data-comic-part='word']`), q(`${piece} [data-comic-part='burst']`), comic.lines.rest),
        `yes${index + 1}`
      )
      .add(twinkle(stars[index + 1]), at);
  });
  // The parts leave, not their slots: a slot's tilt and centring are CSS.
  tl.add(leave(q("[data-comic^='yes-'] [data-comic-part]")), cue.yesOut)
    .add(leave(stars.slice(1, 4)), cue.yesOut)
    .to(lines, { autoAlpha: 0, duration: duration.fade, ease: ease.out }, cue.yesOut);

  // Scene 4 — applause: two small sound effects that jitter in place.
  tl.addLabel("clap", cue.clap)
    .add(pop(sfx[0], from.captionTilt), "clap")
    .to(
      sfx[0],
      { rotation: comic.jitter, duration: duration.jitter, ease: ease.wobble, yoyo: true, repeat: 3 },
      ">"
    )
    .addLabel("cheer", cue.cheer)
    .add(pop(sfx[1], -from.captionTilt), "cheer")
    .add(leave(sfx), cue.sfxOut);

  // Scene 5 — the title slams in and holds to the last frame.
  tl.addLabel("title", cue.title)
    .add(
      impact(stage, lines, q("[data-comic='title']"), null, comic.lines.title, {
        scale: from.titleScale,
        rotation: from.titleTilt,
      }),
      "title"
    )
    .to(dots, { autoAlpha: comic.dots.title, duration: duration.fade, ease: ease.fade }, "title")
    .add(twinkle(stars.slice(3, 5)), `title+=${duration.slam}`);

  // Pad to the clip's length so time() maps 1:1 onto the video.
  return tl.to({}, { duration: 0 }, cue.end);
}
