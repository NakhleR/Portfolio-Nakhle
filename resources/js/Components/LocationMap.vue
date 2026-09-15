<script setup lang="ts">
import { useCms } from "../composables/useCms";
const cms = useCms();
import { ref, nextTick, onBeforeUnmount } from "vue";
import "leaflet/dist/leaflet.css";
const element = ref<HTMLElement | null>(null);
let cleanup = () => {};
const enabled = ref(false);
const failed = ref(false);
async function loadMap() {
    enabled.value = true;
    await nextTick();
    try {
        const L = await import("leaflet");
        if (!element.value) return;
        const map = L.map(element.value, { scrollWheelZoom: false }).setView(
            [cms.value.site.latitude, cms.value.site.longitude],
            13,
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        L.circleMarker([cms.value.site.latitude, cms.value.site.longitude], {
            radius: 8,
            color: "#222",
            fillOpacity: 0.8,
        })
            .addTo(map)
            .bindPopup(() => {
                const label = document.createElement("span");
                label.textContent = cms.value.site.map_label;
                return label;
            });
        cleanup = () => map.remove();
    } catch {
        failed.value = true;
    }
}
onBeforeUnmount(() => cleanup());
</script>
<template>
    <div
        v-if="!enabled"
        class="aspect-video rounded-xl bg-secondary flex flex-col items-start justify-center gap-3 p-5"
        data-analytics-ignore
    >
        <p class="text-sm">
            The interactive map connects to OpenStreetMap, which receives your
            IP address.
        </p>
        <button type="button" class="button secondary text-sm" @click="loadMap">
            Load interactive map
        </button>
    </div>
    <p v-else-if="failed" role="status">
        The map could not load. Location: {{ cms.site.map_label }}.
    </p>
    <div
        v-else
        ref="element"
        class="aspect-video rounded-xl overflow-hidden relative z-0"
        role="region"
        :aria-label="`Map of ${cms.site.map_label}`"
    />
</template>
