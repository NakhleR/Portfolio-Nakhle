<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onBeforeUnmount } from "vue";
import { claimBirdsIntro } from "../graphics/introState";
const host = ref<HTMLElement | null>(null);
const visible = ref(false);
const props = defineProps<{ ready: boolean }>();
const emit = defineEmits<{ start: []; complete: [entry: boolean] }>();
let stop = () => {};
let timer: ReturnType<typeof setTimeout> | undefined;
let alive = true;
let previousOverflow = "";
function finish() {
    if (!alive || !visible.value) return;
    clearTimeout(timer);
    stop();
    stop = () => {};
    visible.value = false;
    document.body.style.overflow = previousOverflow;
    emit("complete", true);
}
onMounted(async () => {
    visible.value = claimBirdsIntro();
    if (!visible.value) {
        emit("complete", false);
        return;
    }
    emit("start");
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // A stalled request must not permanently block entry.
    timer = setTimeout(finish, 20000);
    try {
        await nextTick();
        const { startBirds } = await import("../graphics/birds");
        if (!alive || !visible.value || !host.value) return;
        stop = startBirds(host.value);
    } catch {
        // Keep the lightweight loading message if WebGL is unavailable.
    }
});
watch(
    () => props.ready,
    (ready) => {
        if (ready) finish();
    },
);
onBeforeUnmount(() => {
    alive = false;
    clearTimeout(timer);
    stop();
    if (visible.value) document.body.style.overflow = previousOverflow;
});
</script>
<template>
    <div
        v-if="visible"
        ref="host"
        class="bird-transition"
        role="status"
        aria-live="polite"
        aria-label="Loading page content and 3D scenes"
    >
        <span class="entry-loading-label">Loading the experience…</span>
    </div>
</template>
<style scoped>
.entry-loading-label {
    position: absolute;
    z-index: 1;
    bottom: max(32px, env(safe-area-inset-bottom));
    left: 0;
    right: 0;
    text-align: center;
    color: #20251e;
    font-size: 13px;
}
</style>
