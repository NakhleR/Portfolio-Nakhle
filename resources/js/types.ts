export interface Media {
    alt?: string;
    id: number;
    url: string;
    name: string;
}
export interface Project {
    is_published?: boolean;
    id: string;
    title: string;
    category: string;
    description: string;
    longDescription: string | null;
    technologies: string[];
    images: string[];
    imageVariants?: { src: string; srcset: string; alt?: string; width?: number | null; height?: number | null }[];
    media: Media[];
    liveUrl: string | null;
    githubUrl: string | null;
    order: number;
}
export type ProjectCardData = Pick<
    Project,
    | "id"
    | "title"
    | "category"
    | "description"
    | "technologies"
    | "images"
    | "imageVariants"
>;

export interface TimelineItem {
    id: string;
    year: string;
    title: string;
    category: string;
    location: string | null;
    description: string | null;
    bullets: string[];
    order: number;
}
