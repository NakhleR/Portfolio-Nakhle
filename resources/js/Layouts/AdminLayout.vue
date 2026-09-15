<script setup lang="ts">
import { ref } from "vue";
import { Link, usePage } from "@inertiajs/vue3";
import {
    LayoutDashboard,
    FolderOpen,
    Clock3,
    FileText,
    Images,
    Inbox,
    ChartNoAxesCombined,
    Settings2,
    LogOut,
    ArrowUpRight,
    Menu,
    X,
    ShieldCheck,
    ChevronRight,
} from "lucide-vue-next";
import SeoHead from "../Components/SeoHead.vue";
import "../../css/cms.css";
defineProps<{ title: string; description?: string }>();
const page = usePage<{
    auth: { user: { name: string; email: string } };
    flash: { success?: string };
}>();
const menu = ref(false);
const links = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/dashboard?tab=projects", icon: FolderOpen },
    { label: "Experience", href: "/dashboard?tab=timeline", icon: Clock3 },
    { label: "Pages & content", href: "/dashboard/pages/home", icon: FileText },
    { label: "Media library", href: "/dashboard/media", icon: Images },
    { label: "Enquiries", href: "/dashboard/inbox", icon: Inbox },
    {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: ChartNoAxesCombined,
    },
    { label: "Site settings", href: "/dashboard/pages/site", icon: Settings2 },
    {
        label: "Account & security",
        href: "/dashboard/account",
        icon: ShieldCheck,
    },
];
function active(href: string) {
    if (href === "/dashboard/pages/home")
        return (
            page.url.startsWith("/dashboard/pages/") &&
            !page.url.startsWith("/dashboard/pages/site")
        );
    return href.includes("?") || href === "/dashboard"
        ? page.url === href
        : page.url.startsWith(href);
}
</script>
<template>
    <div class="cms-app">
        <SeoHead /><a href="#cms-main" class="cms-skip">Skip to content</a>
        <header class="cms-mobile">
            <strong>nr. / Studio CMS</strong
            ><button
                @click="menu = !menu"
                :aria-expanded="menu"
                aria-controls="cms-sidebar"
                aria-label="Toggle CMS navigation"
            >
                <X v-if="menu" :size="22" /><Menu v-else :size="22" />
            </button>
        </header>
        <aside
            id="cms-sidebar"
            class="cms-sidebar"
            :class="{ 'is-open': menu }"
        >
            <Link href="/dashboard" class="cms-brand"
                ><strong>nr.</strong
                ><span>Studio CMS<small>Portfolio workspace</small></span></Link
            >
            <nav aria-label="CMS navigation">
                <Link
                    v-for="link in links"
                    :key="link.href"
                    :href="link.href"
                    :class="{
                        'is-active': active(link.href),
                    }"
                    :aria-current="active(link.href) ? 'page' : undefined"
                    @click="menu = false"
                    ><component :is="link.icon" :size="18" />{{
                        link.label
                    }}</Link
                >
            </nav>
            <div class="cms-sidebar-bottom">
                <Link href="/" target="_blank" rel="noopener"
                    >View website<ArrowUpRight :size="16"
                /></Link>
                <div class="cms-account-summary">
                    <span class="cms-avatar" aria-hidden="true">{{
                        page.props.auth.user.name.slice(0, 1).toUpperCase()
                    }}</span>
                    <div>
                        <strong>{{ page.props.auth.user.name }}</strong
                        ><small>{{ page.props.auth.user.email }}</small>
                    </div>
                </div>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    class="cms-signout"
                    ><LogOut :size="16" />Sign out</Link
                >
            </div>
        </aside>
        <div class="cms-topbar">
            <div class="cms-breadcrumb">
                <Link href="/dashboard">Studio</Link
                ><ChevronRight :size="14" /><span>{{ title }}</span>
            </div>
            <Link
                href="/"
                target="_blank"
                rel="noopener"
                class="cms-portfolio-link"
                >Open portfolio<ArrowUpRight :size="16"
            /></Link>
        </div>
        <main id="cms-main" class="cms-main">
            <header class="cms-page-heading">
                <div>
                    <h1>{{ title }}</h1>
                    <p v-if="description">{{ description }}</p>
                </div>
                <slot name="actions" />
            </header>
            <p v-if="page.props.flash.success" role="status" class="cms-notice">
                {{ page.props.flash.success }}
            </p>
            <slot />
        </main>
    </div>
</template>
