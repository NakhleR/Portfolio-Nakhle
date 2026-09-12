<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import {
    X,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Github,
} from "lucide-vue-next";
import type { Project } from "../types";
const props = defineProps<{ project: Project | null }>();
const emit = defineEmits<{ close: [] }>();
const dialog = ref<HTMLDialogElement | null>(null),
    index = ref(0),
    portrait = ref(false);
watch(
    () => props.project,
    async (project) => {
        index.value = 0;
        portrait.value = false;
        await nextTick();
        if (project) dialog.value?.showModal();
        else dialog.value?.close();
    },
    { immediate: true },
);
function move(direction: number) {
    if (props.project) {
        index.value =
            (index.value + direction + props.project.images.length) %
            props.project.images.length;
        portrait.value = false;
    }
}
function close() {
    dialog.value?.close();
    emit("close");
}
function key(event: KeyboardEvent) {
    if (event.key === "ArrowRight") move(1);
    if (event.key === "ArrowLeft") move(-1);
}
</script>
<template>
    <dialog
        ref="dialog"
        class="portfolio-dialog"
        data-lenis-prevent
        @cancel.prevent="close"
        @click="
            (e) => {
                if (e.target === dialog) close();
            }
        "
        @keydown="key"
        aria-labelledby="project-title"
    >
        <div v-if="project" class="relative">
            <button
                class="icon-button absolute top-3 right-3 z-10 bg-background/90"
                aria-label="Close project"
                @click="close"
            >
                <X :size="20" />
            </button>
            <div
                v-if="project.images.length"
                class="bg-secondary relative flex justify-center items-center min-h-64"
            >
                <img
                    :key="index"
                    :src="project.images[index]"
                    :alt="project.title + ' — image ' + (index + 1)"
                    class="max-h-[55vh] w-full object-contain"
                    :class="{
                        'max-w-72 my-5 rounded-3xl border-8 border-black':
                            portrait,
                    }"
                    @load="
                        (e) => {
                            const image = e.target as HTMLImageElement;
                            portrait =
                                image.naturalWidth / image.naturalHeight < 0.7;
                        }
                    "
                /><template v-if="project.images.length > 1"
                    ><button
                        class="gallery-prev"
                        @click="move(-1)"
                        aria-label="Previous image"
                    >
                        <ChevronLeft /></button
                    ><button
                        class="gallery-next"
                        @click="move(1)"
                        aria-label="Next image"
                    >
                        <ChevronRight /></button
                    ><span
                        class="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 bg-black/70 text-white text-xs"
                        >{{ index + 1 }} / {{ project.images.length }}</span
                    ></template
                >
            </div>
            <div class="p-6 md:p-8">
                <p class="eyebrow mb-2">{{ project.category }}</p>
                <h2 id="project-title" class="text-2xl">{{ project.title }}</h2>
                <p class="mt-4 text-muted-foreground whitespace-pre-line">
                    {{ project.longDescription || project.description }}
                </p>
                <div class="flex flex-wrap gap-2 my-6">
                    <span
                        v-for="(tech, i) in project.technologies"
                        :key="i"
                        class="badge"
                        >{{ tech }}</span
                    >
                </div>
                <div class="flex flex-wrap gap-3">
                    <a
                        v-if="
                            project.liveUrl &&
                            /^https?:\/\//.test(project.liveUrl)
                        "
                        :href="project.liveUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="button"
                        ><ExternalLink :size="16" />Live Site</a
                    ><a
                        v-if="
                            project.githubUrl &&
                            /^https?:\/\//.test(project.githubUrl)
                        "
                        :href="project.githubUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="button secondary"
                        ><Github :size="16" />Source Code</a
                    >
                </div>
            </div>
        </div>
    </dialog>
</template>
