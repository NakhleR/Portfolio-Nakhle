
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext
} from "@/components/ui/carousel";

export interface ProjectDetails {
    id: string;
    title: string;
    category: string;
    description: string;
    longDescription?: string;
    technologies?: string[];
    images?: string[];
    liveUrl?: string;
    githubUrl?: string;
}

interface ProjectDialogProps {
    project: ProjectDetails | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ProjectDialog = ({ project, open, onOpenChange }: ProjectDialogProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!project) return null;

    const nextImage = () => {
        if (project.images && project.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % project.images!.length);
        }
    };

    const prevImage = () => {
        if (project.images && project.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + project.images!.length) % project.images!.length);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden">
                <ScrollArea className="max-h-[80vh]">
                    {/* Project Images */}
                    {project.images && project.images.length > 0 ? (
                        <div className="relative">
                            <Carousel className="w-full" setApi={(api) => {
                                // Optional: Sync external state with carousel api
                                api?.on('select', () => {
                                    setCurrentImageIndex(api.selectedScrollSnap());
                                });
                            }}>
                                <CarouselContent>
                                    {project.images.map((image, index) => (
                                        <CarouselItem key={index}>
                                            <div className="aspect-video bg-secondary flex items-center justify-center">
                                                <p className="text-muted-foreground">Project screenshot {index + 1}</p>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                                    onClick={() => setCurrentImageIndex(prev =>
                                        (prev - 1 + project.images!.length) % project.images!.length
                                    )}
                                />
                                <CarouselNext
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                                    onClick={() => setCurrentImageIndex(prev =>
                                        (prev + 1) % project.images!.length
                                    )}
                                />
                            </Carousel>

                            {/* Image counter */}
                            <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-md">
                                {currentImageIndex + 1} / {project.images.length}
                            </div>

                            {/* Image navigation dots */}
                            {project.images.length > 1 && (
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                    {project.images.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                                                }`}
                                            onClick={() => setCurrentImageIndex(index)}
                                            aria-label={`View image ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="aspect-video bg-secondary flex items-center justify-center">
                            <p className="text-muted-foreground">No project images</p>
                        </div>
                    )}

                    <div className="p-6">
                        <DialogHeader className="text-left">
                            <DialogTitle className="text-2xl">{project.title}</DialogTitle>
                            <DialogDescription className="text-muted-foreground">{project.category}</DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 space-y-4">
                            {/* Technologies */}
                            {project.technologies && project.technologies.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Technologies</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {project.technologies.map((tech, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Project Description */}
                            <div>
                                <h4 className="text-sm font-medium mb-2">About this project</h4>
                                <p className="text-base text-muted-foreground">{project.longDescription || project.description}</p>
                            </div>

                            {/* Project Links */}
                            {(project.liveUrl || project.githubUrl) && (
                                <div className="flex gap-4 pt-2">
                                    {project.liveUrl && (
                                        <a
                                            href={project.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-foreground hover:underline"
                                        >
                                            View Live
                                        </a>
                                    )}
                                    {project.githubUrl && (
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-foreground hover:underline"
                                        >
                                            GitHub Repo
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default ProjectDialog;