<script setup lang="ts">
import { computed, ref } from "vue";
import { Link } from "@inertiajs/vue3";
import { ArrowUpRight, ArrowRight } from "lucide-vue-next";
import ObjectShowcase from "./ObjectShowcase.vue";

const disciplines = [
    {
        label: "AI & machine learning",
        title: "Intelligence, engineered.",
        detail: "Learning systems. Real possibilities.",
        object: "processor",
    },
    {
        label: "Mobile apps",
        title: "Ideas in your hands.",
        detail: "Small screens. Thoughtful experiences.",
        object: "mobile",
    },
    {
        label: "Web development",
        title: "Connected by design.",
        detail: "Interfaces, systems, and everything between.",
        object: "web",
    },
    {
        label: "Game development",
        title: "Built for the next move.",
        detail: "A little curiosity. A lot of play.",
        object: "controller",
    },
] as const;
const selected = ref(0);
const active = computed(() => disciplines[selected.value]);
</script>

<template>
    <section class="studio-showcase shell" aria-label="Explore my disciplines">
        <div class="showcase-intro">
            <h1>
                <span class="line-mask"
                    ><span data-intro>Built to be</span></span
                >
                <span class="line-mask"><span data-intro>explored.</span></span>
            </h1>
            <p class="showcase-description">
                I'm Nakhle. I build digital experiences at the intersection of
                software engineering and artificial intelligence.
            </p>
            <div class="showcase-selector" aria-label="Choose a discipline">
                <button
                    v-for="(item, index) in disciplines"
                    :key="item.object"
                    :aria-pressed="selected === index"
                    aria-controls="discipline-preview"
                    @click="selected = index"
                >
                    <span>{{ item.label }}</span
                    ><ArrowRight :size="20" aria-hidden="true" />
                </button>
            </div>
            <Link href="/work" class="studio-link"
                >Explore all work <ArrowUpRight :size="19"
            /></Link>
        </div>
        <div id="discipline-preview" class="showcase-stage">
            <ObjectShowcase :kind="active.object" :label="active.label" />
            <div class="showcase-caption" aria-live="polite" aria-atomic="true">
                <div>
                    <h2>{{ active.title }}</h2>
                    <p>{{ active.detail }}</p>
                </div>
                <span class="showcase-index"
                    >0{{ selected + 1 }} <span>/ 04</span></span
                >
            </div>
        </div>
    </section>
</template>
