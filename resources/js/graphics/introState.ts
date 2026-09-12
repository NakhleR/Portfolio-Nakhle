// Internal Inertia visits share this module; a full reload starts a fresh intro.
let played = false;

export function claimBirdsIntro(): boolean {
    if (played) return false;
    played = true;
    return !matchMedia("(prefers-reduced-motion: reduce)").matches;
}
