<script setup lang="ts">
import { computed } from "vue";
import type { Project } from "../types";

const props = withDefaults(
    defineProps<{
        project: Pick<Project, "images" | "imageVariants">;
        index?: number;
        sizes: string;
    }>(),
    { index: 0 },
);
const variant = computed(() => props.project.imageVariants?.[props.index]);
</script>

<template>
    <img
        :src="variant?.src || project.images[index]"
        :srcset="variant?.srcset || undefined"
        :sizes="sizes"
        :width="variant?.width || 1200"
        :height="variant?.height || 900"
    />
</template>
