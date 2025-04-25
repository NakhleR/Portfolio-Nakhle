import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    type CarouselApi
} from "@/components/ui/carousel";

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface ProjectDetails {
    id?: string;
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
    const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
    const [imageAspectRatios, setImageAspectRatios] = useState<Record<number, number>>({});
    const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

    const isMobileScreenshot = (index: number): boolean => {
        // Mobile screenshots typically have tall aspect ratios (height > width)
        // This is more reliable than checking filenames
        const aspectRatio = imageAspectRatios[index];
        if (!aspectRatio) return false;

        // If height is significantly greater than width (aspect ratio < 0.7)
        // or if it matches typical mobile proportions
        return aspectRatio < 0.7;
    };

    const handleImageLoad = (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.target as HTMLImageElement;
        if (img.naturalWidth && img.naturalHeight) {
            setImageAspectRatios(prev => ({
                ...prev,
                [index]: img.naturalWidth / img.naturalHeight
            }));
        }
    };

    useEffect(() => {
        if (!carouselApi) return;

        const handleSelect = () => {
            setCurrentImageIndex(carouselApi.selectedScrollSnap());
        };

        carouselApi.on("select", handleSelect);
        return () => {
            carouselApi.off("select", handleSelect);
        };
    }, [carouselApi]);

    if (!project) return null;

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '';

        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        if (imagePath.startsWith('/uploads')) {
            return `${API_URL}${imagePath}`;
        }
        if (imagePath.includes('/uploads')) {
            const fixedPath = imagePath.substring(imagePath.indexOf('/uploads'));
            return `${API_URL}${fixedPath}`;
        }
        return imagePath;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden">
                <ScrollArea className="max-h-[80vh]">
                    {project.images && project.images.length > 0 ? (
                        <div className="relative">
                            <Carousel className="w-full" setApi={setCarouselApi}>
                                <CarouselContent>
                                    {project.images.map((image, index) => (
                                        <CarouselItem key={index}>
                                            <div
                                                className={`bg-secondary flex items-center justify-center overflow-hidden ${isMobileScreenshot(index)
                                                    ? 'min-h-[500px] flex items-center justify-center'
                                                    : 'aspect-video'
                                                    }`}
                                            >
                                                {isMobileScreenshot(index) ? (
                                                    <div className="mobile-frame relative bg-black rounded-[30px] p-2 shadow-xl overflow-hidden w-[290px] min-h-[480px] flex items-center justify-center">
                                                        <img
                                                            ref={el => imageRefs.current[index] = el}
                                                            src={getImageUrl(image)}
                                                            alt={`${project.title} - Image ${index + 1}`}
                                                            className="w-full h-full object-contain rounded-[20px]"
                                                            onLoad={(e) => handleImageLoad(index, e)}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <img
                                                        ref={el => imageRefs.current[index] = el}
                                                        src={getImageUrl(image)}
                                                        alt={`${project.title} - Image ${index + 1}`}
                                                        className="w-full h-full max-h-[70vh] object-cover"
                                                        onLoad={(e) => handleImageLoad(index, e)}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                                />
                                <CarouselNext
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                                />
                            </Carousel>
                            {project.images.length > 0 && (
                                <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-md">
                                    {currentImageIndex + 1} / {project.images.length}
                                </div>
                            )}
                            {project.images.length > 1 && (
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                    {project.images.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                                                }`}
                                            onClick={() => carouselApi?.scrollTo(index)}
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
                            <div>
                                <h4 className="text-sm font-medium mb-2">About this project</h4>
                                <p className="text-base text-muted-foreground">{project.longDescription || project.description}</p>
                            </div>
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