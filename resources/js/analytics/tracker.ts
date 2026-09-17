type EventData = {
    id: string;
    session_id: string;
    view_id: string;
    path: string;
    type: string;
    device: string;
    section?: string;
    target?: string;
    value?: number;
    x?: number;
    y?: number;
};
const sessionKey = "portfolio-analytics-session";
export function startAnalytics(
    root: HTMLElement,
): (flushPending?: boolean) => void {
    const navigatorPrivacy = navigator as Navigator & {
        globalPrivacyControl?: boolean;
    };
    if (navigatorPrivacy.globalPrivacyControl || navigator.doNotTrack === "1")
        return () => {};
    const path = location.pathname;
    if (
        !/^\/(?:fr(?:\/|$))?(?:about|work(?:\/[a-zA-Z0-9-]{1,80})?|contact|privacy|cookies|terms|legal)?$/.test(
            path,
        )
    )
        return () => {};
    let session = crypto.randomUUID();
    try {
        const saved = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
        if (saved && Date.now() - saved.time < 30 * 60 * 1000)
            session = saved.id;
        sessionStorage.setItem(
            sessionKey,
            JSON.stringify({ id: session, time: Date.now() }),
        );
    } catch {}
    let view = crypto.randomUUID();
    const device =
        innerWidth < 768 ? "mobile" : innerWidth < 1100 ? "tablet" : "desktop";
    let queue: EventData[] = [];
    let lastActivity = performance.now();
    let lastTick = lastActivity;
    let ticks = 0;
    let stopped = false;
    let sending = false;
    const read = new Map<string, number>();
    const milestones = new Set<number>();
    const sectionRules: [string, string][] = [
        [".portfolio-header", "navigation"],
        [".portfolio-footer", "footer"],
        [".studio-showcase, .inner-hero, .contact-hero", "hero"],
        [".studio-statement", "about"],
        [".approach-section", "approach"],
        [".archive-section", "projects"],
        [".case-cover", "project-cover"],
        ["#project-gallery", "project-gallery"],
        ["#project-overview", "project-overview"],
        [".case-technologies", "technology"],
        [".biography", "biography"],
        [".journey-section", "journey"],
        [".skills-section", "skills"],
        [".contact-layout", "contact"],
        [".legal-document", "legal"],
    ];
    function section(element: Element | null): string {
        return (
            sectionRules.find(([selector]) =>
                element?.closest(selector),
            )?.[1] || "content"
        );
    }
    function add(type: string, extra: Partial<EventData> = {}) {
        if (stopped || queue.length >= 100) return;
        queue.push({
            id: crypto.randomUUID(),
            session_id: session,
            view_id: view,
            path,
            type,
            device,
            ...extra,
        });
    }
    function drainReading() {
        for (const [key, seconds] of read) {
            const whole = Math.floor(seconds);
            if (whole) {
                add("reading", { section: key, value: Math.min(15, whole) });
                read.set(key, seconds - whole);
            }
        }
    }
    async function flush() {
        if (sending || stopped || !queue.length) return;
        sending = true;
        const batch = queue.splice(0, 20);
        try {
            await fetch("/analytics/events", {
                method: "POST",
                credentials: "same-origin",
                keepalive: true,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        document.querySelector<HTMLMetaElement>(
                            'meta[name="csrf-token"]',
                        )?.content || "",
                },
                body: JSON.stringify({ events: batch }),
            });
        } catch {
            /* Analytics must never interrupt navigation or retry indefinitely. */
        } finally {
            sending = false;
        }
    }
    function activity() {
        if (performance.now() - lastActivity > 30 * 60 * 1000) {
            session = crypto.randomUUID();
            view = crypto.randomUUID();
            milestones.clear();
            add("page_view");
        }
        lastActivity = performance.now();
    }
    function click(event: MouseEvent) {
        activity();
        const path = event
            .composedPath()
            .filter((node): node is Element => node instanceof Element);
        if (
            path.some((node) =>
                node.matches(
                    "form, input, textarea, select, [contenteditable], [data-analytics-ignore]",
                ),
            )
        )
            return;
        // Vue may replace an icon before the click bubbles up. The original
        // event path still identifies its button without reading any text.
        const control = path.find((node) => node.matches("a, button"));
        let target =
            control?.tagName === "A" ? "link" : control ? "button" : "surface";
        if (
            control?.matches(".case-image-link, .portrait-frame") ||
            control?.closest(".image-gallery")
        )
            target = "gallery";
        else if (control?.closest(".desktop-nav, .mobile-nav"))
            target = "navigation";
        else if (control?.closest(".showcase-selector")) target = "discipline";
        else if (control?.matches(".theme-toggle")) target = "theme";
        else if (control?.matches(".mobile-toggle")) target = "menu";
        else if (control?.matches(".object-playback")) target = "animation";
        else if (control?.closest(".filter-list")) target = "filter";
        if (control instanceof HTMLAnchorElement && target === "link") {
            const href = control.getAttribute("href") || "";
            if (control.hasAttribute("download")) target = "cv-download";
            else if (href.startsWith("mailto:")) target = "email";
            else if (href.startsWith("tel:")) target = "telephone";
            else if (href.startsWith("/work/")) target = "project";
            else if (href.startsWith("#")) target = "section-link";
            else if (control.origin !== location.origin)
                target = "external-link";
        }
        const clicked = control || path[0];
        if (!clicked) return;
        const clamp = (value: number) =>
            Math.max(0, Math.min(100, Math.round(value)));
        add("click", {
            section: section(clicked),
            target,
            x: event.detail
                ? clamp((event.clientX / innerWidth) * 100)
                : undefined,
            y: event.detail
                ? clamp(
                      ((scrollY + event.clientY) /
                          document.documentElement.scrollHeight) *
                          100,
                  )
                : undefined,
        });
    }
    function tick() {
        const now = performance.now();
        const seconds = Math.min(1.5, (now - lastTick) / 1000);
        lastTick = now;
        if (
            document.visibilityState !== "visible" ||
            !document.hasFocus() ||
            now - lastActivity > 30000 ||
            document.querySelector(".bird-transition, dialog[open]")
        )
            return;
        const at = document.elementFromPoint(
            innerWidth * 0.5,
            innerHeight * 0.45,
        );
        const key = section(at);
        read.set(key, (read.get(key) || 0) + seconds);
        const depth = Math.min(
            100,
            Math.round(
                ((scrollY + innerHeight) /
                    document.documentElement.scrollHeight) *
                    100,
            ),
        );
        for (const milestone of [25, 50, 75, 100])
            if (depth >= milestone && !milestones.has(milestone)) {
                milestones.add(milestone);
                add("scroll", { value: milestone });
            }
        if (++ticks >= 10) {
            ticks = 0;
            drainReading();
            void flush();
            try {
                sessionStorage.setItem(
                    sessionKey,
                    JSON.stringify({ id: session, time: Date.now() }),
                );
            } catch {}
        }
    }
    function leave() {
        drainReading();
        void flush();
    }
    function visibility() {
        if (document.hidden) leave();
        else lastTick = performance.now();
    }
    add("page_view");
    void flush();
    root.addEventListener("click", click);
    for (const event of ["pointerdown", "keydown", "scroll", "pointermove"])
        window.addEventListener(event, activity, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", leave);
    const timer = setInterval(tick, 1000);
    const flushTimer = setInterval(() => {
        drainReading();
        void flush();
    }, 10000);
    return (flushPending = false) => {
        if (flushPending) {
            drainReading();
            void flush();
        }
        // Withdrawal drops unsent events immediately.
        stopped = true;
        queue = [];
        read.clear();
        clearInterval(timer);
        clearInterval(flushTimer);
        root.removeEventListener("click", click);
        for (const event of ["pointerdown", "keydown", "scroll", "pointermove"])
            window.removeEventListener(event, activity);
        document.removeEventListener("visibilitychange", visibility);
        window.removeEventListener("pagehide", leave);
    };
}
