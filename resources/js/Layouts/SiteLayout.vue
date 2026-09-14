<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, provide } from "vue";
import { Link, usePage } from "@inertiajs/vue3";
import { ArrowUpRight, ArrowDown, Menu, X, Sun, Moon } from "lucide-vue-next";
import { usePortfolioMotion } from "../composables/usePortfolioMotion";
import BirdsTransition from "../Components/BirdsTransition.vue";
const page = usePage();
const root = ref<HTMLElement | null>(null);
const header = ref<HTMLElement | null>(null);
const headerHidden = ref(false);
const menu = ref(false);
const dark = ref(false);
const links = [
    { href: "/", label: "Home" },
    { href: "/work", label: "Work" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];
const { reveal } = usePortfolioMotion(root);
const introComplete = ref(false);
provide("portfolioIntroComplete", introComplete);
function finishIntro() {
    introComplete.value = true;
    reveal();
}
let scrollFrame = 0;
let previousScroll = 0;
let directionDistance = 0;

function showHeader() {
    headerHidden.value = false;
    directionDistance = 0;
}

function updateHeader() {
    scrollFrame = 0;
    // Clamp elastic overscroll so bouncing at either end cannot flip direction.
    const maximum = document.documentElement.scrollHeight - window.innerHeight;
    const scroll = Math.max(0, Math.min(window.scrollY, maximum));
    const delta = scroll - previousScroll;
    previousScroll = scroll;

    if (
        scroll <= (header.value?.offsetHeight ?? 98) ||
        menu.value ||
        header.value?.contains(document.activeElement)
    ) {
        showHeader();
        return;
    }

    if (delta === 0) return;
    directionDistance =
        Math.sign(delta) === Math.sign(directionDistance)
            ? directionDistance + delta
            : delta;
    if (directionDistance >= 12) headerHidden.value = true;
    else if (directionDistance <= -6) headerHidden.value = false;
}

function onScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateHeader);
}

onMounted(() => {
    dark.value = document.documentElement.classList.contains("dark");
    previousScroll = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
});
watch(
    () => page.url,
    () => {
        menu.value = false;
        showHeader();
        previousScroll = window.scrollY;
    },
);
watch(menu, (open) => {
    document.documentElement.classList.toggle("menu-open", open);
    if (open) showHeader();
});
onBeforeUnmount(() => {
    document.documentElement.classList.remove("menu-open");
    window.removeEventListener("scroll", onScroll);
    cancelAnimationFrame(scrollFrame);
});
function toggleTheme() {
    dark.value = !dark.value;
    document.documentElement.classList.toggle("dark", dark.value);
    try {
        localStorage.setItem("portfolio-theme", dark.value ? "dark" : "light");
    } catch {}
}
</script>
<template>
    <div ref="root" class="site-shell">
        <BirdsTransition @complete="finishIntro" />
        <a class="skip-link" href="#main">Skip to content</a>
        <header
            ref="header"
            class="portfolio-header"
            :class="{ 'is-hidden': headerHidden }"
            @focusin="showHeader"
        >
            <div class="shell header-inner">
                <Link href="/" class="wordmark" aria-label="Nakhle Rizk home"
                    ><span class="brand-symbol" aria-hidden="true">nr.</span
                    ><span class="brand-name"
                        >Nakhle Rizk<span
                            >Developer &amp; creative thinker</span
                        ></span
                    ></Link
                >
                <nav class="desktop-nav" aria-label="Main navigation">
                    <Link
                        v-for="link in links"
                        :key="link.href"
                        :href="link.href"
                        :aria-current="
                            (
                                link.href === '/'
                                    ? page.url.split('?')[0] === '/'
                                    : page.url
                                          .split('?')[0]
                                          .startsWith(link.href)
                            )
                                ? 'page'
                                : undefined
                        "
                        >{{ link.label }}</Link
                    >
                </nav>
                <div class="header-actions">
                    <a
                        href="/Nakhle_CV.pdf"
                        download="Nakhle_Rizk_CV.pdf"
                        class="cv-link"
                        >Download CV <ArrowDown :size="14"
                    /></a>
                    <button
                        class="icon-button theme-toggle"
                        @click="toggleTheme"
                        :aria-label="
                            dark
                                ? 'Switch to light theme'
                                : 'Switch to dark theme'
                        "
                    >
                        <Sun v-if="dark" :size="18" /><Moon v-else :size="18" />
                    </button>
                    <button
                        class="icon-button mobile-toggle"
                        @click="menu = !menu"
                        :aria-expanded="menu"
                        aria-controls="mobile-menu"
                        aria-label="Toggle navigation"
                    >
                        <X v-if="menu" :size="22" /><Menu v-else :size="22" />
                    </button>
                </div>
            </div>
            <Transition name="menu">
                <nav
                    v-if="menu"
                    id="mobile-menu"
                    class="mobile-nav shell"
                    aria-label="Mobile navigation"
                    data-lenis-prevent
                    @keydown.esc="menu = false"
                >
                    <Link
                        v-for="link in links"
                        :key="link.href"
                        :href="link.href"
                        :aria-current="
                            (
                                link.href === '/'
                                    ? page.url.split('?')[0] === '/'
                                    : page.url
                                          .split('?')[0]
                                          .startsWith(link.href)
                            )
                                ? 'page'
                                : undefined
                        "
                        >{{ link.label }}<ArrowUpRight :size="28"
                    /></Link>
                    <a href="/Nakhle_CV.pdf" download class="mobile-cv"
                        >Download CV <ArrowDown :size="18"
                    /></a>
                </nav>
            </Transition>
        </header>
        <main id="main"><slot /></main>
        <footer class="portfolio-footer">
            <div class="shell">
                <Link
                    href="/contact"
                    class="footer-cta"
                    aria-label="Let's work together"
                >
                    <span aria-hidden="true"
                        ><span class="block">Let's work</span
                        ><span class="footer-word"
                            ><span>toge</span
                            ><span class="footer-lift"
                                ><span>ther.</span><ArrowUpRight /></span></span
                    ></span>
                </Link>
                <p class="mb-8 text-sm">Open to work &amp; collaborations</p>
                <div class="footer-bottom">
                    <span>© {{ new Date().getFullYear() }} Nakhle Rizk</span>
                    <a href="mailto:nakhler2k2@gmail.com" class="text-link"
                        >Say hello <ArrowUpRight :size="15"
                    /></a>
                    <div class="footer-socials">
                        <a
                            href="https://github.com/NakhleR"
                            target="_blank"
                            rel="noopener noreferrer"
                            >GitHub <ArrowUpRight :size="14" /></a
                        ><a
                            href="https://www.linkedin.com/in/nakhle-rizk-528129256/"
                            target="_blank"
                            rel="noopener noreferrer"
                            >LinkedIn <ArrowUpRight :size="14"
                        /></a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>
