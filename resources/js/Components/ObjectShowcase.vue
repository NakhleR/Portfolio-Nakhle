<script setup lang="ts">
import { useLocale } from "../composables/useLocale";
const { t, locale } = useLocale();
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useEntryAsset } from "../composables/useEntryLoader";
import { Box, Pause, Play } from "lucide-vue-next";
import type { StudioObjectKind } from "../graphics/studioObjects";
import type { startStudioScene } from "../graphics/studioScene";

const props = defineProps<{ kind: StudioObjectKind; label: string }>();
const host = ref<HTMLDivElement | null>(null);
const ready = ref(false);
const failed = ref(false);
const paused = ref(false);
const { entry, complete } = useEntryAsset();
let alive = true;
let started = false;
let near = false;
let observer: IntersectionObserver | undefined;
let scene: ReturnType<typeof startStudioScene> | undefined;

async function initialize() {
    if (started || (!near && !entry.value) || !host.value) return;
    started = true;
    try {
        const { startStudioScene } = await import("../graphics/studioScene");
        if (!alive || !host.value) return;
        scene = startStudioScene(host.value, props.kind, () => {
            failed.value = true;
        });
        scene.setPaused(paused.value || entry.value);
        ready.value = true;
    } catch {
        scene?.dispose();
        failed.value = true;
    } finally {
        complete();
    }
}
onMounted(() => {
    if (entry.value) void initialize();
    observer = new IntersectionObserver(
        ([entry]) => {
            near = entry.isIntersecting;
            void initialize();
        },
        { rootMargin: "100px" },
    );
    if (host.value) observer.observe(host.value);
});
watch(
    () => props.kind,
    (kind) => scene?.select(kind),
);
watch([paused, entry], ([paused, loading]) =>
    scene?.setPaused(paused || loading),
);
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
            :aria-label="locale === 'fr' ? `Objet 3D pour ${label}. Glissez à gauche ou à droite pour tourner.` : `Custom 3D ${kind === 'processor' ? 'layered processor' : kind === 'mobile' ? 'mobile device' : kind === 'web' ? 'modular browser workstation' : 'game controller'} for ${label}. Drag left or right to turn.`"
        />
        <div v-if="!ready || failed" class="object-placeholder" role="status">
            <Box :size="48" :stroke-width="1" />
            <span>{{
                failed
                    ? t("Explore the discipline using the buttons.")
                    : t("Assembling the scene…")
            }}</span>
        </div>
        <span v-if="ready && !failed" class="object-hint">{{ t("Drag to turn") }}</span>
        <button
            v-if="ready && !failed"
            class="object-playback"
            :aria-label="
                paused ? t('Play object animation') : t('Pause object animation')
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
