<script setup lang="ts">
import SeoHead from "../Components/SeoHead.vue";
import { ref } from "vue";
import { ArrowDown } from "lucide-vue-next";
import SiteLayout from "../Layouts/SiteLayout.vue";
import { skills } from "../data/skills";
import type { TimelineItem } from "../types";
defineProps<{ timeline: TimelineItem[] }>();
const category = ref(0);
const timelineCategory = ref("all");
</script>
<template>
    <div>
        <SeoHead /><SiteLayout>
            <section class="inner-hero shell about-heading">
                <h1>
                    <span class="line-mask"
                        ><span data-intro>Curiosity is</span></span
                    ><span class="line-mask"
                        ><span data-intro>the constant.</span></span
                    >
                </h1>
            </section>
            <section class="shell biography">
                <figure class="portrait" data-intro-fade>
                    <div class="portrait-frame">
                        <img
                            src="/nakhle-960.webp"
                            srcset="
                                /nakhle-480.webp 480w,
                                /nakhle-960.webp 960w
                            "
                            sizes="(max-width: 767px) 90vw, (min-width: 1680px) 540px, 36vw"
                            alt="Nakhle Rizk"
                            width="800"
                            height="1000"
                            fetchpriority="high"
                        />
                    </div>
                    <figcaption>
                        <span>Nakhle Rizk</span
                        ><span>Developer &amp; lifelong learner</span>
                    </figcaption>
                </figure>
                <div class="biography-copy" data-reveal>
                    <h2>Engineering meets<br />a sense of possibility.</h2>
                    <p>
                        I'm Nakhle Rizk, born on November 20, 2002. I'm a full
                        stack developer and AI &amp; machine learning student
                        with a passion for building intelligent, user-focused
                        applications. My journey began with web development,
                        mastering various frontend and backend technologies.
                    </p>
                    <p>
                        My curiosity for how systems learn and adapt led me to
                        artificial intelligence and machine learning, where I'm
                        exploring areas like deep learning, data science, and
                        intelligent automation. I enjoy bridging the gap between
                        robust software engineering and cutting-edge AI
                        research.
                    </p>
                    <p>
                        I approach every project with attention to detail and a
                        focus on user experience, whether I'm building a
                        responsive web application or training a machine
                        learning model. I'm constantly learning and expanding my
                        skills to stay current with the latest technologies and
                        best practices.
                    </p>
                    <a
                        href="/Nakhle_CV.pdf"
                        download="Nakhle_Rizk_CV.pdf"
                        class="round-link"
                        ><span class="round-icon"><ArrowDown :size="22" /></span
                        ><span>The full story, in my CV</span></a
                    >
                </div>
            </section>
            <section class="journey-section shell">
                <div class="section-bar">
                    <h2>Learning by doing<span class="accent-text">.</span></h2>
                    <span class="small-label">Experience &amp; education</span>
                </div>
                <div class="filter-list timeline-filters">
                    <button
                        v-for="item in ['all', 'education', 'work', 'project']"
                        :key="item"
                        :aria-pressed="timelineCategory === item"
                        class="capitalize"
                        @click="timelineCategory = item"
                    >
                        {{ item }}
                    </button>
                </div>
                <div class="journey-list">
                    <article
                        v-for="item in timeline.filter(
                            (item) =>
                                timelineCategory === 'all' ||
                                item.category === timelineCategory,
                        )"
                        :key="item.id"
                        class="journey-item"
                    >
                        <div class="journey-date">
                            {{ item.year }}<span>{{ item.category }}</span>
                        </div>
                        <div>
                            <h3>{{ item.title }}</h3>
                            <p v-if="item.location" class="journey-location">
                                {{ item.location }}
                            </p>
                            <p
                                v-if="item.description"
                                class="whitespace-pre-line"
                            >
                                {{ item.description }}
                            </p>
                            <ul v-if="item.bullets?.length">
                                <li
                                    v-for="(bullet, i) in item.bullets"
                                    :key="i"
                                >
                                    {{ bullet }}
                                </li>
                            </ul>
                        </div>
                    </article>
                </div>
            </section>
            <section class="skills-section">
                <div class="shell skills-layout">
                    <div>
                        <h2>
                            A growing<br /><span class="accent-text"
                                >toolbox.</span
                            >
                        </h2>
                        <p>
                            Technologies and tools I work with.<br />Always room
                            for something new.
                        </p>
                    </div>
                    <div>
                        <div class="filter-list skills-filters">
                            <button
                                v-for="(group, i) in skills"
                                :key="group.name"
                                :aria-pressed="category === i"
                                @click="category = i"
                            >
                                {{ group.name }}
                            </button>
                        </div>
                        <div class="skills-list">
                            <div
                                v-for="skill in skills[category].items"
                                :key="skill.name"
                            >
                                <img
                                    :src="skill.imagePath"
                                    alt=""
                                    width="28"
                                    height="28"
                                    loading="lazy"
                                    :class="{
                                        'dark:invert':
                                            'darkModeInvert' in skill &&
                                            skill.darkModeInvert,
                                    }"
                                /><span>{{ skill.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    </div>
</template>
