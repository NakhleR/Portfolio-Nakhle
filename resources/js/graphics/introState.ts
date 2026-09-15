// Keep the entry animation once per tab session, including full-page reloads.
let played = false;
const storageKey = "portfolio-entry-seen";

export function claimBirdsIntro(): boolean {
    if (played) return false;
    played = true;
    try {
        if (sessionStorage.getItem(storageKey)) return false;
        sessionStorage.setItem(storageKey, "1");
    } catch {
        // Inertia navigation still uses the in-memory guard if storage is blocked.
    }
    return !matchMedia("(prefers-reduced-motion: reduce)").matches;
}
