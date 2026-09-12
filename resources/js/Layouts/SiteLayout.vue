<script setup lang="ts">
import { ref, watch } from "vue";
import { Link, usePage } from "@inertiajs/vue3";
import { Download, Menu, X, Moon, Sun, ArrowUpRight } from "lucide-vue-next";
import BirdsTransition from "../Components/BirdsTransition.vue";
const page = usePage();
const menu = ref(false);
const dark = ref(document.documentElement.classList.contains("dark"));
const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/work", label: "Work" },
    { href: "/contact", label: "Contact" },
];
watch(
    () => page.url,
    () => {
        menu.value = false;
    },
);
function toggleTheme() {
    dark.value = !dark.value;
    document.documentElement.classList.toggle("dark", dark.value);
    localStorage.setItem("portfolio-theme", dark.value ? "dark" : "light");
}
</script>
<template>
    <div>
        <BirdsTransition />
        <a class="skip-link" href="#main">Skip to content</a>
        <header class="site-header">
            <div class="container flex items-center justify-between gap-4">
                <Link
                    href="/"
                    class="font-heading text-xl sm:text-2xl font-semibold"
                    >Nakhle Rizk<span class="text-muted-foreground"
                        >.</span
                    ></Link
                >
                <nav
                    aria-label="Main navigation"
                    class="hidden md:flex items-center gap-8"
                >
                    <Link
                        v-for="link in links"
                        :key="link.href"
                        :href="link.href"
                        :aria-current="
                            page.url.split('?')[0] === link.href
                                ? 'page'
                                : undefined
                        "
                        class="nav-link"
                        >{{ link.label }}</Link
                    >
                </nav>
                <div class="flex items-center gap-3">
                    <a
                        href="/Nakhle_CV.pdf"
                        download="Nakhle_Rizk_CV.pdf"
                        class="button secondary hidden sm:inline-flex text-sm"
                        ><Download :size="16" />Download CV</a
                    >
                    <button
                        class="icon-button"
                        @click="toggleTheme"
                        :aria-label="
                            dark
                                ? 'Switch to light theme'
                                : 'Switch to dark theme'
                        "
                    >
                        <Sun v-if="dark" :size="19" /><Moon v-else :size="19" />
                    </button>
                    <button
                        class="icon-button md:hidden"
                        @click="menu = !menu"
                        :aria-expanded="menu"
                        aria-controls="mobile-menu"
                        aria-label="Toggle navigation"
                    >
                        <X v-if="menu" :size="22" /><Menu v-else :size="22" />
                    </button>
                </div>
            </div>
            <nav
                v-if="menu"
                id="mobile-menu"
                aria-label="Mobile navigation"
                class="container flex flex-col gap-5 py-6 md:hidden"
            >
                <Link
                    v-for="link in links"
                    :key="link.href"
                    :href="link.href"
                    >{{ link.label }}</Link
                ><a href="/Nakhle_CV.pdf" download>Download CV</a>
            </nav>
        </header>
        <main id="main" class="pt-24"><slot /></main>
        <footer class="container">
            <div class="border-t border-border/50 py-20 md:py-32">
                <p class="eyebrow mb-6">Have a project in mind?</p>
                <Link href="/contact" class="inline-flex items-end gap-8 group"
                    ><span
                        class="font-heading font-semibold tracking-tight leading-[.95] text-[clamp(3rem,10vw,9rem)]"
                        >Let's work<br />together.</span
                    ><ArrowUpRight
                        class="w-10 h-10 md:w-20 md:h-20 mb-2 transition-transform group-hover:rotate-45"
                /></Link>
            </div>
            <div
                class="border-t border-border/50 py-7 flex flex-wrap items-center justify-between gap-6 text-sm text-muted-foreground"
            >
                <span>© {{ new Date().getFullYear() }} Nakhle Rizk</span>
                <div class="flex gap-6">
                    <Link href="/work">Work</Link
                    ><Link href="/about">About</Link
                    ><Link href="/contact">Contact</Link>
                </div>
                <div class="flex gap-6">
                    <a
                        href="https://github.com/NakhleR"
                        target="_blank"
                        rel="noopener noreferrer"
                        >GitHub ↗</a
                    ><a
                        href="https://www.linkedin.com/in/nakhle-rizk-528129256/"
                        target="_blank"
                        rel="noopener noreferrer"
                        >LinkedIn ↗</a
                    >
                </div>
            </div>
        </footer>
    </div>
</template>
