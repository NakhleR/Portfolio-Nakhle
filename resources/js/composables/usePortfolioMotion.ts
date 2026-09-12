import { onMounted, onBeforeUnmount, type Ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

export function usePortfolioMotion(root: Ref<HTMLElement | null>) {
    let cleanup = () => {};
    let introTimeline: gsap.core.Timeline | undefined;
    let revealed = false;
    function reveal() {
        revealed = true;
        introTimeline?.play();
    }
    onMounted(() => {
        if (!root.value) return;
        const element = root.value;
        let alive = true;
        const media = gsap.matchMedia();
        media.add(
            {
                motion: "(prefers-reduced-motion: no-preference)",
                desktop: "(min-width: 768px)",
                fine: "(pointer: fine)",
            },
            (context) => {
                const { motion, desktop, fine } = context.conditions!;
                if (!motion) return;
                const lenis = fine
                    ? new Lenis({
                          lerp: 0.1,
                          smoothWheel: true,
                          syncTouch: false,
                          anchors: { offset: -96 },
                          prevent: (node) =>
                              Boolean(
                                  node.closest("[data-lenis-prevent]") ||
                                  document.querySelector("dialog[open]") ||
                                  document.documentElement.classList.contains(
                                      "menu-open",
                                  ),
                              ),
                      })
                    : undefined;
                const tick = (time: number) => lenis?.raf(time * 1000);
                if (lenis) {
                    lenis.on("scroll", ScrollTrigger.update);
                    gsap.ticker.add(tick);
                }
                const intro = element.querySelectorAll("[data-intro]");
                introTimeline = gsap.timeline({ paused: !revealed });
                introTimeline.from(intro, {
                    yPercent: 105,
                    duration: 1.05,
                    stagger: 0.09,
                    ease: "expo.out",
                    clearProps: "transform",
                });
                introTimeline.from(
                    element.querySelectorAll("[data-intro-fade]"),
                    {
                        y: 16,
                        opacity: 0,
                        duration: 0.7,
                        ease: "power3.out",
                        clearProps: "transform,opacity",
                    },
                    0.18,
                );
                element
                    .querySelectorAll<HTMLElement>("[data-reveal]")
                    .forEach((target) => {
                        gsap.from(target, {
                            y: 32,
                            duration: 0.85,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: target,
                                start: "top 94%",
                                once: true,
                            },
                            clearProps: "transform",
                        });
                    });
                if (desktop)
                    element
                        .querySelectorAll<HTMLElement>("[data-drift]")
                        .forEach((target) => {
                            gsap.fromTo(
                                target,
                                { yPercent: -4 },
                                {
                                    yPercent: 4,
                                    ease: "none",
                                    scrollTrigger: {
                                        trigger: target.parentElement,
                                        start: "top bottom",
                                        end: "bottom top",
                                        scrub: true,
                                    },
                                },
                            );
                        });
                const footer = element.querySelector("footer");
                const lift = element.querySelector(".footer-lift");
                if (footer && lift)
                    gsap.fromTo(
                        lift,
                        { y: 0 },
                        {
                            y: desktop ? -48 : -16,
                            ease: "none",
                            scrollTrigger: {
                                trigger: footer,
                                start: "top 65%",
                                end: "bottom bottom",
                                scrub: 0.2,
                                invalidateOnRefresh: true,
                            },
                        },
                    );
                return () => {
                    gsap.ticker.remove(tick);
                    lenis?.destroy();
                };
            },
            element,
        );
        let refreshFrame = 0;
        const refresh = () => ScrollTrigger.refresh();
        const resize = new ResizeObserver(() => {
            cancelAnimationFrame(refreshFrame);
            refreshFrame = requestAnimationFrame(refresh);
        });
        resize.observe(element);
        document.fonts.ready.then(() => {
            if (alive) refresh();
        });
        window.addEventListener("load", refresh, { once: true });
        cleanup = () => {
            alive = false;
            cancelAnimationFrame(refreshFrame);
            resize.disconnect();
            media.revert();
            window.removeEventListener("load", refresh);
        };
    });
    onBeforeUnmount(() => cleanup());
    return { reveal };
}
