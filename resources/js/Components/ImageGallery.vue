<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId } from "vue";
import { ArrowLeft, ArrowRight, X } from "lucide-vue-next";

const props = defineProps<{
    images: string[];
    title: string;
    thumbnails?: string[];
}>();
const titleId = useId();
const dialog = ref<HTMLDialogElement | null>(null);
const active = ref(0);
const opened = ref(false);
const failed = ref(false);
const loading = ref(false);
const source = computed(() => props.images[active.value]);
let opener: HTMLElement | null = null;
let previousOverflow = "";
let touchStart: { x: number; y: number } | null = null;

async function open(index = 0) {
    if (!props.images.length || opened.value) return;
    opener =
        document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
    active.value = Math.max(0, Math.min(index, props.images.length - 1));
    failed.value = false;
    loading.value = true;
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    opened.value = true;
    await nextTick();
    dialog.value?.showModal();
    scrollThumbnail();
}
function closed() {
    if (!opened.value) return;
    opened.value = false;
    touchStart = null;
    document.documentElement.style.overflow = previousOverflow;
    opener?.focus({ preventScroll: true });
}
function close() {
    dialog.value?.close();
    closed();
}
function scrollThumbnail() {
    dialog.value
        ?.querySelector('[aria-current="true"]')
        ?.scrollIntoView({ block: "nearest", inline: "nearest" });
}
async function select(index: number) {
    const next = (index + props.images.length) % props.images.length;
    if (next === active.value) return;
    active.value = next;
    failed.value = false;
    loading.value = true;
    await nextTick();
    scrollThumbnail();
}
function keydown(event: KeyboardEvent) {
    if (event.key === "Tab") {
        const controls = dialog.value?.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
        );
        if (controls?.length) {
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
        return;
    }
    if (props.images.length < 2) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        select(active.value + (event.key === "ArrowRight" ? 1 : -1));
    }
}
function startSwipe(event: TouchEvent) {
    touchStart =
        event.touches.length === 1
            ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
            : null;
}
function endSwipe(event: TouchEvent) {
    if (!touchStart || props.images.length < 2) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
        select(active.value + (dx < 0 ? 1 : -1));
}
onBeforeUnmount(closed);
defineExpose({ open });
</script>

<template>
    <dialog
        ref="dialog"
        class="image-gallery"
        :aria-labelledby="titleId"
        data-lenis-prevent
        @cancel.prevent="close"
        @close="closed"
        @keydown="keydown"
    >
        <div v-if="opened" class="gallery-shell">
            <header class="gallery-header">
                <h2 :id="titleId">{{ title }}</h2>
                <button
                    type="button"
                    class="gallery-control gallery-close"
                    aria-label="Close gallery"
                    autofocus
                    @click="close"
                >
                    <X :size="22" />
                </button>
            </header>
            <div
                class="gallery-stage"
                @click.self="close"
                @touchstart.passive="startSwipe"
                @touchend.passive="endSwipe"
                @touchcancel="touchStart = null"
            >
                <span v-if="loading" class="gallery-status" role="status"
                    >Loading image…</span
                >
                <p v-if="failed" class="gallery-status" role="status">
                    This image couldn’t load. Try another image.
                </p>
                <img
                    v-else
                    :key="source"
                    :src="source"
                    :alt="`${title} — image ${active + 1} of ${images.length}`"
                    decoding="async"
                    draggable="false"
                    @load="loading = false"
                    @error="
                        failed = true;
                        loading = false;
                    "
                />
                <template v-if="images.length > 1">
                    <button
                        type="button"
                        class="gallery-control gallery-previous"
                        aria-label="Previous image"
                        @click="select(active - 1)"
                    >
                        <ArrowLeft :size="22" />
                    </button>
                    <button
                        type="button"
                        class="gallery-control gallery-forward"
                        aria-label="Next image"
                        @click="select(active + 1)"
                    >
                        <ArrowRight :size="22" />
                    </button>
                </template>
            </div>
            <footer class="gallery-footer">
                <p class="gallery-count" aria-live="polite" aria-atomic="true">
                    {{ String(active + 1).padStart(2, "0") }} /
                    {{ String(images.length).padStart(2, "0") }}
                </p>
                <div
                    v-if="images.length > 1"
                    class="gallery-thumbnails"
                    role="group"
                    aria-label="Choose an image"
                >
                    <button
                        v-for="(image, index) in images"
                        :key="index"
                        type="button"
                        :aria-label="`Show image ${index + 1}`"
                        :aria-current="active === index ? 'true' : undefined"
                        @click="select(index)"
                    >
                        <img
                            :src="thumbnails?.[index] || image"
                            alt=""
                            width="64"
                            height="48"
                            loading="lazy"
                            decoding="async"
                        />
                    </button>
                </div>
            </footer>
        </div>
    </dialog>
