<script setup lang="ts">
import { computed } from "vue";
import { usePage } from "@inertiajs/vue3";
import { useLocale } from "../composables/useLocale";
import { loadGoogleMaps, type Map3D } from "../composables/googleMaps";
const { locale } = useLocale();
const page = usePage<{ mapsKey?: string }>();
const mapsKey = computed(() => page.props.mapsKey || "");
const text = (en: string, fr: string) => locale.value === "fr" ? fr : en;
import { useCms } from "../composables/useCms";
const cms = useCms();
import { ref, nextTick, onBeforeUnmount } from "vue";
import "leaflet/dist/leaflet.css";
const element = ref<HTMLElement | null>(null);
let cleanup = () => {};
const enabled = ref(false);
const failed = ref(false);
const loading = ref(false);
const aerial = ref(false);
let disposed = false;
let map3d: Map3D | undefined;
const centre = () => ({ lat: Number(cms.value.site.latitude), lng: Number(cms.value.site.longitude), altitude: 0 });
const mapLink = computed(() => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cms.value.site.latitude},${cms.value.site.longitude}`)}`);
function mapError() { failed.value = true; loading.value = false; }
function resetView() {
    if (!map3d) return;
    map3d.center = centre(); map3d.range = 1600; map3d.tilt = 60; map3d.heading = 20;
}
function zoom(factor: number) { if (map3d) map3d.range = Math.max(100, Math.min(100000, map3d.range * factor)); }
function rotate() { if (map3d) map3d.heading = (map3d.heading + 45) % 360; }
function tilt() { if (map3d) map3d.tilt = map3d.tilt > 10 ? 0 : 60; }
async function loadMap() {
    if (loading.value) return;
    failed.value = false;
    enabled.value = true;
    loading.value = true;
    cleanup();
    await nextTick();
    try {
        if (mapsKey.value) {
            window.addEventListener("portfolio-map-error", mapError);
            const { Map3DElement, Marker3DElement } = await loadGoogleMaps(mapsKey.value, locale.value);
            if (disposed || !element.value) return;
            map3d = new Map3DElement({ center: centre(), tilt: 60, heading: 20, range: 1600, mode: "HYBRID", gestureHandling: "COOPERATIVE", language: locale.value, region: "FR" });
            map3d.style.width = "100%";
            map3d.style.height = "100%";
            map3d.addEventListener("gmp-error", mapError);
            map3d.append(new Marker3DElement({ position: centre(), altitudeMode: "CLAMP_TO_GROUND", label: cms.value.site.map_label }));
            element.value.replaceChildren(map3d);
            aerial.value = true;
            cleanup = () => { map3d?.remove(); map3d = undefined; window.removeEventListener("portfolio-map-error", mapError); };
            return;
        }
        const L = await import("leaflet");
        if (disposed || !element.value) return;
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
    } catch (error) {
        if (import.meta.env.DEV) console.warn("Map could not load", error);
        failed.value = true;
    } finally {
        loading.value = false;
    }
}
onBeforeUnmount(() => { disposed = true; cleanup(); window.removeEventListener("portfolio-map-error", mapError); });
</script>
<template>
    <section class="location-map" data-analytics-ignore data-lenis-prevent>
        <div v-if="!enabled" class="map-consent">
            <span class="text-xs uppercase tracking-widest">{{ cms.site.map_label }}</span>
            <h3 class="text-2xl">{{ mapsKey ? text('Explore Rouen from above.', 'Découvrez Rouen vue du ciel.') : text('Explore Rouen.', 'Découvrez Rouen.') }}</h3>
            <p class="text-sm">{{ text('Loading this interactive map connects to', 'Le chargement de cette carte contacte') }} {{ mapsKey ? 'Google Maps' : 'OpenStreetMap' }}{{ text(', which receives your IP address.', ', qui reçoit votre adresse IP.') }}</p>
            <button type="button" class="button secondary text-sm" @click="loadMap">{{ mapsKey ? text('Load 3D map', 'Charger la carte 3D') : text('Load interactive map', 'Charger la carte interactive') }}</button>
        </div>
        <template v-else>
            <p v-if="loading" role="status" class="p-4">{{ text('Loading map…', 'Chargement de la carte…') }}</p>
            <div v-if="failed" role="status" class="map-consent">
                <p>{{ text('The map could not load on this device.', 'La carte n’a pas pu se charger sur cet appareil.') }}</p>
                <button type="button" class="button secondary" @click="loadMap">{{ text('Try again', 'Réessayer') }}</button>
            </div>
            <div v-show="!failed" ref="element" class="map-canvas" role="region" :aria-label="`${text('Map of', 'Carte de')} ${cms.site.map_label}`" :aria-busy="loading" />
            <div v-if="aerial && !failed" class="map-controls" :aria-label="text('Map controls', 'Commandes de la carte')">
                <button type="button" @click="zoom(0.7)" :aria-label="text('Zoom in', 'Zoom avant')">+</button>
                <button type="button" @click="zoom(1.4)" :aria-label="text('Zoom out', 'Zoom arrière')">−</button>
                <button type="button" @click="rotate">{{ text('Rotate', 'Tourner') }}</button>
                <button type="button" @click="tilt">2D / 3D</button>
                <button type="button" @click="resetView">{{ text('Reset view', 'Recentrer') }}</button>
            </div>
        </template>
        <div class="map-caption">
            <span>{{ cms.site.map_label }}</span>
            <a :href="mapLink" target="_blank" rel="noopener noreferrer">{{ text('Open in Google Maps ↗', 'Ouvrir dans Google Maps ↗') }}</a>
        </div>
    </section>
</template>
<style scoped>
.location-map { overflow: hidden; border: 1px solid hsl(var(--border)); border-radius: 16px; background: hsl(var(--secondary)); }
.map-consent { min-height: 300px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 18px; padding: 28px; }
.map-canvas { height: 420px; width: 100%; position: relative; z-index: 0; }
.map-caption, .map-controls { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; font-size: 12px; }
.map-caption a { text-decoration: underline; text-underline-offset: 3px; }
.map-controls { justify-content: flex-start; border-bottom: 1px solid hsl(var(--border)); }
.map-controls button { min-height: 44px; min-width: 44px; padding: 8px 12px; border: 1px solid hsl(var(--border)); border-radius: 6px; background: hsl(var(--background)); }
@media(max-width: 600px) { .map-canvas { height: 360px; } }
</style>
