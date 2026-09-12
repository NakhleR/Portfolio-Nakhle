<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Box, Pause, Play } from "lucide-vue-next";
import type { StudioObjectKind } from "../graphics/studioObjects";
import type { startStudioScene } from "../graphics/studioScene";

const props = defineProps<{ kind: StudioObjectKind; label: string }>();
const host = ref<HTMLDivElement | null>(null);
const ready = ref(false);
const failed = ref(false);
const paused = ref(false);
const introComplete = inject("portfolioIntroComplete", ref(true));
let alive = true;
let started = false;
let near = false;
let observer: IntersectionObserver | undefined;
let scene: ReturnType<typeof startStudioScene> | undefined;

async function initialize() {
    if (started || !near || !introComplete.value || !host.value) return;
    started = true;
    try {
        const { startStudioScene } = await import("../graphics/studioScene");
        if (!alive || !host.value) return;
        scene = startStudioScene(host.value, props.kind, () => {
            failed.value = true;
        });
        scene.setPaused(paused.value);
        ready.value = true;
    } catch {
        scene?.dispose();
        failed.value = true;
    }
}
onMounted(() => {
    observer = new IntersectionObserver(
        ([entry]) => {
            near = entry.isIntersecting;
            void initialize();
        },
        { rootMargin: "100px" },
    );
    if (host.value) observer.observe(host.value);
});
watch(introComplete, () => void initialize());
watch(
    () => props.kind,
    (kind) => scene?.select(kind),
);
watch(paused, (value) => scene?.setPaused(value));
onBeforeUnmount(() => {
    alive = false;
    observer?.disconnect();
    scene?.dispose();
});
</script>

<template>
    <div class="object-showcase" :class="{ 'is-ready': ready && !failed }">
        <div class="object-shadow" aria-hidden="true" />
        <div
            ref="host"
            class="object-canvas"
            role="img"
            :aria-label="`Custom 3D ${kind === 'processor' ? 'layered processor' : kind === 'mobile' ? 'mobile device' : kind === 'web' ? 'modular browser workstation' : 'game controller'} for ${label}. Drag left or right to turn.`"
        />
        <div v-if="!ready || failed" class="object-placeholder" role="status">
            <Box :size="48" :stroke-width="1" />
            <span>{{
                failed
                    ? "Explore the discipline using the buttons."
                    : "Assembling the scene…"
            }}</span>
        </div>
        <span v-if="ready && !failed" class="object-hint">Drag to turn</span>
        <button
            v-if="ready && !failed"
            class="object-playback"
            :aria-label="
                paused ? 'Play object animation' : 'Pause object animation'
            "
            :aria-pressed="paused"
            @click="paused = !paused"
        >
            <Play v-if="paused" :size="16" aria-hidden="true" /><Pause
                v-else
                :size="16"
                aria-hidden="true"
            />
        </button>
    </div>
</template>
