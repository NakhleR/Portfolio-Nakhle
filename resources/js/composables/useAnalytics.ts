import { onMounted, onBeforeUnmount, type Ref } from "vue";
import { usePage } from "@inertiajs/vue3";
export function useAnalytics(root: Ref<HTMLElement | null>) {
    const page = usePage<{
        privacy: { analytics: boolean | null };
        auth: { user: unknown };
    }>();
    let alive = true;
    let allowed = false;
    let stop: ((flushPending?: boolean) => void) | undefined;
    async function update(value: boolean) {
        allowed = value;
        stop?.();
        stop = undefined;
        if (!allowed || page.props.auth.user || !root.value) return;
        const { startAnalytics } = await import("../analytics/tracker");
        if (alive && allowed && root.value && !stop)
            stop = startAnalytics(root.value);
    }
    function consent(event: Event) {
        void update((event as CustomEvent<boolean>).detail);
    }
    onMounted(() => {
        window.addEventListener("portfolio-consent", consent);
        void update(page.props.privacy.analytics === true);
    });
    onBeforeUnmount(() => {
        alive = false;
        allowed = false;
        window.removeEventListener("portfolio-consent", consent);
        stop?.(true);
    });
}
