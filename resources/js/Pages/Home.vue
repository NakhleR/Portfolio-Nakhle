<script setup lang="ts">
import { Head, Link } from "@inertiajs/vue3";
import { Code2, Brain, Layers, ArrowRight } from "lucide-vue-next";
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
        title: "Web Development",
        description:
            "Creating responsive and intuitive web applications with modern technologies and frameworks.",
        icon: Code2,
    },
    {
        title: "AI & Machine Learning",
        description:
            "Exploring deep learning, data science, and intelligent automation to build smarter applications.",
        icon: Brain,
    },
    {
        title: "Full Stack Solutions",
        description:
            "Delivering comprehensive solutions from frontend to backend with scalable architecture.",
        icon: Layers,
    },
];
const technologies = [
    "FRONTEND",
    "BACKEND",
    "MOBILE",
    "UI/UX",
    "DATABASE",
    "DEVOPS",
    "WEB",
    "ARCHITECTURE",
    "CLOUD",
    "API",
    "REACT",
    "NODEJS",
    "TYPESCRIPT",
    "NEXTJS",
    "EXPRESS",
    "MONGODB",
    "MYSQL",
    "FLUTTER",
    "RIVERPOD",
    "BLOC",
];
</script>
<template>
    <div>
        <Head title="Full Stack Developer & AI Student" /><SiteLayout>
            <section class="py-20 md:py-32">
                <div class="container grid lg:grid-cols-2 gap-16 items-center">
                    <div class="space-y-8 page-enter">
                        <span class="badge"
                            ><span
                                class="w-1.5 h-1.5 rounded-full bg-green-500"
                            />Available for work</span
                        >
                        <h1 class="font-semibold leading-[1.1] text-balance">
                            Full Stack Developer &amp;<br
                                class="hidden sm:block"
                            />
                            AI and Machine Learning Student
                        </h1>
                        <p
                            class="text-lg md:text-xl text-muted-foreground max-w-lg"
                        >
                            Building intelligent, user-focused digital
                            experiences that combine modern engineering with
                            cutting-edge AI.
                        </p>
                        <div class="flex flex-wrap gap-4">
                            <Link href="/work" class="button"
                                >View My Projects<ArrowRight :size="16" /></Link
                            ><Link href="/contact" class="button secondary"
                                >Get in Touch</Link
                            >
                        </div>
                    </div>
                    <div class="hidden lg:block">
                        <ModelScene model="dna" />
                    </div>
                </div>
            </section>
            <div
                class="overflow-hidden border-y border-border/50 py-5"
                aria-label="Technology expertise"
            >
                <div class="marquee">
                    <span
                        v-for="(name, i) in [...technologies, ...technologies]"
                        :key="i"
                        class="text-sm tracking-widest text-muted-foreground whitespace-nowrap"
                        >{{ name }} <span class="mx-7 opacity-30">/</span></span
                    >
                </div>
            </div>
            <section class="section bg-secondary/50">
                <div class="container">
                    <div class="section-heading">
                        <p class="eyebrow mb-3">Services</p>
                        <h2>What I Do</h2>
                    </div>
                    <div class="grid md:grid-cols-3 gap-6">
                        <article
                            v-for="service in services"
                            :key="service.title"
                            class="panel p-8"
                        >
                            <div
                                class="w-12 h-12 rounded-xl bg-secondary grid place-items-center mb-6"
                            >
                                <component :is="service.icon" :size="22" />
                            </div>
                            <h3 class="text-xl font-semibold mb-3">
                                {{ service.title }}
                            </h3>
                            <p class="text-muted-foreground">
                                {{ service.description }}
                            </p>
                        </article>
                    </div>
                </div>
            </section>
            <section class="section relative overflow-hidden">
                <div class="container grid md:grid-cols-2 gap-12 items-center">
                    <div class="hidden md:block">
                        <ModelScene model="thinker" />
                    </div>
                    <div class="space-y-8">
                        <p class="eyebrow">My philosophy</p>
                        <blockquote
                            class="text-3xl md:text-5xl font-heading font-semibold tracking-tight leading-tight italic"
                        >
                            “The greatest obstacle to discovery is not ignorance
                            <span class="text-muted-foreground"
                                >— it is the illusion of knowledge.”</span
                            >
                        </blockquote>
                        <p class="text-right text-muted-foreground">
                            — Daniel J. Boorstin
                        </p>
                        <p class="text-muted-foreground text-right">
                            In AI and software engineering, the hardest bugs
                            aren't what you don't know — they're the assumptions
                            you never question. This quote drives how I approach
                            every problem.
                        </p>
                    </div>
                </div>
            </section>
            <section class="section">
                <div class="container">
                    <div class="flex items-end justify-between gap-4 mb-14">
                        <div>
                            <p class="eyebrow mb-3">Portfolio</p>
                            <h2>Featured Projects</h2>
                        </div>
                        <Link
                            href="/work"
                            class="text-sm flex items-center gap-2"
                            >View All <ArrowRight :size="14"
                        /></Link>
                    </div>
                    <div class="grid md:grid-cols-2 gap-8">
                        <Link
                            v-for="project in projects"
                            :key="project.id"
                            :href="'/work?project=' + project.id"
                            class="group"
                            ><ProjectCard :project="project"
                        /></Link>
                    </div>
                    <p v-if="!projects.length" class="text-muted-foreground">
                        Projects will appear here soon.
                    </p>
                </div>
            </section>
        </SiteLayout>
    </div>
</template>
