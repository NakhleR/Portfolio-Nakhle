<script setup lang="ts">
import { ArrowUpRight } from "lucide-vue-next";
import type { ProjectCardData } from "../types";
import { projectCategoryLabel } from "../data/projectCategories";
import ProjectImage from "./ProjectImage.vue";
withDefaults(defineProps<{ project: ProjectCardData; index?: number }>(), {
    index: 0,
});
</script>
<template>
    <article class="folio-card">
        <div class="folio-image">
            <ProjectImage
                v-if="project.images[0]"
                :project="project"
                :sizes="
                    index % 3 === 0
                        ? '(min-width: 1680px) 1544px, 92vw'
                        : '(max-width: 767px) 92vw, (min-width: 1680px) 750px, 44vw'
                "
                :alt="project.title"
                :loading="index === 0 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : 'auto'"
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
