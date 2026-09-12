<script setup lang="ts">
import { Head, Link } from "@inertiajs/vue3";
import { ArrowUpRight, ArrowDown } from "lucide-vue-next";
import { defineAsyncComponent } from "vue";
import SiteLayout from "../Layouts/SiteLayout.vue";
import ProjectCard from "../Components/ProjectCard.vue";
import type { Project } from "../types";
const ModelScene = defineAsyncComponent(
    () => import("../Components/ModelScene.vue"),
);
defineProps<{ projects: Project[] }>();
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
            <section class="home-hero shell">
                <div class="hero-topline" data-intro-fade>
                    <span>Full stack developer / AI &amp; ML student</span
                    ><span class="availability"><i /> Available for work</span>
                </div>
                <div class="hero-composition">
                    <div class="hero-copy">
                        <h1 class="hero-title">
                            <span class="line-mask"
                                ><span data-intro>A curious</span></span
                            ><span class="line-mask"
                                ><span data-intro>mind.</span></span
                            ><span class="line-mask"
                                ><span data-intro class="accent-text"
                                    >A builder's</span
                                ></span
                            ><span class="line-mask"
                                ><span data-intro class="accent-text"
                                    >instinct.</span
                                ></span
                            >
                        </h1>
                        <div class="hero-description" data-intro-fade>
                            <p>
                                I'm Nakhle. I build digital experiences at the
                                intersection of software engineering and
                                artificial intelligence.
                            </p>
                            <Link href="/work" class="round-link"
                                ><span class="round-icon"
                                    ><ArrowUpRight :size="24" /></span
                                ><span>Explore my work</span></Link
                            >
                        </div>
                    </div>
                    <div class="hero-art" data-intro-fade>
                        <div class="model-stage">
                            <ModelScene model="dna" />
                        </div>
                        <div class="art-caption">
                            <span>Human curiosity. Digital possibilities.</span
                            ><span class="drag-caption"
                                >Drag to explore
                                <span aria-hidden="true">↔</span></span
                            >
                        </div>
                    </div>
                </div>
                <div class="hero-baseline">
                    <span>Engineering with intent.</span
                    ><a href="#selected-work" class="text-link"
                        >Scroll to discover <ArrowDown :size="15"
                    /></a>
                </div>
            </section>
            <section id="selected-work" class="work-section shell">
                <div class="section-bar">
                    <h2 data-reveal>
                        Selected work<span class="accent-text">.</span>
                    </h2>
                    <Link href="/work" class="text-link"
                        >View all projects <ArrowUpRight :size="18"
                    /></Link>
                </div>
                <div class="selected-grid">
                    <Link
                        v-for="(project, index) in projects"
                        :key="project.id"
                        :href="'/work?project=' + project.id"
                        class="project-link"
                        data-reveal
                        ><ProjectCard :project="project" :index="index"
                    /></Link>
                </div>
                <p v-if="!projects.length" class="empty-state">
                    New work is on its way.
                </p>
            </section>
            <section class="approach-section">
                <div class="shell approach-grid">
                    <div class="approach-aside">
                        <span class="small-label"
                            >Always learning. Always building.</span
                        >
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
