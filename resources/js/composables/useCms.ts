import { computed } from "vue";
import { usePage } from "@inertiajs/vue3";
export interface CmsContent {
    site: {
        name: string;
        tagline: string;
        email: string;
        phone: string;
        address: string;
        github: string;
        linkedin: string;
        availability: string;
        map_label: string;
        latitude: number;
        longitude: number;
    };
    home: {
        hero: string;
        intro: string;
        statement: string;
        statement_body: string;
        caption: string;
        approach: string;
        approach_body: string;
        quote: string;
        quote_author: string;
        services: { title: string; text: string; tools: string }[];
        disciplines: {
            label: string;
            title: string;
            detail: string;
            object: "processor" | "mobile" | "web" | "controller";
        }[];
    };
    about: {
        hero: string;
        title: string;
        biography: string;
        portrait_caption: string;
        journey_title: string;
        skills_title: string;
        skills: {
            name: string;
            items: {
                name: string;
                imagePath: string;
                darkModeInvert: boolean;
            }[];
        }[];
    };
    work: { hero: string; intro: string };
    contact: {
        hero: string;
        intro: string;
        form_title: string;
        details_title: string;
    };
    assets: {
        portrait: string;
        portrait_original: string;
        portrait_srcset: string;
        cv: string;
    };
    [key: string]: unknown;
}
export function useCms() {
    const page = usePage<{ cms: CmsContent }>();
    return computed(() => page.props.cms);
}
