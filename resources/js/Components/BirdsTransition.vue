<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
const host = ref<HTMLElement | null>(null),
    visible = ref(false);
let stop = () => {};
let timer: ReturnType<typeof setTimeout> | undefined;
let alive = true;
onMounted(async () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
        const { startBirds } = await import("../graphics/birds");
        if (!host.value || !alive) return;
        visible.value = true;
        stop = startBirds(host.value);
        timer = setTimeout(() => {
            stop();
            stop = () => {};
            visible.value = false;
        }, 2500);
    } catch {
        stop();
        visible.value = false;
    }
});
onBeforeUnmount(() => {
    alive = false;
    if (timer) clearTimeout(timer);
    stop();
});
</script>
<template>
    <div
        ref="host"
        v-show="visible"
        class="fixed inset-0 z-50 bg-white pointer-events-none"
        aria-hidden="true"
    />
</template>
