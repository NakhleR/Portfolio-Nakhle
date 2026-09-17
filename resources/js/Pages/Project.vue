<script setup lang="ts">
import { useLocale } from "../composables/useLocale";
const { t, locale, localPath } = useLocale();
import SeoHead from "../Components/SeoHead.vue";
import { computed, ref } from "vue";
import { Link } from "@inertiajs/vue3";
import {
    ArrowLeft,
    ArrowUpRight,
    ArrowDown,
    Expand,
    Code2,
} from "lucide-vue-next";
import SiteLayout from "../Layouts/SiteLayout.vue";
import ProjectImage from "../Components/ProjectImage.vue";
import ImageGallery from "../Components/ImageGallery.vue";
import { projectCategoryLabel } from "../data/projectCategories";
import { technologyIcon } from "../data/technologyIcons";
import type { Project } from "../types";
const props = defineProps<{ project: Project }>();
const gallery = ref<InstanceType<typeof ImageGallery> | null>(null);
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
const imageLayouts = computed(() => props.project.images.map((_, index) => {
    const image = props.project.imageVariants?.[index];
    const width = image?.width || 1200;
    const height = image?.height || 900;
    return { portrait: height > width, ratio: `${width} / ${height}` };
}));
</script>
<template>
    <div>
        <SeoHead />
        <SiteLayout>
            <article class="case-study shell">
                <nav class="case-navigation" :aria-label="t('Project navigation')">
                    <Link :href="localPath('/work')" class="case-back"
                        ><ArrowLeft :size="18" /> {{ t("Back to work") }} </Link
                    >
                    <span>{{ t(projectCategoryLabel(project.category)) }}</span>
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
                                > {{ t("Visit website") }} <ArrowUpRight :size="18"
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
                                > {{ t("Source code") }} <ArrowUpRight :size="18"
                            /></a>
                        </div>
                        <a href="#project-overview" class="case-explore"
                            ><span class="case-explore-icon"
                                ><ArrowDown :size="19"
                            /></span> {{ t("Explore the project") }} </a
                        >
                    </div>
                    <figure
                        v-if="project.images.length"
                        class="case-cover"
                        :class="{
                            portrait: imageLayouts[0].portrait,
                        }"
                    >
                        <a
                            :href="project.images[0]"
                            @click.prevent="gallery?.open(0)"
                            aria-haspopup="dialog"
                            :aria-label="`Open ${project.title} cover image in gallery`"
                            class="case-image-link"
                            :style="{ aspectRatio: imageLayouts[0].portrait ? undefined : imageLayouts[0].ratio }"
                        >
                            <ProjectImage
                                :project="project"
                                sizes="(min-width: 1680px) 1544px, 92vw"
                                :alt="
                                    project.imageVariants?.[0]?.alt ||
                                    `${project.title} — overview`
                                "
                                fetchpriority="high"
                                decoding="async"
                            />
                            <span class="image-expand"
                                ><Expand :size="18"
                            /></span>
                        </a>
                        <figcaption>
                            <span> {{ t("Project preview") }} </span
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
                    <h2 id="technology-title"> {{ t("The stack.") }} </h2>
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
                    <nav class="case-index" :aria-label="t('On this project')">
                        <a href="#project-overview"
                            > {{ t("The project") }} <ArrowUpRight :size="15"
                        /></a>
                        <a
                            v-if="project.images.length > 1"
                            href="#project-gallery"
                            > {{ t("In detail") }} <ArrowDown :size="15"
                        /></a>
                        <span>{{
                            projectCategoryLabel(project.category)
                        }}</span>
                    </nav>
                    <div>
                        <section id="project-overview" class="case-overview">
                            <h2> {{ t("Inside the project") }} <span class="accent-text"
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
                                <h2 id="gallery-title"> {{ t("A closer look") }} <span class="accent-text"
                                        >.</span
                                    >
                                </h2>
                                <span
                                    >{{
                                        project.images.length - 1
                                    }} {{ t("images") }} </span
                                >
                            </div>
                            <div class="case-image-grid">
                                <figure
                                    v-for="(
                                        image, index
                                    ) in project.images.slice(1)"
                                    :key="image"
                                    :class="{
                                        portrait: imageLayouts[index + 1].portrait,
                                    }"
                                >
                                    <a
                                        :href="image"
                                        @click.prevent="
                                            gallery?.open(index + 1)
                                        "
                                        aria-haspopup="dialog"
                                        :aria-label="`Open ${project.title} image ${index + 2} in gallery`"
                                        class="case-image-link"
                                        :style="{ aspectRatio: imageLayouts[index + 1].portrait ? undefined : imageLayouts[index + 1].ratio }"
                                    >
                                        <ProjectImage
                                            :project="project"
                                            :index="index + 1"
                                            sizes="(max-width: 767px) 92vw, (min-width: 1680px) 1200px, 75vw"
                                            :alt="
                                                project.imageVariants?.[
                                                    index + 1
                                                ]?.alt ||
                                                `${project.title} — image ${index + 2}`
                                            "
                                            loading="lazy"
                                            decoding="async"
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
                    <Link :href="localPath('/work')"
                        ><span> {{ t("More to explore.") }} </span
                        ><ArrowUpRight :size="40" /></Link
                    ><span> {{ t("Back to the project archive") }} </span>
                </div>
            </article>
            <ImageGallery
                ref="gallery"
                :images="project.images"
                :thumbnails="
                    project.imageVariants?.map((variant) => variant.src)
                "
                :title="project.title"
            />
        </SiteLayout>
    </div>
