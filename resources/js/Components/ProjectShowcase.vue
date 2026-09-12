<script setup lang="ts">
import { computed, ref } from "vue";
import { Link } from "@inertiajs/vue3";
import { ArrowUpRight, ArrowRight } from "lucide-vue-next";
import { projectCategoryLabel } from "../data/projectCategories";
import type { Project } from "../types";

const props = defineProps<{ projects: Project[] }>();
const selected = ref(0);
const project = computed(
    () => props.projects[selected.value] ?? props.projects[0],
);
</script>

<template>
    <section class="studio-showcase shell" aria-label="Selected projects">
        <div class="showcase-intro">
            <h1>
                <span class="line-mask"
                    ><span data-intro>Built to be</span></span
                ><span class="line-mask"
                    ><span data-intro>explored.</span></span
                >
            </h1>
            <p class="showcase-description">
                I'm Nakhle. I build digital experiences at the intersection of
                software engineering and artificial intelligence.
            </p>
            <div
                class="showcase-selector"
                aria-label="Choose a project to preview"
            >
                <button
                    v-for="(item, index) in projects"
                    :key="item.id"
                    :aria-pressed="selected === index"
                    aria-controls="project-preview"
                    @click="selected = index"
                >
                    <span class="showcase-option-copy">
                        <span>{{ projectCategoryLabel(item.category) }}</span>
                        <span class="showcase-option-title">{{
                            item.title
                        }}</span> </span
                    ><ArrowRight :size="20" aria-hidden="true" />
                </button>
            </div>
            <Link href="/work" class="studio-link"
                >Explore all work <ArrowUpRight :size="19"
            /></Link>
        </div>
        <div v-if="project" id="project-preview" class="showcase-stage">
            <Transition name="showcase" mode="out-in">
                <Link
                    :key="project.id"
                    :href="`/work/${project.id}`"
                    class="showcase-project"
                    :aria-label="`Explore ${project.title}`"
                >
                    <div class="showcase-image">
                        <img
                            v-if="project.images[0]"
                            :src="project.images[0]"
                            :alt="project.title"
                            width="1200"
                            height="900"
                            fetchpriority="high"
                            decoding="async"
                        />
                        <span v-else class="image-placeholder">{{
                            project.title
                        }}</span>
                        <span class="showcase-open" aria-hidden="true"
                            ><ArrowUpRight :size="30"
                        /></span>
                    </div>
                    <div class="showcase-caption">
                        <h2>{{ project.title }}</h2>
                        <span>View project <ArrowUpRight :size="16" /></span>
                    </div>
                </Link>
            </Transition>
        </div>
        <p v-else class="empty-state">New work is on its way.</p>
    </section>
</template>
