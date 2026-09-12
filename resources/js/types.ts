export interface Media {
    id: number;
    url: string;
    name: string;
}
export interface Project {
    id: string;
    title: string;
    category: string;
    description: string;
    longDescription: string | null;
    technologies: string[];
    images: string[];
    media: Media[];
    liveUrl: string | null;
    githubUrl: string | null;
    order: number;
}
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
