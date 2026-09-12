<script setup lang="ts">
import { ArrowUpRight } from "lucide-vue-next";
import type { Project } from "../types";
import { projectCategoryLabel } from "../data/projectCategories";
withDefaults(defineProps<{ project: Project; index?: number }>(), { index: 0 });
</script>
<template>
    <article class="folio-card">
        <div class="folio-image">
            <img
                v-if="project.images[0]"
                :src="project.images[0]"
                :alt="project.title"
                loading="lazy"
                decoding="async"
                width="1200"
                height="800"
            />
            <span v-else class="image-placeholder">{{ project.title }}</span>
            <span class="project-open" aria-hidden="true"
                ><ArrowUpRight :size="25"
            /></span>
        </div>
        <div class="folio-meta">
            <h3>{{ project.title }}</h3>
            <span>{{ projectCategoryLabel(project.category) }}</span>
        </div>
        <p class="folio-summary">{{ project.description }}</p>
        <div class="folio-tools">
            <span
                v-for="(tool, i) in project.technologies.slice(0, 3)"
                :key="i"
                >{{ tool }}</span
            >
        </div>
    </article>
</template>
