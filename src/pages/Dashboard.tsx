import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getTimelineItems, getProjects, createTimelineItem, updateTimelineItem, deleteTimelineItem, createProject, updateProject, deleteProject, uploadProjectImages } from '@/lib/api';
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
    const [submitting, setSubmitting] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectDetails | null>(null);

    // Add state for file upload
    const [uploading, setUploading] = useState<boolean>(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    // Project form state
    const [projectForm, setProjectForm] = useState<ProjectFormData>({
        title: '',
        category: '',
        description: '',
        longDescription: '',
        technologies: [],
        images: [],
        liveUrl: '',
        githubUrl: ''
    });

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
            setSelectedTimelineItem(null);
        } catch (error) {
            console.error('Error saving timeline item:', error);
            toast.error('Failed to save timeline item');
        }
    };

    // Project CRUD operations
    const handleAddProject = () => {
        setSelectedProject(null);
        setEditingProject(null);
        setProjectForm({
            title: '',
            category: '',
            description: '',
            longDescription: '',
            technologies: [],
            images: [],
            liveUrl: '',
            githubUrl: ''
        });
        setIsProjectModalOpen(true);
    };

    const handleEditProject = (project: ProjectDetails) => {
        setSelectedProject(project);
        setEditingProject(project);
        setProjectForm({
            title: project.title,
            category: project.category,
            description: project.description,
            longDescription: project.longDescription || '',
            technologies: project.technologies || [],
            images: project.images || [],
            liveUrl: project.liveUrl || '',
            githubUrl: project.githubUrl || ''
        });
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

    // Function to handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);

        // Create preview URLs for the selected files
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    };

    // Function to remove a selected file
    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));

        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Upload images and get their URLs
    const uploadImages = async (): Promise<string[]> => {
        if (selectedFiles.length === 0) return [];

        setUploading(true);
        try {
            const response = await uploadProjectImages(selectedFiles);
            setUploading(false);

            // Make sure we always return an array of strings
            if (Array.isArray(response)) {
                return response;
            } else if (response && typeof response === 'object') {
                // Try to handle cases where the API might return differently structured data
                const responseObj = response as Record<string, unknown>;

                if (responseObj.imageUrls && Array.isArray(responseObj.imageUrls)) {
                    return responseObj.imageUrls as string[];
                } else if (responseObj.imageUrls && typeof responseObj.imageUrls === 'string') {
                    return [responseObj.imageUrls as string];
                } else if (responseObj.urls && Array.isArray(responseObj.urls)) {
                    return responseObj.urls as string[];
                } else if (responseObj.url && typeof responseObj.url === 'string') {
                    return [responseObj.url as string];
                }
            } else if (typeof response === 'string') {
                return [response];
            }

            // Fallback if response format is unexpected
            console.error('Unexpected response format from uploadProjectImages:', response);
            return [];
        } catch (error) {
            setUploading(false);
            toast.error('Failed to upload images');
            console.error('Error uploading images:', error);
            return [];
        }
    };

    // Modified handleProjectSubmit to include image upload
    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);

            // Upload images first if there are any
            let imageUrls: string[] = [];
            if (selectedFiles.length > 0) {
                imageUrls = await uploadImages();
                console.log('Uploaded image URLs:', imageUrls);
            }

            // Ensure imageUrls is always an array
            if (!Array.isArray(imageUrls)) {
                console.error('imageUrls is not an array:', imageUrls);
                imageUrls = [];
            }

            const projectData: ProjectFormData = {
                title: projectForm.title,
                category: projectForm.category,
                description: projectForm.description,
                longDescription: projectForm.longDescription || '',
                technologies: Array.isArray(projectForm.technologies) ?
                    projectForm.technologies :
                    [],
                // Combine existing images with newly uploaded ones
                images: [
                    ...(Array.isArray(projectForm.images) ? projectForm.images : []),
                    ...imageUrls
                ],
                liveUrl: projectForm.liveUrl || '',
                githubUrl: projectForm.githubUrl || ''
            };

            if (editingProject) {
                const updatedProject = await updateProject(editingProject.id!, projectData);
                setProjects(prev => prev.map(p => (p.id === updatedProject._id ? { ...updatedProject, id: updatedProject._id } : p)));
                toast.success('Project updated successfully');
            } else {
                const newProjectItem = await createProject(projectData);
                setProjects(prev => [...prev, { ...newProjectItem, id: newProjectItem._id }]);
                toast.success('Project created successfully');
            }

            // Close the modal and reset form
            setIsProjectModalOpen(false);
            resetProjectForm();
            setSelectedFiles([]);
            setPreviewUrls([]);
            setEditingProject(null);
            setSelectedProject(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    // Reset project form
    const resetProjectForm = () => {
        setProjectForm({
            title: '',
            category: '',
            description: '',
            longDescription: '',
            technologies: [],
            images: [],
            liveUrl: '',
            githubUrl: ''
        });
        setEditingProject(null);
        setSelectedFiles([]);
        setPreviewUrls([]);
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
                        <form onSubmit={handleProjectSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="Project title"
                                    value={projectForm.title}
                                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    placeholder="e.g. Web Development"
                                    value={projectForm.category}
                                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Short Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Brief description..."
                                    value={projectForm.description}
                                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
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
                                    value={projectForm.longDescription}
                                    onChange={(e) => setProjectForm({ ...projectForm, longDescription: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="technologies">Technologies (comma separated)</Label>
                                <Input
                                    id="technologies"
                                    name="technologies"
                                    placeholder="e.g. React, Node.js, MongoDB"
                                    value={Array.isArray(projectForm.technologies) ? projectForm.technologies.join(', ') : ''}
                                    onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value.split(',').map(t => t.trim()) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="images">Images</Label>
                                <div className="flex flex-col gap-4">
                                    {/* Existing images display */}
                                    {selectedProject && selectedProject.images && selectedProject.images.length > 0 && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Current Images:</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                {selectedProject.images.map((image, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={image.startsWith('/uploads') ? `http://localhost:5000${image}` : image}
                                                            alt={`Project image ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded border"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => {
                                                                const updatedImages = [...selectedProject.images!];
                                                                updatedImages.splice(index, 1);
                                                                setSelectedProject({
                                                                    ...selectedProject,
                                                                    images: updatedImages
                                                                });
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Image preview section */}
                                    {previewUrls.length > 0 && (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">New Images:</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                {previewUrls.map((url, index) => (
                                                    <div key={index} className="relative group">
                                                        <img
                                                            src={url}
                                                            alt={`Upload preview ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded border"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeFile(index)}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* File input button */}
                                    <div>
                                        <Label
                                            htmlFor="file-upload"
                                            className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded"
                                        >
                                            {uploading ? 'Uploading...' : 'Select Images'}
                                        </Label>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            You can upload up to 5 images (PNG, JPG, JPEG)
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="liveUrl">Live URL (Optional)</Label>
                                <Input
                                    id="liveUrl"
                                    name="liveUrl"
                                    placeholder="https://..."
                                    value={projectForm.liveUrl}
                                    onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="githubUrl">GitHub URL (Optional)</Label>
                                <Input
                                    id="githubUrl"
                                    name="githubUrl"
                                    placeholder="https://github.com/..."
                                    value={projectForm.githubUrl}
                                    onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsProjectModalOpen(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting || uploading}>
                                    {submitting || uploading ? 'Saving...' : selectedProject ? 'Update Project' : 'Add Project'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard; 