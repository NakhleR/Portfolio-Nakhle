<script setup lang="ts">
import { ref } from "vue";
import { Head } from "@inertiajs/vue3";
import SiteLayout from "../Layouts/SiteLayout.vue";
import { skills } from "../data/skills";
import type { TimelineItem } from "../types";
defineProps<{ timeline: TimelineItem[] }>();
const category = ref(0),
    timelineCategory = ref("all");
</script>
<template>
    <div>
        <Head title="About" /><SiteLayout
            ><section class="page-heading">
                <p class="eyebrow">About</p>
                <h1>About Me</h1>
                <p>
                    Full Stack Developer &amp; AI and Machine Learning Student
                </p>
            </section>
            <section class="section">
                <div class="container grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <p class="eyebrow mb-3">Background</p>
                        <h2 class="mb-6">My Story</h2>
                        <div class="space-y-4 text-muted-foreground">
                            <p>
                                I'm Nakhle Rizk, born on November 20, 2002. I'm
                                a full stack developer and AI &amp; machine
                                learning student with a passion for building
                                intelligent, user-focused applications. My
                                journey began with web development, mastering
                                various frontend and backend technologies.
                            </p>
                            <p>
                                My curiosity for how systems learn and adapt led
                                me to artificial intelligence and machine
                                learning, where I'm exploring areas like deep
                                learning, data science, and intelligent
                                automation. I enjoy bridging the gap between
                                robust software engineering and cutting-edge AI
                                research.
                            </p>
                            <p>
                                I approach every project with attention to
                                detail and a focus on user experience, whether
                                I'm building a responsive web application or
                                training a machine learning model. I'm
                                constantly learning and expanding my skills to
                                stay current with the latest technologies and
                                best practices.
                            </p>
                        </div>
                    </div>
                    <img
                        src="/nakhle.png"
                        alt="Nakhle Rizk"
                        class="w-full aspect-square object-cover rounded-2xl border border-border/50"
                        loading="lazy"
                    />
                </div>
            </section>
            <section class="section bg-secondary/50">
                <div class="container">
                    <div class="section-heading">
                        <p class="eyebrow mb-3">Experience</p>
                        <h2>My Journey</h2>
                    </div>
                    <div class="tabs mb-12">
                        <button
                            v-for="item in [
                                'all',
                                'education',
                                'work',
                                'project',
                            ]"
                            :key="item"
                            class="tab capitalize"
                            :class="{ active: timelineCategory === item }"
                            :aria-pressed="timelineCategory === item"
                            @click="timelineCategory = item"
                        >
                            {{ item }}
                        </button>
                    </div>
                    <div class="max-w-4xl mx-auto">
                        <article
                            v-for="item in timeline.filter(
                                (item) =>
                                    timelineCategory === 'all' ||
                                    item.category === timelineCategory,
                            )"
                            :key="item.id"
                            class="timeline-entry"
                        >
                            <div class="timeline-dot" />
                            <p class="eyebrow mb-2">
                                {{ item.year }} · {{ item.category }}
                            </p>
                            <h3 class="text-xl font-semibold">
                                {{ item.title }}
                            </h3>
                            <p
                                v-if="item.location"
                                class="text-sm text-muted-foreground mt-1"
                            >
                                {{ item.location }}
                            </p>
                            <p
                                v-if="item.description"
                                class="mt-4 whitespace-pre-line"
                            >
                                {{ item.description }}
                            </p>
                            <ul
                                v-if="item.bullets?.length"
                                class="list-disc pl-5 mt-3 space-y-2 text-muted-foreground"
                            >
                                <li
                                    v-for="(bullet, i) in item.bullets"
                                    :key="i"
                                >
                                    {{ bullet }}
                                </li>
                            </ul>
                        </article>
                    </div>
                </div>
            </section>
            <section class="section">
                <div class="container">
                    <div class="section-heading">
                        <h2>My Skills</h2>
                        <p class="mt-4 text-muted-foreground">
                            Technologies &amp; tools I work with
                        </p>
                    </div>
                    <div class="tabs mb-14">
                        <button
                            v-for="(group, i) in skills"
                            :key="group.name"
                            class="tab"
                            :class="{ active: category === i }"
                            :aria-pressed="category === i"
                            @click="category = i"
                        >
                            {{ group.name }}
                        </button>
                    </div>
                    <div
                        class="flex flex-wrap justify-center gap-5 max-w-4xl mx-auto"
                    >
                        <div
                            v-for="skill in skills[category].items"
                            :key="skill.name"
                            class="panel w-36 p-5 flex flex-col items-center gap-3"
                        >
                            <div class="relative w-[76px] h-[76px]">
                                <svg viewBox="0 0 76 76" class="-rotate-90">
                                    <circle
                                        cx="38"
                                        cy="38"
                                        r="34"
                                        fill="none"
                                        class="stroke-secondary"
                                        stroke-width="2.5"
                                    />
                                    <circle
                                        cx="38"
                                        cy="38"
                                        r="34"
                                        fill="none"
                                        :stroke="skill.color"
                                        stroke-width="2.5"
                                        stroke-linecap="round"
                                        :stroke-dasharray="2 * Math.PI * 34"
                                        :stroke-dashoffset="
                                            2 *
                                            Math.PI *
                                            34 *
                                            (1 - skill.level / 100)
                                        "
                                    /></svg
                                ><img
                                    :src="skill.imagePath"
                                    :alt="skill.name"
                                    class="absolute w-7 h-7 top-6 left-6 object-contain"
                                    :class="{
                                        'dark:invert':
                                            'darkModeInvert' in skill &&
                                            skill.darkModeInvert,
                                    }"
                                    loading="lazy"
                                />
                            </div>
                            <span class="text-sm font-medium text-center">{{
                                skill.name
                            }}</span
                            ><span class="text-xs text-muted-foreground"
                                >{{ skill.level }}%</span
                            >
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    </div>
</template>
