import "../css/app.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import { createApp, h, type DefineComponent } from "vue";
import { createInertiaApp } from "@inertiajs/vue3";
const pages = import.meta.glob<{ default: DefineComponent }>(
    "./Pages/**/*.vue",
);
createInertiaApp({
    title: (title) =>
        title ? title + " — Nakhle Rizk" : "Nakhle Rizk — Portfolio",
    resolve: async (name) =>
        (await pages["./Pages/" + name + ".vue"]()).default,
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .mount(el);
    },
    progress: { color: "#777" },
});
