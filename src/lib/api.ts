import { TimelineItem } from '@/components/Timeline';
import { ProjectDetails } from '@/components/ProjectDialog';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
    return localStorage.getItem('userToken');
};

// Auth API calls
export const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
    }

    return data;
};

export const getUserProfile = async () => {
    const token = getToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to get user profile');
    }

    return data;
};

// Timeline API calls
export const getTimelineItems = async (): Promise<TimelineItem[]> => {
    const response = await fetch(`${API_URL}/timeline`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch timeline items');
    }

    return data.map(item => ({
        id: item._id,
        year: item.year,
        title: item.title,
        location: item.location,
        category: item.category,
        description: item.description,
        bullets: item.bullets,
    }));
};

export const createTimelineItem = async (timelineItem: Omit<TimelineItem, 'id'>) => {
    const token = getToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/timeline`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(timelineItem),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to create timeline item');
    }

    return data;
};

export const updateTimelineItem = async (id: string, timelineItem: Partial<TimelineItem>) => {
    const token = getToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/timeline/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(timelineItem),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to update timeline item');
    }

    return data;
};

export const deleteTimelineItem = async (id: string) => {
    const token = getToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/timeline/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete timeline item');
    }

    return data;
};

// Project API calls
export const getProjects = async (): Promise<ProjectDetails[]> => {
    const response = await fetch(`${API_URL}/projects`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch projects');
    }

    return data.map(project => ({
        id: project._id,
        title: project.title,
        category: project.category,
        description: project.description,
        longDescription: project.longDescription,
        technologies: project.technologies,
        images: project.images,
        liveUrl: project.liveUrl,
        githubUrl: project.githubUrl,
    }));
};

export const createProject = async (project: Omit<ProjectDetails, 'id'>) => {
    const token = getToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(project),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to create project');
    }

    return data;
};

export const updateProject = async (id: string, project: Partial<ProjectDetails>) => {
    const token = getToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(project),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to update project');
    }

    return data;
};

export const deleteProject = async (id: string) => {
    const token = getToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete project');
    }

    return data;
};

// Upload project images
export const uploadProjectImages = async (files: File[]): Promise<string[]> => {
    const token = getToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const formData = new FormData();

    // Append each file to the FormData
    files.forEach(file => {
        formData.append('images', file);
    });

    try {
        const response = await axios.post(`${API_URL}/projects/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });

        // Handle different response formats
        if (response.data) {
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (typeof response.data === 'object') {
                if (Array.isArray(response.data.imageUrls)) {
                    return response.data.imageUrls;
                } else if (typeof response.data.imageUrls === 'string') {
                    return [response.data.imageUrls];
                } else if (response.data.urls && Array.isArray(response.data.urls)) {
                    return response.data.urls;
                } else if (response.data.url && typeof response.data.url === 'string') {
                    return [response.data.url];
                }
            } else if (typeof response.data === 'string') {
                return [response.data];
            }
        }

        console.error('Unexpected response format:', response.data);
        return [];
    } catch (error) {
        console.error('Error uploading images:', error);
        throw new Error('Failed to upload images');
    }
}; 