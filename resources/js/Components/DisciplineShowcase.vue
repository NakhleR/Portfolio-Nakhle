<script setup lang="ts">
import { useCms } from "../composables/useCms";
const cms = useCms();
import { computed, ref } from "vue";
import { Link } from "@inertiajs/vue3";
import { ArrowUpRight, ArrowRight } from "lucide-vue-next";
import ObjectShowcase from "./ObjectShowcase.vue";

const disciplines = computed(() => cms.value.home.disciplines);
const selected = ref(0);
const active = computed(() => disciplines.value[selected.value]);
</script>

<template>
    <section class="studio-showcase shell" aria-label="Explore my disciplines">
        <div class="showcase-intro">
            <h1>
                <span
                    v-for="(line, i) in cms.home.hero.split('\n')"
                    :key="i"
                    class="line-mask"
                    ><span data-intro>{{ line }}</span></span
                >
            </h1>
            <p class="showcase-description">{{ cms.home.intro }}</p>
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
                    >0{{ selected + 1 }}
                    <span
                        >/
                        {{
                            disciplines.length.toString().padStart(2, "0")
                        }}</span
                    ></span
                >
            </div>
        </div>
    </section>
</template>
