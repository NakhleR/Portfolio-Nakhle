import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getTimelineItems, getProjects, createTimelineItem, updateTimelineItem, deleteTimelineItem, createProject, updateProject, deleteProject } from '@/lib/api';
import { TimelineItem } from '@/components/Timeline';
import { ProjectDetails } from '@/components/ProjectDialog';
import { PlusCircle, Edit, Trash2, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Define interfaces for form data
interface TimelineFormData {
    year: string;
    title: string;
    location: string;
    category: 'education' | 'work' | 'project';
    description: string;
    bullets: string[];
}

interface ProjectFormData {
    title: string;
    category: string;
    description: string;
    longDescription: string;
    technologies: string[];
    images: string[];
    liveUrl: string;
    githubUrl: string;
}

const Dashboard = () => {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('timeline');

    const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
    const [projects, setProjects] = useState<ProjectDetails[]>([]);
    const [fetchLoading, setFetchLoading] = useState(true);

    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineItem | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null);

    // Check if user is authenticated and admin
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [loading, isAuthenticated, navigate]);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetchLoading(true);

                if (activeTab === 'timeline') {
                    const timelineData = await getTimelineItems();
                    setTimelineItems(timelineData);
                } else {
                    const projectsData = await getProjects();
                    setProjects(projectsData);
                }
            } catch (error) {
                console.error(`Error fetching ${activeTab} data:`, error);
                toast.error(`Failed to load ${activeTab} data`);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchData();
    }, [activeTab]);

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Timeline CRUD operations
    const handleAddTimelineItem = () => {
        setSelectedTimelineItem(null);
        setIsTimelineModalOpen(true);
    };

    const handleEditTimelineItem = (item: TimelineItem) => {
        setSelectedTimelineItem(item);
        setIsTimelineModalOpen(true);
    };

    const handleDeleteTimelineItem = async (id: string) => {
        try {
            await deleteTimelineItem(id);
            setTimelineItems(timelineItems.filter(item => item.id !== id));
            toast.success('Timeline item deleted successfully');
        } catch (error) {
            console.error('Error deleting timeline item:', error);
            toast.error('Failed to delete timeline item');
        }
    };

    const handleTimelineSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const timelineData: TimelineFormData = {
            year: formData.get('year') as string,
            title: formData.get('title') as string,
            location: formData.get('location') as string,
            category: formData.get('category') as 'education' | 'work' | 'project',
            description: formData.get('description') as string,
            bullets: formData.get('bullets') ? (formData.get('bullets') as string).split('\n').filter(Boolean) : [],
        };

        try {
            if (selectedTimelineItem?.id) {
                // Update existing item
                await updateTimelineItem(selectedTimelineItem.id, timelineData);
                setTimelineItems(timelineItems.map(item =>
                    item.id === selectedTimelineItem.id ? { ...item, ...timelineData, id: selectedTimelineItem.id } : item
                ));
                toast.success('Timeline item updated successfully');
            } else {
                // Create new item
                const newTimelineItem = await createTimelineItem(timelineData);
                setTimelineItems([...timelineItems, { ...newTimelineItem, id: newTimelineItem._id }]);
                toast.success('Timeline item created successfully');
            }
            setIsTimelineModalOpen(false);
        } catch (error) {
            console.error('Error saving timeline item:', error);
            toast.error('Failed to save timeline item');
        }
    };

    // Project CRUD operations
    const handleAddProject = () => {
        setSelectedProject(null);
        setIsProjectModalOpen(true);
    };

    const handleEditProject = (project: ProjectDetails) => {
        setSelectedProject(project);
        setIsProjectModalOpen(true);
    };

    const handleDeleteProject = async (id: string) => {
        try {
            await deleteProject(id);
            setProjects(projects.filter(project => project.id !== id));
            toast.success('Project deleted successfully');
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error('Failed to delete project');
        }
    };

    const handleProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const projectData: ProjectFormData = {
            title: formData.get('title') as string,
            category: formData.get('category') as string,
            description: formData.get('description') as string,
            longDescription: formData.get('longDescription') as string,
            technologies: formData.get('technologies') ? (formData.get('technologies') as string).split(',').map(tech => tech.trim()) : [],
            images: formData.get('images') ? (formData.get('images') as string).split(',').map(img => img.trim()) : [],
            liveUrl: formData.get('liveUrl') as string,
            githubUrl: formData.get('githubUrl') as string,
        };

        try {
            if (selectedProject?.id) {
                // Update existing project
                await updateProject(selectedProject.id, projectData);
                setProjects(projects.map(project =>
                    project.id === selectedProject.id ? { ...project, ...projectData, id: selectedProject.id } : project
                ));
                toast.success('Project updated successfully');
            } else {
                // Create new project
                const newProjectItem = await createProject(projectData);
                setProjects([...projects, { ...newProjectItem, id: newProjectItem._id }]);
                toast.success('Project created successfully');
            }
            setIsProjectModalOpen(false);
        } catch (error) {
            console.error('Error saving project:', error);
            toast.error('Failed to save project');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-background py-4 border-b border-border">
                <div className="container">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                                Logged in as: <span className="font-semibold">{user?.email}</span>
                            </span>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" /> Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container py-8">
                <Tabs defaultValue="timeline" value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex justify-between items-center mb-6">
                        <TabsList>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                            <TabsTrigger value="projects">Projects</TabsTrigger>
                        </TabsList>

                        <Button onClick={activeTab === 'timeline' ? handleAddTimelineItem : handleAddProject}>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add {activeTab === 'timeline' ? 'Timeline Item' : 'Project'}
                        </Button>
                    </div>

                    <TabsContent value="timeline" className="space-y-4">
                        {fetchLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                            </div>
                        ) : timelineItems.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No timeline items found. Click the Add button to create one.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {timelineItems.map((item) => (
                                    <Card key={item.id} className="relative">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle>{item.title}</CardTitle>
                                                    <CardDescription>{item.year}</CardDescription>
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditTimelineItem(item)}>
                                                                <Edit className="w-4 h-4 mr-2" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTimelineItem(item.id!)}>
                                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex">
                                                    <span className="text-sm font-medium w-24">Category:</span>
                                                    <span className="text-sm capitalize">{item.category}</span>
                                                </div>
                                                {item.location && (
                                                    <div className="flex">
                                                        <span className="text-sm font-medium w-24">Location:</span>
                                                        <span className="text-sm">{item.location}</span>
                                                    </div>
                                                )}
                                                {item.description && (
                                                    <div className="flex">
                                                        <span className="text-sm font-medium w-24">Description:</span>
                                                        <span className="text-sm">{item.description}</span>
                                                    </div>
                                                )}
                                                {item.bullets && item.bullets.length > 0 && (
                                                    <div>
                                                        <span className="text-sm font-medium">Bullets:</span>
                                                        <ul className="list-disc list-inside text-sm mt-1 pl-2">
                                                            {item.bullets.map((bullet, idx) => (
                                                                <li key={idx}>{bullet}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="projects" className="space-y-4">
                        {fetchLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No projects found. Click the Add button to create one.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {projects.map((project) => (
                                    <Card key={project.id} className="relative">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle>{project.title}</CardTitle>
                                                    <CardDescription>{project.category}</CardDescription>
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditProject(project)}>
                                                                <Edit className="w-4 h-4 mr-2" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProject(project.id!)}>
                                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex">
                                                    <span className="text-sm font-medium w-32">Description:</span>
                                                    <span className="text-sm flex-1">{project.description}</span>
                                                </div>
                                                {project.technologies && project.technologies.length > 0 && (
                                                    <div className="flex">
                                                        <span className="text-sm font-medium w-32">Technologies:</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {project.technologies.map((tech, idx) => (
                                                                <span key={idx} className="text-xs px-2 py-1 bg-secondary rounded-full">{tech}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {project.images && project.images.length > 0 && (
                                                    <div className="flex">
                                                        <span className="text-sm font-medium w-32">Images:</span>
                                                        <span className="text-sm">{project.images.length} images</span>
                                                    </div>
                                                )}
                                                {(project.liveUrl || project.githubUrl) && (
                                                    <div className="flex mt-2">
                                                        <span className="text-sm font-medium w-32">Links:</span>
                                                        <div className="flex gap-2">
                                                            {project.liveUrl && (
                                                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                                                    Live Demo
                                                                </a>
                                                            )}
                                                            {project.githubUrl && (
                                                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                                                    GitHub
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Timeline Modal */}
            {isTimelineModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-background rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {selectedTimelineItem ? 'Edit Timeline Item' : 'Add Timeline Item'}
                        </h2>
                        <form onSubmit={handleTimelineSubmit}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Year/Period</Label>
                                        <Input
                                            id="year"
                                            name="year"
                                            placeholder="e.g. January 2024 - Currently"
                                            defaultValue={selectedTimelineItem?.year || ''}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select name="category" defaultValue={selectedTimelineItem?.category || 'work'} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="work">Work</SelectItem>
                                                <SelectItem value="education">Education</SelectItem>
                                                <SelectItem value="project">Project</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="e.g. Full Stack Developer"
                                        defaultValue={selectedTimelineItem?.title || ''}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        placeholder="e.g. Company Name - City, Country"
                                        defaultValue={selectedTimelineItem?.location || ''}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Brief description..."
                                        defaultValue={selectedTimelineItem?.description || ''}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bullets">Bullet Points (One per line)</Label>
                                    <Textarea
                                        id="bullets"
                                        name="bullets"
                                        placeholder="Key responsibilities or achievements..."
                                        rows={4}
                                        defaultValue={selectedTimelineItem?.bullets?.join('\n') || ''}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsTimelineModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Project Modal */}
            {isProjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-background rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {selectedProject ? 'Edit Project' : 'Add Project'}
                        </h2>
                        <form onSubmit={handleProjectSubmit}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            placeholder="Project title"
                                            defaultValue={selectedProject?.title || ''}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Input
                                            id="category"
                                            name="category"
                                            placeholder="e.g. Web Development"
                                            defaultValue={selectedProject?.category || ''}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Short Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Brief description..."
                                        defaultValue={selectedProject?.description || ''}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="longDescription">Detailed Description</Label>
                                    <Textarea
                                        id="longDescription"
                                        name="longDescription"
                                        placeholder="More detailed description..."
                                        rows={4}
                                        defaultValue={selectedProject?.longDescription || ''}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="technologies">Technologies (comma separated)</Label>
                                    <Input
                                        id="technologies"
                                        name="technologies"
                                        placeholder="e.g. React, Node.js, MongoDB"
                                        defaultValue={selectedProject?.technologies?.join(', ') || ''}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="images">Images (comma separated)</Label>
                                    <Input
                                        id="images"
                                        name="images"
                                        placeholder="e.g. image1.jpg, image2.jpg"
                                        defaultValue={selectedProject?.images?.join(', ') || ''}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="liveUrl">Live URL (Optional)</Label>
                                        <Input
                                            id="liveUrl"
                                            name="liveUrl"
                                            placeholder="https://..."
                                            defaultValue={selectedProject?.liveUrl || ''}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="githubUrl">GitHub URL (Optional)</Label>
                                        <Input
                                            id="githubUrl"
                                            name="githubUrl"
                                            placeholder="https://github.com/..."
                                            defaultValue={selectedProject?.githubUrl || ''}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsProjectModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard; 