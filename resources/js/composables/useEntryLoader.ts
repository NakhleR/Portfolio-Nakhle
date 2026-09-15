import {
    computed,
    inject,
    onBeforeUnmount,
    onMounted,
    provide,
    ref,
    type InjectionKey,
    type Ref,
} from "vue";

type EntryLoader = { entry: Ref<boolean>; register: () => () => void };
const entryLoaderKey: InjectionKey<EntryLoader> = Symbol("entry-loader");

export function provideEntryLoader(root: Ref<HTMLElement | null>) {
    const entry = ref(false);
    const pending = ref(0);
    function register() {
        pending.value++;
        let settled = false;
        return () => {
            if (settled) return;
            settled = true;
            pending.value--;
        };
    }
    provide(entryLoaderKey, { entry, register });
    const contentReady = register();
    const abort = new AbortController();
    onMounted(async () => {
        if (!entry.value) {
            contentReady();
            return;
        }
        const images = Array.from(
            root.value?.querySelectorAll<HTMLImageElement>("main img") ?? [],
        );
        await Promise.allSettled([
            document.fonts.ready,
            ...images.map(async (image) => {
                image.loading = "eager";
                if (!image.complete) {
                    await new Promise<void>((resolve) => {
                        const done = () => {
                            image.removeEventListener("load", done);
                            image.removeEventListener("error", done);
                            abort.signal.removeEventListener("abort", done);
                            resolve();
                        };
                        image.addEventListener("load", done, { once: true });
                        image.addEventListener("error", done, { once: true });
                        abort.signal.addEventListener("abort", done, {
                            once: true,
                        });
                    });
                }
                if (image.naturalWidth) await image.decode().catch(() => {});
            }),
        ]);
        contentReady();
    });
    onBeforeUnmount(() => abort.abort());
    return { entry, ready: computed(() => pending.value === 0) };
}

export function useEntryAsset() {
    const loader = inject(entryLoaderKey, undefined);
    const complete = loader?.register() ?? (() => {});
    onBeforeUnmount(complete);
    return { entry: loader?.entry ?? ref(false), complete };
}
