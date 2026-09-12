<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Head } from "@inertiajs/vue3";
import SiteLayout from "../Layouts/SiteLayout.vue";
import ProjectCard from "../Components/ProjectCard.vue";
import ProjectDialog from "../Components/ProjectDialog.vue";
import type { Project } from "../types";
const props = defineProps<{ projects: Project[] }>();
const selected = ref<Project | null>(null),
    category = ref("All");
const categories = computed(() => [
    "All",
    ...new Set(props.projects.map((p) => p.category)),
]);
const filtered = computed(() =>
    props.projects.filter(
        (p) => category.value === "All" || p.category === category.value,
    ),
);
function open(project: Project) {
    selected.value = project;
    const url = new URL(location.href);
    url.searchParams.set("project", project.id);
    history.replaceState(history.state, "", url);
}
function close() {
    selected.value = null;
    const url = new URL(location.href);
    url.searchParams.delete("project");
    history.replaceState(history.state, "", url);
}
onMounted(() => {
    const id = new URLSearchParams(location.search).get("project");
    selected.value = props.projects.find((p) => p.id === id) || null;
});
const process = [
    {
        number: "01",
        title: "Research & Planning",
        description: "Understanding requirements and planning the approach.",
    },
    {
        number: "02",
        title: "Design & Prototype",
        description: "Creating wireframes and initial prototypes.",
    },
    {
        number: "03",
        title: "Development",
        description: "Implementing the solution with clean, maintainable code.",
    },
    {
        number: "04",
        title: "Testing & Deployment",
        description: "Thorough testing and smooth deployment.",
    },
];
</script>
<template>
    <div>
        <Head title="Work" /><SiteLayout
            ><section class="page-heading">
                <p class="eyebrow">Portfolio</p>
                <h1>My Work</h1>
                <p>
                    A collection of projects showcasing my skills and expertise.
                </p>
            </section>
            <section class="pb-24">
                <div class="container">
                    <div class="tabs mb-12">
                        <button
                            v-for="item in categories"
                            :key="item"
                            class="tab"
                            :class="{ active: category === item }"
                            :aria-pressed="category === item"
                            @click="category = item"
                        >
                            {{ item }}
                        </button>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                        <button
                            v-for="project in filtered"
                            :key="project.id"
                            class="text-left group"
                            :aria-label="'View ' + project.title"
                            @click="open(project)"
                        >
                            <ProjectCard :project="project" />
                        </button>
                    </div>
                    <p
                        v-if="!filtered.length"
                        class="text-center text-muted-foreground py-16"
                    >
                        No projects in this category yet.
                    </p>
                </div>
            </section>
            <section class="section bg-secondary/50">
                <div class="container">
                    <div class="section-heading">
                        <p class="eyebrow mb-3">Workflow</p>
                        <h2>My Development Process</h2>
                    </div>
                    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div
                            v-for="step in process"
                            :key="step.number"
                            class="panel p-6"
                        >
                            <div
                                class="font-heading text-5xl font-bold opacity-10 mb-4"
                            >
                                {{ step.number }}
                            </div>
                            <h3 class="text-lg font-semibold mb-2">
                                {{ step.title }}
                            </h3>
                            <p class="text-sm text-muted-foreground">
                                {{ step.description }}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <ProjectDialog :project="selected" @close="close"
        /></SiteLayout>
    </div>
</template>
