<script setup lang="ts">
import { useLocale } from "../composables/useLocale";
const { t } = useLocale();
import { ArrowUpRight } from "lucide-vue-next";
import { ref, watch } from "vue";
import type { ProjectCardData } from "../types";
import { projectCategoryLabel } from "../data/projectCategories";
import ProjectImage from "./ProjectImage.vue";
const props = withDefaults(defineProps<{ project: ProjectCardData; index?: number }>(), {
    index: 0,
});
const portrait = ref(false);
function imageLoaded(event: Event) {
    const image = event.target as HTMLImageElement;
    portrait.value = image.naturalHeight > image.naturalWidth;
}
watch(() => props.project.images[0], () => { portrait.value = false; });
</script>
<template>
    <article class="folio-card">
        <div class="folio-image" :class="{ portrait }">
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
                @load="imageLoaded"
            />
            <span v-else class="image-placeholder">{{ project.title }}</span>
            <span class="project-open" aria-hidden="true"
                ><ArrowUpRight :size="25"
            /></span>
        </div>
        <div class="folio-meta">
            <h3>{{ project.title }}</h3>
            <span>{{ t(projectCategoryLabel(project.category)) }}</span>
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
