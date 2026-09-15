<script setup lang="ts">
import { Link } from "@inertiajs/vue3";
defineProps<{
    links: { url: string | null; label: string; active: boolean }[];
}>();
function label(value: string) {
    return value.includes("Previous")
        ? "Previous"
        : value.includes("Next")
          ? "Next"
          : value.replace(/<[^>]*>/g, "");
}
</script>
<template>
    <nav v-if="links.length > 3" class="cms-pagination" aria-label="Pagination">
        <template v-for="(link, i) in links" :key="i"
            ><Link
                v-if="link.url"
                :href="link.url"
                :aria-current="link.active ? 'page' : undefined"
                preserve-scroll
                >{{ label(link.label) }}</Link
            ><span v-else class="cms-muted">{{
                label(link.label)
            }}</span></template
        >
    </nav>
</template>
