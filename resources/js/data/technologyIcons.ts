type TechnologyIcon = { src: string; monochrome: boolean; brand?: string };

const aliases: Record<string, string> = {
    "c++": "cplusplus",
    blueprints: "unrealengine",
    unrealengine: "unrealengine",
    react: "react",
    reactjs: "react",
    threejs: "threedotjs",
    tailwindcss: "tailwindcss",
    flutter: "flutter",
    net: "dotnet",
    dotnet: "dotnet",
    python: "python",
    pytorch: "pytorch",
    torchvision: "pytorch",
    scikitlearn: "scikitlearn",
    opencv: "opencv",
    streamlit: "streamlit",
    numpy: "numpy",
    pandas: "pandas",
    matplotlib: "matplotlib",
    seaborn: "seaborn",
    cuda: "nvidia",
    tensorboard: "tensorflow",
    typescript: "typescript",
    javascript: "javascript",
    vite: "vite",
    gsap: "gsap",
    reactthreefiber: "reactthreefiber",
    lenis: "lenis",
    cssmodules: "cssmodules",
    radixui: "radixui",
    shadcnui: "shadcnui",
    shadcnvue: "shadcnui",
    reactquery: "reactquery",
    recharts: "recharts",
    reacthookform: "reacthookform",
    zod: "zod",
    i18next: "i18next",
    vuei18n: "vuedotjs",
    emailjs: "emailjs",
    reactrouter: "reactrouter",
    laravel: "laravel",
    vue: "vuedotjs",
    vuejs: "vuedotjs",
    inertiajs: "inertia",
    postgresql: "postgresql",
    tiptap: "tiptap",
    filepond: "filepond",
    spatiepermission: "spatie",
    rekaui: "rekaui",
    chartjs: "chartdotjs",
    php: "php",
    konva: "konva",
    express: "express",
    mongodb: "mongodb",
};
const ecosystemBrands: Record<string, string> = {
    blueprints: "Unreal Engine Blueprints",
    torchvision: "PyTorch ecosystem",
    tensorboard: "TensorFlow ecosystem",
    vuei18n: "Vue ecosystem",
    spatiepermission: "Spatie",
};
const pngIcons = new Set(["lenis", "tiptap", "spatie"]);
const colorIcons = new Set([
    "matplotlib",
    "seaborn",
    "emailjs",
    "recharts",
    ...pngIcons,
]);

export function technologyIcon(technology: string): TechnologyIcon | null {
    const key = technology
        .toLowerCase()
        .replace(/\s+\d+(?:\.\d+)*$/, "")
        .replace(/[^a-z0-9+]/g, "");
    if (key === "bloc") return { src: "/bloc.webp", monochrome: false };
    const slug = aliases[key];
    if (!slug) return null;
    return {
        src: `/technology-icons/${slug}.${pngIcons.has(slug) ? "png" : "svg"}`,
        monochrome: !colorIcons.has(slug),
        brand: ecosystemBrands[key],
    };
}
