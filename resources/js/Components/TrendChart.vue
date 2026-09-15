<script setup lang="ts">
import { computed, ref } from "vue";
export interface TrendDay {
    day: string;
    views: number;
    sessions?: number;
}
const props = defineProps<{ days: TrendDay[] }>();
const metric = ref<"views" | "sessions">("views");
const selected = ref<number | null>(null);
const values = computed(() =>
    props.days.map((d) => Number(d[metric.value] || 0)),
);
const maximum = computed(() =>
    Math.max(3, Math.ceil(Math.max(0, ...values.value) / 3) * 3),
);
const points = computed(() =>
    values.value.map((value, i) => ({
        x: 40 + (i * 720) / Math.max(1, values.value.length - 1),
        y: 190 - (value / maximum.value) * 150,
        value,
    })),
);
const line = computed(() =>
    points.value.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" "),
);
const detail = computed(
    () => props.days[selected.value ?? props.days.length - 1],
);
</script>
<template>
    <div>
        <div class="cms-toolbar">
            <button
                type="button"
                v-for="key in ['views', 'sessions'] as const"
                :key="key"
                class="cms-button"
                :class="{ secondary: metric !== key }"
                :aria-pressed="metric === key"
                @click="metric = key"
            >
                {{ key === "views" ? "Page views" : "Sessions" }}
            </button>
        </div>
        <div v-if="days.length" class="cms-chart-frame">
            <div class="cms-chart-scale" aria-hidden="true">
                <span v-for="step in [0, 1, 2, 3]" :key="step">{{
                    Math.round(maximum * (1 - step / 3))
                }}</span>
            </div>
            <svg
                class="cms-chart"
                viewBox="25 25 750 180"
                preserveAspectRatio="none"
                role="img"
                :aria-label="`${metric} per day; exact values in the table below`"
            >
                <g v-for="step in [0, 1, 2, 3]" :key="step">
                    <line
                        x1="40"
                        x2="760"
                        :y1="40 + step * 50"
                        :y2="40 + step * 50"
                        stroke="#d9ddd2"
                        stroke-dasharray="3 5"
                    />
                </g>
                <path
                    :d="line + ' L760,190 L40,190 Z'"
                    fill="#53682e"
                    fill-opacity="0.06"
                    aria-hidden="true"
                />
                <path
                    :d="line"
                    fill="none"
                    stroke="#53682e"
                    stroke-width="3"
                    vector-effect="non-scaling-stroke"
                    stroke-linejoin="round"
                />
                <circle
                    v-for="(point, i) in points"
                    :key="i"
                    :cx="point.x"
                    :cy="point.y"
                    r="10"
                    fill="transparent"
                    tabindex="0"
                    :aria-label="`${days[i].day}: ${point.value} ${metric}`"
                    @mouseenter="selected = i"
                    @focus="selected = i"
                />
                <circle
                    v-if="selected !== null && points[selected]"
                    :cx="points[selected].x"
                    :cy="points[selected].y"
                    r="5"
                    fill="#53682e"
                />
            </svg>
        </div>
        <div class="flex justify-between cms-muted mt-2">
            <span>{{ days[0]?.day }}</span
            ><span>{{ days[days.length - 1]?.day }}</span>
        </div>
        <p class="cms-chart-detail mt-4">
            {{
                detail
                    ? `${detail.day}: ${Number(detail[metric] || 0)} ${metric}`
                    : "No traffic in this period."
            }}
        </p>
        <details class="mt-4">
            <summary class="cms-muted cursor-pointer">
                View exact daily values
            </summary>
            <div class="cms-table-wrap">
                <table class="cms-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Page views</th>
                            <th>Sessions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="day in days" :key="day.day">
                            <td>{{ day.day }}</td>
                            <td>{{ day.views }}</td>
                            <td>{{ day.sessions || 0 }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </details>
    </div>
</template>