</template>

<style scoped>
.image-gallery {
    position: fixed;
    inset: 0;
    width: 100%;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: #151914;
    color: #f5f5ed;
}
.image-gallery::backdrop {
    background: #151914;
}
.gallery-shell {
    height: 100%;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    padding: max(16px, env(safe-area-inset-top))
        max(20px, env(safe-area-inset-right))
        max(16px, env(safe-area-inset-bottom))
        max(20px, env(safe-area-inset-left));
}
.gallery-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding-bottom: 12px;
}
.gallery-header h2 {
    font:
        500 16px/1.4 "Space Grotesk",
        sans-serif;
    letter-spacing: normal;
}
.gallery-control {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border: 1px solid #ffffff38;
    border-radius: 50%;
    background: #20261fed;
    color: #f5f5ed;
    transition:
        background-color 160ms ease,
        color 160ms ease;
}
.gallery-control:hover {
    background: var(--citron);
    color: var(--ink);
}
.image-gallery button:focus-visible {
    outline: 2px solid var(--citron);
    outline-offset: 4px;
}
.gallery-stage {
    position: relative;
    min-height: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-inline: 68px;
}
.gallery-stage > img {
    position: relative;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    animation: gallery-image-in 160ms ease-out;
}
.gallery-status {
    position: absolute;
    inset-inline: 0;
    text-align: center;
    font-size: 14px;
    color: #d1d3c9;
}
.gallery-previous,
.gallery-forward {
    position: absolute;
    top: calc(50% - 24px);
}
.gallery-previous {
    left: 0;
}
.gallery-forward {
    right: 0;
}
.gallery-footer {
    min-width: 0;
    padding-top: 16px;
}
.gallery-count {
    text-align: center;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    margin-bottom: 12px;
}
.gallery-thumbnails {
    display: flex;
    gap: 8px;
    max-width: 100%;
    width: max-content;
    margin-inline: auto;
    padding: 6px;
    overflow-x: auto;
    overscroll-behavior: contain;
}
.gallery-thumbnails button {
    flex: 0 0 64px;
    height: 48px;
    border: 1px solid #ffffff38;
    border-radius: 6px;
    overflow: hidden;
    opacity: 0.55;
}
.gallery-thumbnails button[aria-current="true"] {
    opacity: 1;
    border: 2px solid var(--citron);
}
.gallery-thumbnails img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
@keyframes gallery-image-in {
    from {
        opacity: 0.7;
    }
    to {
        opacity: 1;
    }
}
@media (max-width: 767px) {
    .gallery-stage {
        padding: 0 0 60px;
    }
    .gallery-previous,
    .gallery-forward {
        top: auto;
        bottom: 0;
    }
    .gallery-previous {
        left: calc(50% - 56px);
    }
    .gallery-forward {
        right: calc(50% - 56px);
    }
    .gallery-header h2 {
        font-size: 14px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .gallery-stage > img {
        animation: none;
    }
    .gallery-control {
        transition: none;
    }
}
</style>
