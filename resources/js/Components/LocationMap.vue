<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import "leaflet/dist/leaflet.css";
const element = ref<HTMLElement | null>(null);
let cleanup = () => {};
onMounted(async () => {
    const L = await import("leaflet");
    if (!element.value) return;
    const map = L.map(element.value, { scrollWheelZoom: false }).setView(
        [49.4431, 1.0993],
        13,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.circleMarker([49.4431, 1.0993], {
        radius: 8,
        color: "#222",
        fillOpacity: 0.8,
    })
        .addTo(map)
        .bindPopup("Rouen, France");
    cleanup = () => map.remove();
});
onBeforeUnmount(() => cleanup());
</script>
<template>
    <div
        ref="element"
        class="aspect-video rounded-xl overflow-hidden relative z-0"
        role="region"
        aria-label="Map of Rouen, France"
    />
</template>
