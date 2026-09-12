<script setup lang="ts">
import { Head, Link } from "@inertiajs/vue3";
import { ArrowUpRight } from "lucide-vue-next";
import { computed, defineAsyncComponent } from "vue";
import SiteLayout from "../Layouts/SiteLayout.vue";
import ProjectShowcase from "../Components/ProjectShowcase.vue";
import { projectCategoryLabel } from "../data/projectCategories";
import type { Project } from "../types";
const ModelScene = defineAsyncComponent(
    () => import("../Components/ModelScene.vue"),
);
const props = defineProps<{ projects: Project[] }>();
const featured = computed(() => {
    const categories = [
        ...new Set(
            props.projects.map((project) =>
                projectCategoryLabel(project.category),
            ),
        ),
    ];
    return categories
        .reverse()
        .map((category) =>
            [...props.projects]
                .reverse()
                .find(
                    (project) =>
                        projectCategoryLabel(project.category) === category,
                )!,
        )
        .slice(0, 4);
});
const services = [
    {
        title: "Web development",
        text: "Responsive, intuitive applications. Thoughtful interfaces, reliable backends, and the detail that connects them.",
        tools: "Frontend · Backend · APIs",
    },
    {
        title: "AI & machine learning",
        text: "Exploring how systems learn and adapt through deep learning, data science, and intelligent automation.",
        tools: "Deep learning · Data science",
    },
    {
        title: "Full stack solutions",
        text: "Connecting all the pieces, from a first prototype to a complete application built with room to grow.",
        tools: "Architecture · Databases · Deployment",
    },
];
</script>
<template>
    <div>
        <Head title="Developer & creative problem solver" /><SiteLayout>
            <ProjectShowcase :projects="featured" />
            <section class="studio-statement shell">
                <div class="studio-statement-copy">
                    <h2>A curious mind.<br />A builder's instinct.</h2>
                    <p>
                        Full stack developer. AI &amp; machine learning student.
                        Always learning. Always building.
                    </p>
                    <Link href="/about" class="studio-link"
                        >Meet the person behind the work
                        <ArrowUpRight :size="20"
                    /></Link>
                </div>
                <div class="studio-dna">
                    <ModelScene model="dna" /><span
                        >Human curiosity. Digital possibilities.</span
                    >
                </div>
            </section>
            <section class="approach-section">
                <div class="shell approach-grid">
                    <div class="approach-aside">
                        <div class="thinker-stage">
                            <ModelScene model="thinker" />
                        </div>
                        <Link href="/about" class="text-link"
                            >A little more about me <ArrowUpRight :size="18"
                        /></Link>
                    </div>
                    <div class="approach-copy">
                        <h2 data-reveal>
                            Good software starts with<br /><span
                                class="accent-text"
                                >better questions.</span
                            >
                        </h2>
                        <p class="approach-lead">
                            The most interesting part of a problem is often the
                            assumption hiding underneath it.
                        </p>
                        <blockquote>
                            “The greatest obstacle to discovery is not ignorance
                            — it is the illusion of knowledge.”<cite
                                >— Daniel J. Boorstin</cite
                            >
                        </blockquote>
                        <div class="expertise-list">
                            <article
                                v-for="service in services"
                                :key="service.title"
                            >
                                <h3>
                                    {{ service.title
                                    }}<ArrowUpRight :size="22" />
                                </h3>
                                <p>{{ service.text }}</p>
                                <span>{{ service.tools }}</span>
                            </article>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    </div>
</template>
