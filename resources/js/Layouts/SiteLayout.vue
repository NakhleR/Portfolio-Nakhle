<script setup lang="ts">
import { useLocale } from "../composables/useLocale";
const { t, locale, localPath, switchPath } = useLocale();
import { useCms } from "../composables/useCms";
const cms = useCms();
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { Link, usePage } from "@inertiajs/vue3";
import { ArrowUpRight, ArrowDown, Menu, X, Sun, Moon } from "lucide-vue-next";
import { usePortfolioMotion } from "../composables/usePortfolioMotion";
import BirdsTransition from "../Components/BirdsTransition.vue";
import { provideEntryLoader } from "../composables/useEntryLoader";
import { useAnalytics } from "../composables/useAnalytics";
import CookiePreferences from "../Components/CookiePreferences.vue";
const page = usePage();
const root = ref<HTMLElement | null>(null);
const header = ref<HTMLElement | null>(null);
const headerHidden = ref(false);
const menu = ref(false);
const dark = ref(false);
const links = computed(() => [
    { href: "/", label: "Home" },
    { href: "/work", label: "Work" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
].map(link => ({ href: localPath(link.href), label: t(link.label) })));
const { reveal } = usePortfolioMotion(root);
const { entry, ready } = provideEntryLoader(root);
useAnalytics(root);
function openCookiePreferences() {
    window.dispatchEvent(new Event("open-cookie-preferences"));
}
function finishIntro(isEntry: boolean) {
    entry.value = false;
    reveal(isEntry);
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
        <BirdsTransition
            :ready="ready"
            @start="entry = true"
            @complete="finishIntro"
        />
        <a class="skip-link" href="#main"> {{ t("Skip to content") }} </a>
        <header
            ref="header"
            class="portfolio-header"
            :class="{ 'is-hidden': headerHidden }"
            @focusin="showHeader"
        >
            <div class="shell header-inner">
                <Link
                    :href="localPath('/')"
                    class="wordmark"
                    :aria-label="`${cms.site.name} — ${t('Home')}`"
                    ><span class="brand-symbol" aria-hidden="true">nr.</span
                    ><span class="brand-name"
                        >{{ cms.site.name
                        }}<span>{{ cms.site.tagline }}</span></span
                    ></Link
                >
                <nav class="desktop-nav" :aria-label="t('Main navigation')">
                    <Link
                        v-for="link in links"
                        :key="link.href"
                        :href="link.href"
                        :aria-current="
                            (
                                link.href === localPath('/')
                                    ? page.url.split('?')[0] === localPath('/')
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
                    <Link :href="switchPath" class="text-sm px-2 py-3" :hreflang="locale === 'fr' ? 'en' : 'fr'" :lang="locale === 'fr' ? 'en' : 'fr'" :aria-label="locale === 'fr' ? 'Switch to English' : 'Passer en français'">{{ locale === 'fr' ? 'EN' : 'FR' }}</Link>
                    <a
                        :href="cms.assets.cv"
                        download="Nakhle_Rizk_CV.pdf"
                        class="cv-link"
                        > {{ t("Download CV") }} <ArrowDown :size="14"
                    /></a>
                    <button
                        class="icon-button theme-toggle"
                        @click="toggleTheme"
                        :aria-label="
                            dark
                                ? t('Switch to light theme')
                                : t('Switch to dark theme')
                        "
                    >
                        <Sun v-if="dark" :size="18" /><Moon v-else :size="18" />
                    </button>
                    <button
                        class="icon-button mobile-toggle"
                        @click="menu = !menu"
                        :aria-expanded="menu"
                        aria-controls="mobile-menu"
                        :aria-label="t('Toggle navigation')"
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
                    :aria-label="t('Mobile navigation')"
                    data-lenis-prevent
                    @keydown.esc="menu = false"
                >
                    <Link
                        v-for="link in links"
                        :key="link.href"
                        :href="link.href"
                        :aria-current="
                            (
                                link.href === localPath('/')
                                    ? page.url.split('?')[0] === localPath('/')
                                    : page.url
                                          .split('?')[0]
                                          .startsWith(link.href)
                            )
                                ? 'page'
                                : undefined
                        "
                        >{{ link.label }}<ArrowUpRight :size="28"
                    /></Link>
                    <a :href="cms.assets.cv" download class="mobile-cv"
                        > {{ t("Download CV") }} <ArrowDown :size="18"
                    /></a>
                </nav>
            </Transition>
        </header>
        <main id="main">
            <div v-if="page.props.cmsPreview" class="cms-preview-bar"> {{ t("Draft preview · Only administrators can see these changes.") }} <Link href="/dashboard"> {{ t("Return to CMS") }} </Link>
            </div>
            <slot />
        </main>
        <footer class="portfolio-footer">
            <div class="shell">
                <Link
                    :href="localPath('/contact')"
                    class="footer-cta"
                    :aria-label="t('Let\'s take it further.')"
                >
                    <span aria-hidden="true">
                        <span class="block"> {{ t("Let's take it") }} </span>
                        <span class="footer-word">
                            <span class="footer-stairs"
                                ><span
                                    v-for="(letter, index) in t('further.').split('')"
                                    :key="index"
                                    class="footer-step"
                                    >{{ letter }}</span
                                ></span
                            >
                            <ArrowUpRight class="footer-cta-arrow" />
                        </span>
                    </span>
                </Link>
                <p class="mb-8 text-sm">{{ cms.site.availability }}</p>
                <div class="footer-bottom">
                    <span
                        >© {{ new Date().getFullYear() }}
                        {{ cms.site.name }}</span
                    >
                    <a :href="`mailto:${cms.site.email}`" class="text-link"
                        > {{ t("Say hello") }} <ArrowUpRight :size="15"
                    /></a>
                    <div class="footer-socials">
                        <a
                            :href="cms.site.github"
                            target="_blank"
                            rel="noopener noreferrer"
                            >GitHub <ArrowUpRight :size="14" /></a
                        ><a
                            :href="cms.site.linkedin"
                            target="_blank"
                            rel="noopener noreferrer"
                            >LinkedIn <ArrowUpRight :size="14"
                        /></a>
                    </div>
                </div>
                <nav
                    class="footer-legal"
                    :aria-label="t('Legal and privacy')"
                    data-analytics-ignore
                >
                    <Link :href="localPath('/privacy')"> {{ t("Privacy") }} </Link
                    ><Link :href="localPath('/cookies')"> {{ t("Cookies") }} </Link
                    ><Link :href="localPath('/terms')"> {{ t("Terms") }} </Link
                    ><Link :href="localPath('/legal')"> {{ t("Legal & copyright") }} </Link>
                    <button type="button" @click="openCookiePreferences"> {{ t("Cookie preferences") }} </button>
                </nav>
            </div>
        </footer>
        <CookiePreferences :loading="entry" />
    </div>
</template>
