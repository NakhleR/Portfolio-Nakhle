<script setup lang="ts">
import { computed, ref } from "vue";
import { Head, Link } from "@inertiajs/vue3";
import {
    ArrowLeft,
    ArrowUpRight,
    ArrowDown,
    Expand,
    Code2,
} from "lucide-vue-next";
import SiteLayout from "../Layouts/SiteLayout.vue";
import { projectCategoryLabel } from "../data/projectCategories";
import { technologyIcon } from "../data/technologyIcons";
import type { Project } from "../types";
const props = defineProps<{ project: Project }>();
const technologies = computed(() =>
    props.project.technologies.map((label) => ({
        label,
        icon: technologyIcon(label),
    })),
);
const paragraphs = computed(() =>
    (props.project.longDescription || props.project.description)
        .split(/\n\s*\n/)
        .filter(Boolean),
);
const portraitImages = ref(new Set<string>());
function imageLoaded(event: Event, src: string) {
    const image = event.target as HTMLImageElement;
    if (image.naturalWidth < image.naturalHeight) portraitImages.value.add(src);
}
</script>
<template>
    <div>
        <Head :title="project.title" />
        <SiteLayout>
            <article class="case-study shell">
                <nav class="case-navigation" aria-label="Project navigation">
                    <Link href="/work" class="case-back"
                        ><ArrowLeft :size="18" /> Back to work</Link
                    >
                    <span>{{ projectCategoryLabel(project.category) }}</span>
                </nav>
                <header class="case-opening">
                    <div class="case-introduction">
                        <h1
                            :class="{ 'long-title': project.title.length > 40 }"
                            data-intro-fade
                        >
                            {{ project.title }}
                        </h1>
                        <p class="case-deck" data-intro-fade>
                            {{ project.description }}
                        </p>
                        <div class="case-actions" data-intro-fade>
                            <a
                                v-if="
                                    project.liveUrl &&
                                    /^https?:\/\//.test(project.liveUrl)
                                "
                                :href="project.liveUrl"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="case-action primary"
                                >Visit website <ArrowUpRight :size="18"
                            /></a>
                            <a
                                v-if="
                                    project.githubUrl &&
                                    /^https?:\/\//.test(project.githubUrl)
                                "
                                :href="project.githubUrl"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="case-action"
                                >Source code <ArrowUpRight :size="18"
                            /></a>
                        </div>
                        <a href="#project-overview" class="case-explore"
                            ><span class="case-explore-icon"
                                ><ArrowDown :size="19"
                            /></span>
                            Explore the project</a
                        >
                    </div>
                    <figure
                        v-if="project.images.length"
                        class="case-cover"
                        :class="{
                            portrait: portraitImages.has(project.images[0]),
                        }"
                    >
                        <a
                            :href="project.images[0]"
                            target="_blank"
                            rel="noopener noreferrer"
                            :aria-label="`Open ${project.title} cover image at full size`"
                            class="case-image-link"
                        >
                            <img
                                :src="project.images[0]"
                                :alt="`${project.title} — overview`"
                                width="1200"
                                height="1000"
                                fetchpriority="high"
                                decoding="async"
                                @load="imageLoaded($event, project.images[0])"
                            />
                            <span class="image-expand"
                                ><Expand :size="18"
                            /></span>
                        </a>
                        <figcaption>
                            <span>Project preview</span
                            ><span
                                >01 /
                                {{
                                    String(project.images.length).padStart(
                                        2,
                                        "0",
                                    )
                                }}</span
                            >
                        </figcaption>
                    </figure>
                </header>
                <section
                    v-if="technologies.length"
                    class="case-technologies"
                    aria-labelledby="technology-title"
                >
                    <h2 id="technology-title">The stack.</h2>
                    <ul>
                        <li
                            v-for="(technology, index) in technologies"
                            :key="index"
                        >
                            <span
                                class="technology-mark"
                                :title="
                                    technology.icon?.brand || technology.label
                                "
                            >
                                <img
                                    v-if="technology.icon"
                                    :src="technology.icon.src"
                                    :class="{
                                        monochrome: technology.icon.monochrome,
                                    }"
                                    alt=""
                                    width="28"
                                    height="28"
                                    decoding="async"
                                />
                                <Code2 v-else :size="26" aria-hidden="true" />
                            </span>
                            <span>{{ technology.label }}</span>
                        </li>
                    </ul>
                </section>
                <div class="case-content">
                    <nav class="case-index" aria-label="On this project">
                        <a href="#project-overview"
                            >The project <ArrowUpRight :size="15"
                        /></a>
                        <a
                            v-if="project.images.length > 1"
                            href="#project-gallery"
                            >In detail <ArrowDown :size="15"
                        /></a>
                        <span>{{
                            projectCategoryLabel(project.category)
                        }}</span>
                    </nav>
                    <div>
                        <section id="project-overview" class="case-overview">
                            <h2>
                                Inside the project<span class="accent-text"
                                    >.</span
                                >
                            </h2>
                            <div class="case-prose">
                                <p
                                    v-for="(paragraph, index) in paragraphs"
                                    :key="index"
                                >
                                    {{ paragraph }}
                                </p>
                            </div>
                        </section>
                        <section
                            v-if="project.images.length > 1"
                            id="project-gallery"
                            class="case-gallery"
                            aria-labelledby="gallery-title"
                        >
                            <div class="case-gallery-heading">
                                <h2 id="gallery-title">
                                    A closer look<span class="accent-text"
                                        >.</span
                                    >
                                </h2>
                                <span
                                    >{{
                                        project.images.length - 1
                                    }}
                                    images</span
                                >
                            </div>
                            <div class="case-image-grid">
                                <figure
                                    v-for="(
                                        image, index
                                    ) in project.images.slice(1)"
                                    :key="image"
                                    :class="{
                                        portrait: portraitImages.has(image),
                                    }"
                                >
                                    <a
                                        :href="image"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        :aria-label="`Open ${project.title} image ${index + 2} at full size`"
                                        class="case-image-link"
                                    >
                                        <img
                                            :src="image"
                                            :alt="`${project.title} — image ${index + 2}`"
                                            loading="lazy"
                                            decoding="async"
                                            width="1200"
                                            height="900"
                                            @load="imageLoaded($event, image)"
                                        />
                                        <span class="image-expand"
                                            ><Expand :size="18"
                                        /></span>
                                    </a>
                                    <figcaption>
                                        <span>{{ project.title }}</span
                                        ><span
                                            >{{
                                                String(index + 2).padStart(
                                                    2,
                                                    "0",
                                                )
                                            }}
                                            /
                                            {{
                                                String(
                                                    project.images.length,
                                                ).padStart(2, "0")
                                            }}</span
                                        >
                                    </figcaption>
                                </figure>
                            </div>
                        </section>
                    </div>
                </div>
                <div class="case-return">
                    <Link href="/work"
                        ><span>More to explore.</span
                        ><ArrowUpRight :size="40" /></Link
                    ><span>Back to the project archive</span>
                </div>
            </article>
        </SiteLayout>
    </div>
