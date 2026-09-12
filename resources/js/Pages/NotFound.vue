<script setup lang="ts">
import { Head, Link } from "@inertiajs/vue3";
import SiteLayout from "../Layouts/SiteLayout.vue";
</script>
<template>
    <div>
        <Head title="Page not found" /><SiteLayout
            ><section class="page-heading min-h-[55vh]">
                <p class="eyebrow">404</p>
                <h1>Page not found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <Link href="/" class="button mt-8">Back to Home</Link>
            </section></SiteLayout
        >
    </div>
</template>
