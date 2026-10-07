"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The ONLY place in this codebase where a GSAP plugin is registered.
 * Import gsap and every plugin from here — never from "gsap" directly —
 * so registration can never be duplicated or missed.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, Physics2DPlugin);

export { gsap, ScrollTrigger, Physics2DPlugin };
