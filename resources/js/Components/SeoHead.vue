<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { Head, usePage } from "@inertiajs/vue3";

interface Seo {
    locale: string;
    alternates: Record<string, string>;
    title: string;
    description: string;
    canonical: string;
    image: string;
    imageAlt: string;
    robots: string;
    schema: string | null;
}
const page = usePage<{ seo: Seo }>();
const seo = computed(() => page.props.seo);
watchEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = seo.value.locale.startsWith("fr") ? "fr" : "en";
});
</script>

<template>
    <Head :title="seo.title">
        <meta
            head-key="description"
            name="description"
            :content="seo.description"
        />
        <meta head-key="robots" name="robots" :content="seo.robots" />
        <link head-key="canonical" rel="canonical" :href="seo.canonical" />
        <link v-for="(href, language) in seo.alternates" :key="language" :head-key="`alternate-${language}`" rel="alternate" :hreflang="language" :href="href" />
        <meta head-key="og:locale" property="og:locale" :content="seo.locale" />
        <meta head-key="og:type" property="og:type" content="website" />
        <meta
            head-key="og:site_name"
            property="og:site_name"
            content="Nakhle Rizk"
        />
        <meta head-key="og:title" property="og:title" :content="seo.title" />
        <meta
            head-key="og:description"
            property="og:description"
            :content="seo.description"
        />
        <meta head-key="og:url" property="og:url" :content="seo.canonical" />
        <meta head-key="og:image" property="og:image" :content="seo.image" />
        <meta
            head-key="og:image:alt"
            property="og:image:alt"
            :content="seo.imageAlt"
        />
        <meta
            head-key="twitter:card"
            name="twitter:card"
            content="summary_large_image"
        />
        <meta
            head-key="twitter:title"
            name="twitter:title"
            :content="seo.title"
        />
        <meta
            head-key="twitter:description"
            name="twitter:description"
            :content="seo.description"
        />
        <meta
            head-key="twitter:image"
            name="twitter:image"
            :content="seo.image"
        />
        <meta
            head-key="twitter:image:alt"
            name="twitter:image:alt"
            :content="seo.imageAlt"
        />
        <component
            :is="'script'"
            v-if="seo.schema"
            head-key="structured-data"
            type="application/ld+json"
            >{{ seo.schema }}</component
        >
    </Head>
</template>
