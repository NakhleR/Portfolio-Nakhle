<script setup lang="ts">
import { useCms } from "../composables/useCms";
const cms = useCms();
import SeoHead from "../Components/SeoHead.vue";
import { ref, computed } from "vue";
import { Link } from "@inertiajs/vue3";
import SiteLayout from "../Layouts/SiteLayout.vue";
import ProjectCard from "../Components/ProjectCard.vue";
import type { ProjectCardData } from "../types";
import { projectCategoryLabel } from "../data/projectCategories";
const props = defineProps<{ projects: ProjectCardData[] }>();
const category = ref("All");
const categories = computed(() => [
    "All",
    ...new Set(props.projects.map((p) => projectCategoryLabel(p.category))),
]);
const filtered = computed(() =>
    props.projects.filter(
        (p) =>
            category.value === "All" ||
            projectCategoryLabel(p.category) === category.value,
    ),
);
</script>
<template>
    <div>
        <SeoHead /><SiteLayout>
            <section class="inner-hero shell">
                <div class="inner-hero-title">
                    <h1>
                        <span
                            v-for="(line, i) in cms.work.hero.split('\n')"
                            :key="i"
                            class="line-mask"
                            ><span data-intro>{{ line }}</span></span
                        >
                    </h1>
                    <p data-intro-fade>{{ cms.work.intro }}</p>
                </div>
                <div class="work-filter-row">
                    <span class="archive-total"
                        >The project archive
                        <span class="archive-count"
                            >({{ projects.length }})</span
                        ></span
                    >
                    <div class="filter-list" aria-label="Project categories">
                        <button
                            v-for="item in categories"
                            :key="item"
                            :aria-pressed="category === item"
                            @click="category = item"
                        >
                            {{ item }}
                        </button>
                    </div>
                </div>
            </section>
            <section class="shell archive-section">
                <div class="archive-grid">
                    <Link
                        v-for="(project, index) in filtered"
                        :key="project.id"
                        class="project-link"
                        :aria-label="'View ' + project.title"
                        :href="`/work/${project.id}`"
                    >
                        <ProjectCard :project="project" :index="index" />
                    </Link>
                </div>
                <p v-if="!filtered.length" class="empty-state" role="status">
                    No projects in this category yet.
                </p>
            </section>
        </SiteLayout>
    </div>
</template>
