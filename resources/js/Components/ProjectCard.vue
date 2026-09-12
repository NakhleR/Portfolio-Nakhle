<script setup lang="ts">
import type { Project } from "../types";
defineProps<{ project: Project }>();
</script>
<template>
    <article class="project-card">
        <div class="aspect-video bg-secondary overflow-hidden">
            <img
                v-if="project.images[0]"
                :src="project.images[0]"
                :alt="project.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
            /><span
                v-else
                class="h-full flex items-center justify-center text-muted-foreground"
                >Project preview</span
            >
        </div>
        <div class="p-5">
            <p class="eyebrow mb-2">{{ project.category }}</p>
            <h3 class="text-xl font-semibold">{{ project.title }}</h3>
            <p class="text-sm text-muted-foreground mt-3 line-clamp-2">
                {{ project.description }}
            </p>
        </div>
    </article>
</template>
