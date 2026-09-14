import { createInertiaApp } from "@inertiajs/vue3";
import createServer from "@inertiajs/vue3/server";
import { createSSRApp, h, type DefineComponent } from "vue";
import { renderToString } from "vue/server-renderer";

const pages = import.meta.glob<{ default: DefineComponent }>(
    "./Pages/**/*.vue",
);

createServer(
    (page) =>
        createInertiaApp({
            page,
            render: renderToString,
            title: (title) => title || "Nakhle Rizk — Portfolio",
            resolve: async (name) =>
                (await pages[`./Pages/${name}.vue`]()).default,
            setup: ({ App, props, plugin }) =>
                createSSRApp({ render: () => h(App, props) }).use(plugin),
        }),
    { host: "127.0.0.1" },
);
