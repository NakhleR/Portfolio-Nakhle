<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { ArrowUpRight, LocateFixed, MapPin, Minus, Plus } from "lucide-vue-next";
import type { LatLngTuple, Map as LeafletMap } from "leaflet";
import { useLocale } from "../composables/useLocale";
import { useCms } from "../composables/useCms";
import "leaflet/dist/leaflet.css";

const { locale } = useLocale();
const cms = useCms();
const text = (en: string, fr: string) => locale.value === "fr" ? fr : en;
const element = ref<HTMLElement | null>(null);
const failed = ref(false);
const loading = ref(false);
const ready = ref(false);
const streetZoom = 16;
const centre = (): LatLngTuple => [Number(cms.value.site.latitude), Number(cms.value.site.longitude)];
const mapLink = computed(() => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centre().join(","))}`);
let map: LeafletMap | undefined;
let disposed = false;
let cleanup = () => {};

function resetView() {
    map?.setView(centre(), streetZoom, { animate: false });
}
function zoom(amount: number) {
    map?.setZoom(map.getZoom() + amount, { animate: false });
}
async function loadMap() {
    if (loading.value) return;
    cleanup();
    failed.value = false;
    ready.value = false;
    loading.value = true;
    await nextTick();

    try {
        const L = await import("leaflet");
        if (disposed || !element.value) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const currentMap = L.map(element.value, {
            zoomControl: false,
            scrollWheelZoom: false,
            zoomAnimation: !reducedMotion,
            fadeAnimation: !reducedMotion,
            markerZoomAnimation: !reducedMotion,
        }).setView(centre(), streetZoom);
        map = currentMap;
        const observer = new ResizeObserver(() => {
            const currentCentre = currentMap.getCenter();
            currentMap.invalidateSize({ pan: false });
            currentMap.setView(currentCentre, currentMap.getZoom(), { animate: false });
        });
        const timeout = window.setTimeout(() => {
            if (!ready.value) {
                loading.value = false;
                failed.value = true;
            }
        }, 15000);
        cleanup = () => {
            clearTimeout(timeout);
            observer.disconnect();
            currentMap.remove();
            map = undefined;
        };
        observer.observe(element.value);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).once("tileload", () => {
            clearTimeout(timeout);
            loading.value = false;
            failed.value = false;
            ready.value = true;
        }).addTo(currentMap);

        L.marker(centre(), {
            icon: L.divIcon({
                className: "location-pin",
                html: '<span class="location-pin-dot"></span>',
                iconSize: [28, 28],
                iconAnchor: [14, 14],
            }),
            title: cms.value.site.map_label,
            alt: cms.value.site.map_label,
        }).addTo(currentMap).bindPopup(() => {
            const label = document.createElement("span");
            label.textContent = cms.value.site.map_label;
            return label;
        }, { autoPan: false, closeButton: false, offset: [0, -8] });
        currentMap.invalidateSize({ pan: false });
        resetView();
    } catch (error) {
        cleanup();
        if (import.meta.env.DEV) console.warn("Map could not load", error);
        loading.value = false;
        failed.value = true;
    }
}
onMounted(loadMap);
onBeforeUnmount(() => {
    disposed = true;
    cleanup();
});
</script>

<template>
    <section class="location-map" data-analytics-ignore data-lenis-prevent>
        <div class="map-stage">
            <div ref="element" class="map-canvas" role="region"
                :aria-label="`${text('Map of', 'Carte de')} ${cms.site.map_label}`" :aria-busy="loading" />
            <div v-if="failed" class="map-error">
                <MapPin :size="26" :stroke-width="1.25" aria-hidden="true" />
                <p role="status">{{ text('The map could not load. You can retry or open the location below.', 'La carte n’a pas pu charger. Réessayez ou ouvrez le lien ci-dessous.') }}</p>
                <button type="button" class="map-load" @click="loadMap">
                    {{ text('Try again', 'Réessayer') }}
                    <ArrowUpRight :size="16" aria-hidden="true" />
                </button>
            </div>
            <p v-if="loading" class="map-loading" role="status">{{ text('Loading map…', 'Chargement de la carte…') }}</p>
            <div v-if="ready && !failed" class="map-controls" role="group" :aria-label="text('Map controls', 'Commandes de la carte')">
                <button type="button" @click="zoom(1)" :aria-label="text('Zoom in', 'Zoom avant')" :title="text('Zoom in', 'Zoom avant')"><Plus :size="18" aria-hidden="true" /></button>
                <button type="button" @click="zoom(-1)" :aria-label="text('Zoom out', 'Zoom arrière')" :title="text('Zoom out', 'Zoom arrière')"><Minus :size="18" aria-hidden="true" /></button>
                <button type="button" @click="resetView" :aria-label="text('Recenter on the pin', 'Recentrer sur le repère')" :title="text('Recenter on the pin', 'Recentrer sur le repère')"><LocateFixed :size="18" :stroke-width="1.5" aria-hidden="true" /></button>
            </div>
        </div>
        <div class="map-caption">
            <div class="map-address">
                <MapPin :size="16" :stroke-width="1.5" aria-hidden="true" />
                <span>{{ cms.site.map_label }}</span>
            </div>
            <a :href="mapLink" target="_blank" rel="noopener noreferrer">
                {{ text('Open in Google Maps', 'Ouvrir dans Google Maps') }}
                <ArrowUpRight :size="15" aria-hidden="true" />
            </a>
        </div>
    </section>
</template>

<style scoped>
.location-map { overflow: hidden; border: 1px solid hsl(var(--border)); border-radius: 8px; background: hsl(var(--background)); }
.map-stage { position: relative; height: 400px; isolation: isolate; background: hsl(var(--secondary)); }
.map-canvas { position: absolute; inset: 0; z-index: 0; background: hsl(var(--secondary)); font-family: inherit; }
.map-error { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 32px; text-align: center; background: hsl(var(--secondary)); }
.map-error p { max-width: 34ch; font-size: 13px; line-height: 1.7; color: hsl(var(--muted-foreground)); }
.map-load { display: inline-flex; align-items: center; gap: 20px; min-height: 44px; padding: 10px 16px; margin-top: 4px; border: 1px solid hsl(var(--foreground) / 0.3); border-radius: 4px; font-size: 12px; }
.map-load:hover { background: hsl(var(--background)); }
.map-loading { position: absolute; top: 16px; left: 16px; z-index: 2; padding: 10px 14px; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); font-size: 12px; }
.map-controls { position: absolute; top: 16px; right: 16px; z-index: 1; display: flex; flex-direction: column; overflow: hidden; border: 1px solid hsl(var(--border)); border-radius: 4px; background: hsl(var(--background)); }
.map-controls button { display: grid; place-items: center; width: 44px; height: 44px; color: hsl(var(--foreground)); }
.map-controls button + button { border-top: 1px solid hsl(var(--border)); }
.map-controls button:hover { background: hsl(var(--accent)); }
.map-controls button:focus-visible, .map-load:focus-visible, .map-caption a:focus-visible { outline: 2px solid hsl(var(--foreground)); outline-offset: -3px; }
.map-caption { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; padding: 18px 20px; border-top: 1px solid hsl(var(--border)); font-size: 12px; }
.map-address, .map-caption a { display: flex; align-items: center; gap: 9px; }
.map-address svg { flex-shrink: 0; }
.map-caption a { min-height: 28px; color: hsl(var(--muted-foreground)); text-underline-offset: 4px; }
.map-caption a:hover { color: hsl(var(--foreground)); text-decoration: underline; }
.map-canvas :deep(.leaflet-tile-pane) { filter: grayscale(1) contrast(0.9) brightness(1.06); }
:global(.dark .location-map .leaflet-tile-pane) { filter: grayscale(1) invert(1) brightness(0.8); }
.map-canvas :deep(.location-pin) { display: grid; place-items: center; border-radius: 50%; background: hsl(var(--foreground) / 0.15); }
.map-canvas :deep(.location-pin-dot) { width: 14px; height: 14px; border: 3px solid hsl(var(--background)); border-radius: 50%; background: hsl(var(--foreground)); box-shadow: 0 0 0 1px hsl(var(--foreground) / 0.35); }
.map-canvas :deep(.leaflet-popup-content-wrapper), .map-canvas :deep(.leaflet-popup-tip) { border-radius: 4px; background: hsl(var(--background)); color: hsl(var(--foreground)); box-shadow: 0 2px 10px hsl(var(--foreground) / 0.1); }
.map-canvas :deep(.leaflet-popup-content) { margin: 12px 16px; font-size: 12px; }
.map-canvas :deep(.leaflet-control-attribution) { font-family: inherit; font-size: 10px; background: hsl(var(--background) / 0.9); color: hsl(var(--muted-foreground)); }
.map-canvas :deep(.leaflet-control-attribution a) { color: inherit; text-decoration: underline; }
@media (max-width: 600px) {
    .map-stage { height: 340px; }
    .map-caption { padding: 14px 16px; gap: 4px; flex-direction: column; align-items: flex-start; }
    .map-error { padding: 24px; }
}
</style>