</template>
<style scoped>
.case-study {
    padding-top: 24px;
}
.case-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    font-size: 13px;
    margin-bottom: 40px;
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
    padding-bottom: 60px;
}
.case-introduction {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    column-gap: 8vw;
    margin-bottom: 50px;
    align-items: start;
}
.case-introduction h1 {
    grid-column: 1;
    grid-row: 1 / 4;
    font-size: clamp(52px, 6.5vw, 96px);
    line-height: 1;
    overflow-wrap: anywhere;
}
.case-introduction h1.long-title {
    font-size: clamp(38px, 4.7vw, 68px);
    line-height: 1.06;
}
.case-deck {
    grid-column: 2;
    font-size: 17px;
    line-height: 1.75;
    max-width: 45ch;
    color: hsl(var(--muted-foreground));
}
.case-actions {
    grid-column: 2;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 25px;
}
.case-action {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 48px;
    padding: 12px 22px;
    border: 1px solid hsl(var(--border));
    border-radius: 26px;
    font-size: 13px;
    transition:
        background-color 160ms ease,
        color 160ms ease;
}
.case-action.primary {
    background: var(--citron);
    color: var(--ink);
    border-color: transparent;
}
.case-explore {
    grid-column: 2;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    width: fit-content;
    min-height: 44px;
    font-size: 13px;
    margin-top: 25px;
}
.case-explore-icon {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
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
    border-radius: 16px;
}
.case-cover .case-image-link {
    display: flex;
    align-items: center;
    justify-content: center;
}
.case-cover img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}
.case-cover.portrait .case-image-link {
    height: clamp(420px, 49vw, 680px);
    padding: clamp(24px, 3vw, 40px);
}
.case-cover.portrait img {
    width: auto;
    height: 100%;
    max-width: 100%;
    object-fit: contain;
    filter: drop-shadow(0 18px 24px hsl(var(--foreground) / 0.14));
}
.case-study figcaption {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding-top: 15px;
    font-size: 12px;
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
    bottom: 18px;
    right: 18px;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--citron);
    color: var(--ink);
    transition: transform 160ms var(--ease-out);
}
.case-technologies {
    display: grid;
    grid-template-columns: minmax(0, 0.65fr) minmax(0, 2fr);
    gap: 7vw;
    align-items: start;
    padding-bottom: 60px;
}
.case-technologies h2 {
    font-size: 36px;
}
.case-technologies ul {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px 22px;
}
.case-technologies li {
    display: flex;
    align-items: center;
    gap: 13px;
    padding-block: 12px;
    font-size: 14px;
    overflow-wrap: anywhere;
}
.technology-mark {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
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
    grid-template-columns: minmax(0, 0.65fr) minmax(0, 2fr);
    gap: 7vw;
    padding-block: 60px 90px;
    border-top: 1px solid hsl(var(--border));
}
.case-index {
    position: sticky;
    top: 116px;
    align-self: start;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.case-index a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    min-height: 44px;
    font-size: 14px;
}
.case-index > span {
    color: hsl(var(--muted-foreground));
    font-size: 12px;
    margin-top: 24px;
}
.case-overview h2,
.case-gallery h2 {
    font-size: clamp(34px, 4.2vw, 56px);
}
.case-prose {
    margin-top: 32px;
    max-width: 72ch;
}
.case-prose p {
    font-size: 17px;
    line-height: 1.85;
    color: hsl(var(--muted-foreground));
    white-space: pre-line;
    overflow-wrap: anywhere;
}
.case-prose p:first-child {
    font-size: 21px;
    line-height: 1.7;
    color: hsl(var(--foreground));
}
.case-prose p + p {
    margin-top: 24px;
}
.case-gallery {
    margin-top: 75px;
}
.case-gallery-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 30px;
}
.case-gallery-heading > span {
    font-size: 12px;
    white-space: nowrap;
    color: hsl(var(--muted-foreground));
}
.case-image-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 34px 22px;
}
.case-image-grid > figure:not(.portrait) {
    grid-column: 1 / -1;
}
.case-image-grid .case-image-link {
    display: flex;
    align-items: center;
    justify-content: center;
}
.case-image-grid img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
.case-image-grid .portrait .case-image-link {
    height: 520px;
    padding: 20px;
}
.case-image-grid .portrait img {
    width: auto;
    height: 100%;
    max-width: 100%;
}
.case-return {
    padding: 45px 0 70px;
    border-top: 1px solid hsl(var(--border));
}
.case-return > a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 25px;
    font:
        500 clamp(36px, 4vw, 60px)/1.1 "Space Grotesk",
        sans-serif;
    letter-spacing: -0.04em;
}
.case-return > span {
    display: block;
    margin-top: 20px;
    color: hsl(var(--muted-foreground));
    font-size: 13px;
}
@media (hover: hover) and (pointer: fine) {
    .case-image-link:hover .image-expand {
        transform: scale(1.08);
    }
    .case-action:hover {
        background: hsl(var(--foreground));
        color: hsl(var(--background));
    }
    .case-back:hover,
    .case-index a:hover {
        text-decoration: underline;
        text-underline-offset: 6px;
    }
}
@media (max-width: 1000px) {
    .case-introduction {
        gap: 4vw;
    }
    .case-technologies,
    .case-content {
        grid-template-columns: minmax(0, 0.55fr) minmax(0, 2fr);
        gap: 4vw;
    }
    .case-technologies ul {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (max-width: 767px) {
    .case-navigation {
        font-size: 12px;
        gap: 14px;
        margin-bottom: 30px;
    }
    .case-introduction {
        display: block;
        margin-bottom: 35px;
    }
    .case-introduction h1 {
        font-size: clamp(44px, 11vw, 68px);
        margin-bottom: 24px;
    }
    .case-introduction h1.long-title {
        font-size: clamp(36px, 9vw, 52px);
    }
    .case-deck {
        font-size: 16px;
    }
    .case-explore {
        margin-top: 20px;
    }
    .case-cover .case-image-link {
        border-radius: 12px;
    }
    .case-cover.portrait .case-image-link {
        height: auto;
        aspect-ratio: 0.85;
        padding: 20px;
    }
    .case-cover.portrait img {
        width: 100%;
        height: 100%;
        max-height: 500px;
    }
    .case-opening {
        padding-bottom: 42px;
    }
    .case-study figcaption {
        font-size: 11px;
    }
    .case-technologies {
        display: block;
        padding-bottom: 40px;
    }
    .case-technologies h2 {
        margin-bottom: 20px;
        font-size: 30px;
    }
    .case-technologies ul {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px 15px;
    }
    .case-technologies li {
        font-size: 13px;
        gap: 8px;
    }
    .technology-mark {
        width: 32px;
    }
    .case-content {
        display: block;
        padding-block: 30px 60px;
    }
    .case-index {
        position: static;
        flex-direction: row;
        gap: 24px;
        margin-bottom: 35px;
    }
    .case-index a {
        font-size: 13px;
        gap: 10px;
    }
    .case-index > span {
        display: none;
    }
    .case-prose {
        margin-top: 25px;
    }
    .case-prose p {
        font-size: 16px;
    }
    .case-prose p:first-child {
        font-size: 18px;
    }
    .case-gallery {
        margin-top: 50px;
    }
    .case-gallery-heading {
        display: block;
    }
    .case-gallery-heading > span {
        display: block;
        margin-top: 14px;
    }
    .case-image-grid {
        display: block;
    }
    .case-image-grid > figure + figure {
        margin-top: 30px;
    }
    .case-image-grid .portrait .case-image-link {
        height: 460px;
    }
    .case-return {
        padding-block: 32px 50px;
    }
    .case-return > a {
        font-size: 36px;
    }
    .case-return svg {
        width: 30px;
        flex-shrink: 0;
    }
}
</style>
