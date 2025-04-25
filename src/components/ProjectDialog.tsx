import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    type CarouselApi
} from "@/components/ui/carousel";

// Use environment variable for base API URL with fallback to localhost for development
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
    const [zoomedImage, setZoomedImage] = useState<number | null>(null);

    // Function to detect if an image is a mobile screenshot
    // This checks if the image filename contains mobile-related keywords
    // or if it has a portrait aspect ratio typical of mobile screenshots
    const isMobileScreenshot = (imagePath: string): boolean => {
        // Check filename for mobile indicators
        const lowerPath = imagePath.toLowerCase();
        const mobileKeywords = ['mobile', 'phone', 'smartphone', 'iphone', 'android'];
        const hasMobileKeyword = mobileKeywords.some(keyword => lowerPath.includes(keyword));

        // If the filename contains mobile keywords, it's likely a mobile screenshot
        return hasMobileKeyword;
    };

    // Toggle zoom state for an image
    const toggleZoom = (index: number) => {
        setZoomedImage(zoomedImage === index ? null : index);
    };

    // Reset zoom when carousel changes or dialog closes
    useEffect(() => {
        setZoomedImage(null);
    }, [currentImageIndex, open]);

    // Update currentImageIndex when carousel changes
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

    // Helper function to get the full URL for an image path
    const getImageUrl = (imagePath: string) => {
        // If the image path is empty, return empty string
        if (!imagePath) return '';

        // If the image is already a full URL (including Cloudinary URLs), return it
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        // If it's a path starting with /uploads, prepend the API URL
        if (imagePath.startsWith('/uploads')) {
            return `${API_URL}${imagePath}`;
        }
        // If it contains /uploads but doesn't start with it
        if (imagePath.includes('/uploads')) {
            // Remove any leading slashes before /uploads to ensure correct path
            const fixedPath = imagePath.substring(imagePath.indexOf('/uploads'));
            return `${API_URL}${fixedPath}`;
        }
        // Default case, just return the image path
        return imagePath;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden">
                <ScrollArea className="max-h-[80vh]">
                    {/* Project Images */}
                    {project.images && project.images.length > 0 ? (
                        <div className="relative">
                            <Carousel className="w-full" setApi={setCarouselApi}>
                                <CarouselContent className={zoomedImage !== null ? 'pointer-events-none' : ''}>
                                    {project.images.map((image, index) => (
                                        <CarouselItem key={index}>
                                            <div
                                                className={`bg-secondary flex items-center justify-center overflow-hidden ${zoomedImage === index ? 'fixed inset-0 z-50 bg-background/90' : 'aspect-video'}`}
                                                onClick={() => isMobileScreenshot(image) && toggleZoom(index)}
                                            >
                                                <img
                                                    src={getImageUrl(image)}
                                                    alt={`${project.title} - Image ${index + 1}`}
                                                    className={`
                                                        ${zoomedImage === index ? 'max-h-[90vh] max-w-[90%] object-contain cursor-zoom-out' : 'max-h-[70vh]'}
                                                        ${isMobileScreenshot(image) && zoomedImage !== index ? 'object-contain h-full max-w-[85%] mx-auto cursor-zoom-in' : ''}
                                                        ${!isMobileScreenshot(image) && zoomedImage !== index ? 'w-full h-full object-cover' : ''}
                                                        transition-transform duration-200
                                                    `}
                                                    onError={(e) => {
                                                        // Fallback if image fails to load
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                                                    }}
                                                />
                                                {isMobileScreenshot(image) && zoomedImage !== index && (
                                                    <div className="absolute bottom-2 left-2 bg-background/80 text-xs px-2 py-1 rounded-md text-foreground">
                                                        Tap to zoom
                                                    </div>
                                                )}
                                                {zoomedImage === index && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleZoom(index);
                                                        }}
                                                        className="absolute top-4 right-4 bg-background/80 hover:bg-background p-2 rounded-full text-foreground"
                                                        aria-label="Close zoom view"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious
                                    className={`absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 ${zoomedImage !== null ? 'hidden' : ''}`}
                                />
                                <CarouselNext
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 ${zoomedImage !== null ? 'hidden' : ''}`}
                                />
                            </Carousel>

                            {/* Image counter */}
                            {zoomedImage === null && (
                                <div className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded-md">
                                    {currentImageIndex + 1} / {project.images.length}
                                </div>
                            )}

                            {/* Image navigation dots */}
                            {project.images.length > 1 && zoomedImage === null && (
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