</template>
<style scoped>
.case-study {
    padding-top: 26px;
}
.case-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    font-size: 12px;
    padding-bottom: 28px;
}
.case-back {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
}
.case-navigation > span {
    color: hsl(var(--muted-foreground));
    text-align: right;
}
.case-opening {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.25fr);
    gap: clamp(32px, 5vw, 84px);
    align-items: center;
    padding: 18px 0 64px;
}
.case-introduction h1 {
    font-size: clamp(48px, 5.8vw, 84px);
    line-height: 0.98;
    letter-spacing: -0.04em;
    overflow-wrap: anywhere;
    text-wrap: balance;
    margin: 0 0 28px;
}
.case-introduction h1.long-title {
    font-size: clamp(36px, 3.7vw, 56px);
    line-height: 1.06;
}
.case-deck {
    font-size: 16px;
    line-height: 1.75;
    max-width: 42ch;
    color: hsl(var(--muted-foreground));
}
.case-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-top: 28px;
}
.case-action {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 46px;
    padding: 0 16px;
    border: 1px solid hsl(var(--border));
    font-size: 13px;
    transition:
        background-color 180ms ease-out,
        color 180ms ease-out;
}
.case-action.primary {
    background: hsl(var(--foreground));
    color: hsl(var(--background));
    border-color: transparent;
}
.case-explore {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    font-size: 12px;
    margin-top: 42px;
    min-height: 44px;
}
.case-explore-icon {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 1px solid hsl(var(--border));
    border-radius: 50%;
}
.case-study figure {
    margin: 0;
    min-width: 0;
}
.case-image-link {
    display: block;
    position: relative;
    overflow: hidden;
    background: hsl(var(--secondary));
}
.case-cover .case-image-link {
    min-height: 420px;
    height: clamp(420px, 40vw, 580px);
    display: flex;
    align-items: center;
    justify-content: center;
}
.case-cover img {
    width: 100%;
    height: 100%;
    max-height: 580px;
    object-fit: contain;
}
.case-cover.portrait .case-image-link {
    padding: 24px;
}
.case-cover.portrait img {
    max-width: 290px;
}
.case-study figcaption {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding-top: 12px;
    font-size: 11px;
    color: hsl(var(--muted-foreground));
}
.case-study figcaption span:first-child {
    overflow-wrap: anywhere;
}
.case-study figcaption span:last-child {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}
.image-expand {
    position: absolute;
    right: 14px;
    bottom: 14px;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    background: hsl(var(--background));
    color: hsl(var(--foreground));
    transition: transform 180ms ease-out;
}
.case-technologies {
    display: grid;
    grid-template-columns: minmax(120px, 0.55fr) minmax(0, 2.45fr);
    gap: 32px;
    padding: 34px 0;
    border-top: 1px solid hsl(var(--border));
    border-bottom: 1px solid hsl(var(--border));
    align-items: start;
}
.case-technologies h2 {
    font-size: 26px;
    padding-top: 6px;
}
.case-technologies ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px 24px;
}
.case-technologies li {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 42px;
    font-size: 13px;
    line-height: 1.4;
    overflow-wrap: anywhere;
}
.technology-mark {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
}
.technology-mark img {
    width: 28px;
    height: 28px;
    object-fit: contain;
}
:global(.dark .case-technologies .technology-mark img.monochrome) {
    filter: invert(1);
}
.case-content {
    display: grid;
    grid-template-columns: minmax(120px, 0.55fr) minmax(0, 2.45fr);
    gap: 32px;
    padding-top: 84px;
}
.case-index {
    position: sticky;
    top: 40px;
    align-self: start;
    display: flex;
    flex-direction: column;
    max-width: 160px;
    font-size: 12px;
}
.case-index a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 44px;
    gap: 18px;
    border-bottom: 1px solid hsl(var(--border));
}
.case-index > span {
    color: hsl(var(--muted-foreground));
    line-height: 1.6;
    margin-top: 24px;
}
.case-overview,
.case-gallery {
    scroll-margin-top: 32px;
}
.case-overview h2,
.case-gallery h2 {
    font-size: clamp(32px, 3.7vw, 52px);
    margin: 0 0 32px;
}
.case-prose {
    max-width: 70ch;
}
.case-prose p {
    white-space: pre-line;
    overflow-wrap: anywhere;
    font-size: 17px;
    line-height: 1.8;
    margin-bottom: 22px;
}
.case-prose p:first-child {
    font-size: 21px;
    line-height: 1.65;
    margin-bottom: 32px;
}
.case-gallery {
    padding-top: 72px;
}
.case-gallery-heading {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 24px;
}
.case-gallery-heading > span {
    font-size: 12px;
    white-space: nowrap;
    color: hsl(var(--muted-foreground));
}
.case-image-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 34px 24px;
}
.case-image-grid figure:nth-child(3n + 1):not(.portrait) {
    grid-column: 1 / -1;
}
.case-image-grid img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 4 / 3;
    object-fit: contain;
}
.case-image-grid figure:nth-child(3n + 1):not(.portrait) img {
    aspect-ratio: auto;
}
.case-image-grid .portrait .case-image-link {
    padding: 24px;
}
.case-image-grid .portrait img {
    height: 520px;
    aspect-ratio: auto;
}
.case-return {
    border-top: 1px solid hsl(var(--border));
    padding: 40px 0 72px;
    margin-top: 84px;
}
.case-return a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: Archivo, sans-serif;
    font-size: clamp(32px, 4.5vw, 64px);
    letter-spacing: -0.035em;
    line-height: 1.1;
    gap: 24px;
}
.case-return > span {
    display: block;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    margin-top: 18px;
}
@media (hover: hover) and (pointer: fine) {
    .case-action:hover {
        background: hsl(var(--secondary));
        color: hsl(var(--foreground));
    }
    .case-image-link:hover .image-expand {
        transform: translate(2px, -2px);
    }
    .case-back:hover,
    .case-index a:hover {
        color: var(--accent-ink, hsl(var(--foreground)));
        text-decoration: underline;
        text-underline-offset: 5px;
    }
}
@media (max-width: 1100px) {
    .case-technologies ul {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .case-opening {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
}
@media (max-width: 767px) {
    .case-study {
        padding-top: 14px;
    }
    .case-navigation {
        padding-bottom: 24px;
        font-size: 11px;
    }
    .case-opening {
        grid-template-columns: 1fr;
        gap: 30px;
        padding: 0 0 36px;
    }
    .case-introduction h1 {
        font-size: clamp(44px, 11vw, 68px);
        margin-bottom: 20px;
    }
    .case-introduction h1.long-title {
        font-size: 36px;
    }
    .case-deck {
        max-width: none;
        font-size: 16px;
    }
    .case-explore {
        margin-top: 24px;
    }
    .case-cover .case-image-link {
        height: auto;
        min-height: 240px;
    }
    .case-cover img {
        aspect-ratio: 4 / 3;
        max-height: 480px;
    }
    .case-cover.portrait img {
        aspect-ratio: auto;
        height: 420px;
    }
    .case-technologies {
        grid-template-columns: 1fr;
        gap: 20px;
        padding-block: 26px;
    }
    .case-technologies ul {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
    }
    .case-technologies h2 {
        font-size: 26px;
    }
    .case-technologies li {
        font-size: 12px;
        gap: 10px;
    }
    .case-content {
        grid-template-columns: 1fr;
        padding-top: 44px;
        gap: 32px;
    }
    .case-index {
        position: static;
        max-width: none;
        flex-direction: row;
        gap: 28px;
    }
    .case-index a {
        gap: 16px;
    }
    .case-index > span {
        display: none;
    }
    .case-prose p {
        font-size: 16px;
        line-height: 1.75;
    }
    .case-prose p:first-child {
        font-size: 18px;
    }
    .case-gallery {
        padding-top: 36px;
    }
    .case-image-grid {
        grid-template-columns: 1fr;
        gap: 28px;
    }
    .case-image-grid .portrait img {
        height: 460px;
    }
    .case-gallery-heading {
        gap: 16px;
    }
    .case-return {
        margin-top: 48px;
        padding: 32px 0 48px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .case-action,
    .image-expand {
        transition: none;
    }
}
</style>
