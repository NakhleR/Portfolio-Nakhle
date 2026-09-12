<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
const host = ref<HTMLElement | null>(null);
const visible = ref(!matchMedia("(prefers-reduced-motion: reduce)").matches);
const emit = defineEmits<{ complete: [] }>();
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
    emit("complete");
}
onMounted(async () => {
    if (!visible.value) {
        emit("complete");
        return;
    }
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    timer = setTimeout(finish, 2500);
    try {
        const { startBirds } = await import("../graphics/birds");
        if (!alive || !visible.value || !host.value) return;
        stop = startBirds(host.value);
    } catch {
        finish();
    }
});
onBeforeUnmount(() => {
    alive = false;
    clearTimeout(timer);
    stop();
    if (visible.value) document.body.style.overflow = previousOverflow;
});
</script>
<template>
    <div v-if="visible" ref="host" class="bird-transition" aria-hidden="true" />
</template>
