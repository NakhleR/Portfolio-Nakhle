import { computed } from "vue";
import { usePage } from "@inertiajs/vue3";
import { french } from "../data/french";

export function useLocale() {
    const page = usePage<{ locale: string }>();
    const locale = computed(() => page.props.locale === "fr" ? "fr" : "en");
    const t = (text: string) => locale.value === "fr" ? french[text.trim().replace(/\s+/g, " ")] ?? text : text;
    const localPath = (path: string) => locale.value === "fr" ? `/fr${path === "/" ? "" : path}` : path;
    const switchPath = computed(() => {
        const path = page.url.split(/[?#]/)[0];
        return locale.value === "fr" ? path.replace(/^\/fr(?=\/|$)/, "") || "/" : `/fr${path === "/" ? "" : path}`;
    });
    return { locale, t, localPath, switchPath };
}
