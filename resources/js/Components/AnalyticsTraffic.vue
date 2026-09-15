<script setup lang="ts">
import { computed, ref } from "vue";
import { ChartArea, ChartColumn, ArrowLeftRight } from "lucide-vue-next";
export type TrafficValues = {
    views: number;
    sessions: number;
    reading: number;
    clicks: number;
};
export type TrafficDay = TrafficValues & {
    day: string;
    previous: TrafficValues | null;
};
const props = defineProps<{ days: TrafficDay[]; comparable: boolean }>();
const metric = ref<keyof TrafficValues>("views");
const mode = ref<"area" | "bars">("area");
const compare = ref(true);
const selected = ref<number | null>(null);
const labels = {
    views: "Page views",
    sessions: "Sessions",
    reading: "Active seconds",
    clicks: "Clicks",
};
const current = computed(() =>
    props.days.map((day) => Number(day[metric.value])),
);
const previous = computed(() =>
    props.days.map((day) => Number(day.previous?.[metric.value] || 0)),
);
const maximum = computed(() =>
    Math.max(
        4,
        Math.ceil(
            Math.max(
                ...current.value,
                ...(props.comparable && compare.value ? previous.value : []),
                0,
            ) / 4,
        ) * 4,
    ),
);
const position = (i: number, value: number) => ({
    x: 12 + (i * 776) / Math.max(1, props.days.length - 1),
    y: 230 - (value / maximum.value) * 208,
});
const line = (values: number[]) =>
    values
        .map((value, i) => {
            const p = position(i, value);
            return `${i ? "L" : "M"}${p.x},${p.y}`;
        })
        .join(" ");
const index = computed(() =>
    Math.min(selected.value ?? props.days.length - 1, props.days.length - 1),
);
const active = computed(() => props.days[index.value]);
const point = computed(() =>
    position(index.value, current.value[index.value] || 0),
);
function inspect(event: PointerEvent) {
    const bounds = (event.currentTarget as SVGElement).getBoundingClientRect();
    selected.value = Math.max(
        0,
        Math.min(
            props.days.length - 1,
            Math.round(
                ((event.clientX - bounds.left) / bounds.width) *
                    (props.days.length - 1),
            ),
        ),
    );
}
function step(direction: number) {
    selected.value = Math.max(
        0,
        Math.min(props.days.length - 1, index.value + direction),
    );
}
const shortDate = (day: string) =>
    new Date(day + "T12:00:00").toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
</script>
<template>
    <div class="an-traffic">
        <div class="an-chart-tools">
            <label class="sr-only" for="traffic-metric">Traffic metric</label>
            <select id="traffic-metric" v-model="metric">
                <option v-for="(label, key) in labels" :key="key" :value="key">
                    {{ label }}
                </option>
            </select>
            <div class="an-chart-modes" aria-label="Chart style">
                <button
                    :aria-pressed="mode === 'area'"
                    aria-label="Area chart"
                    @click="mode = 'area'"
                >
                    <ChartArea :size="17" /></button
                ><button
                    :aria-pressed="mode === 'bars'"
                    aria-label="Bar chart"
                    @click="mode = 'bars'"
                >
                    <ChartColumn :size="17" />
                </button>
            </div>
            <button
                class="an-compare"
                :aria-pressed="compare && comparable"
                :disabled="!comparable"
                @click="compare = !compare"
            >
                <ArrowLeftRight :size="14" />Previous period
            </button>
        </div>
        <div class="an-chart-readout" aria-live="polite">
            <span>{{ active ? shortDate(active.day) : "No dates" }}</span
            ><strong
                >{{ Number(active?.[metric] || 0).toLocaleString() }}
                <small>{{ labels[metric].toLowerCase() }}</small></strong
            ><span v-if="comparable && compare"
                >{{
                    Number(active?.previous?.[metric] || 0).toLocaleString()
                }}
                in the aligned previous day</span
            >
        </div>
        <div class="an-plot">
            <div class="an-scale" aria-hidden="true">
                <span v-for="n in [4, 3, 2, 1, 0]" :key="n">{{
                    Math.round((maximum * n) / 4).toLocaleString()
                }}</span>
            </div>
            <svg
                :key="
                    metric +
                    mode +
                    comparable +
                    compare +
                    days.map((d) => d.day + d[metric]).join()
                "
                viewBox="0 0 800 250"
                preserveAspectRatio="none"
                tabindex="0"
                role="img"
                :aria-label="
                    labels[metric] +
                    ' by day. Use left and right arrow keys to inspect values.'
                "
                @pointermove="inspect"
                @pointerdown="inspect"
                @pointerleave="selected = null"
                @keydown.left.prevent="step(-1)"
                @keydown.right.prevent="step(1)"
            >
                <line
                    v-for="n in [0, 1, 2, 3, 4]"
                    :key="n"
                    x1="0"
                    x2="800"
                    :y1="22 + n * 52"
                    :y2="22 + n * 52"
                    stroke="#e1e5db"
                    stroke-dasharray="3 5"
                />
                <path
                    v-if="comparable && compare"
                    :d="line(previous)"
                    fill="none"
                    stroke="#9ba68e"
                    stroke-dasharray="5 5"
                    stroke-width="2"
                    vector-effect="non-scaling-stroke"
                />
                <template v-if="mode === 'area'">
                    <path
                        :d="line(current) + ' L788,230 L12,230 Z'"
                        fill="#dfe8ba"
                        fill-opacity=".55"
                        class="an-area"
                    />
                    <path
                        :d="line(current)"
                        fill="none"
                        stroke="#53682e"
                        stroke-width="3"
                        vector-effect="non-scaling-stroke"
                        pathLength="1"
                        class="an-draw-line"
                    />
                </template>
                <g v-else>
                    <rect
                        v-for="(value, i) in current"
                        :key="i"
                        :x="
                            position(i, value).x -
                            Math.min(14, 300 / days.length)
                        "
                        :y="position(i, value).y"
                        :width="Math.min(28, 600 / days.length)"
                        :height="Math.max(0, 230 - position(i, value).y)"
                        rx="2"
                        fill="#53682e"
                        class="an-grow-bar"
                        :style="{
                            'animation-delay': Math.min(i * 12, 300) + 'ms',
                        }"
                    />
                </g>
                <line
                    v-if="selected !== null"
                    :x1="point.x"
                    :x2="point.x"
                    y1="18"
                    y2="232"
                    stroke="#53682e"
                    opacity=".45"
                />
                <circle
                    v-if="selected !== null"
                    :cx="point.x"
                    :cy="point.y"
                    r="5"
                    fill="#20251e"
                    stroke="#fff"
                    stroke-width="2"
                />
            </svg>
        </div>
        <div class="an-axis">
            <span>{{ days[0] ? shortDate(days[0].day) : "" }}</span
            ><span>{{
                days.length > 2
                    ? shortDate(days[Math.floor(days.length / 2)].day)
                    : ""
            }}</span
            ><span>{{
                days.length ? shortDate(days[days.length - 1].day) : ""
            }}</span>
        </div>
        <details class="an-exact">
            <summary>Exact daily values</summary>
            <div class="cms-table-wrap">
                <table class="cms-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Views</th>
                            <th>Sessions</th>
                            <th>Active seconds</th>
                            <th>Clicks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="day in days" :key="day.day">
                            <td>{{ day.day }}</td>
                            <td>{{ day.views }}</td>
                            <td>{{ day.sessions }}</td>
                            <td>{{ day.reading }}</td>
                            <td>{{ day.clicks }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </details>
    </div>
</template>
