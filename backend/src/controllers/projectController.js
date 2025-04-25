import Project from '../models/Project.js';
import cloudinary from '../config/cloudinaryConfig.js';
import { Readable } from 'stream';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({}).sort({ order: 1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            res.json(project);
        } else {
            res.status(404);
            throw new Error('Project not found');
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            longDescription,
            technologies,
            images,
            liveUrl,
            githubUrl,
            order,
        } = req.body;

        const project = new Project({
            title,
            category,
            description,
            longDescription,
            technologies,
            images,
            liveUrl,
            githubUrl,
            order,
        });

        const createdProject = await project.save();
        res.status(201).json(createdProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            longDescription,
            technologies,
            images,
            liveUrl,
            githubUrl,
            order,
        } = req.body;

        const project = await Project.findById(req.params.id);

        if (project) {
            project.title = title || project.title;
            project.category = category || project.category;
            project.description = description || project.description;
            project.longDescription = longDescription || project.longDescription;
            project.technologies = technologies || project.technologies;
            project.images = images || project.images;
            project.liveUrl = liveUrl || project.liveUrl;
            project.githubUrl = githubUrl || project.githubUrl;
            project.order = order !== undefined ? order : project.order;

            const updatedProject = await project.save();
            res.json(updatedProject);
        } else {
            res.status(404);
            throw new Error('Project not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            await Project.deleteOne({ _id: project._id });
            res.json({ message: 'Project removed' });
        } else {
            res.status(404);
            throw new Error('Project not found');
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Upload project images
// @route   POST /api/projects/upload
// @access  Private/Admin
const uploadProjectImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            res.status(400);
            throw new Error('No files uploaded');
        }

        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                // Create a stream from buffer
                const stream = Readable.from(file.buffer);

                // Check if the filename indicates it's a mobile screenshot
                const isMobileImage = file.originalname.toLowerCase().includes('mobile') ||
                    file.originalname.toLowerCase().includes('phone') ||
                    file.originalname.toLowerCase().includes('iphone') ||
                    file.originalname.toLowerCase().includes('android');

                // Different upload options based on image type
                const uploadOptions = {
                    folder: 'portfolio-projects',
                    resource_type: 'image',
                    quality: 'auto',
                    fetch_format: 'auto'
                };

                // For mobile screenshots, ensure we preserve aspect ratio and don't crop
                if (isMobileImage) {
                    uploadOptions.width = 375; // Standard mobile width
                    uploadOptions.crop = 'scale';
                    uploadOptions.quality = 'auto:best';
                }

                // Create upload stream to Cloudinary
                const uploadStream = cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error, result) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(result.secure_url);
                    }
                );

                // Pipe the file buffer to the upload stream
                stream.pipe(uploadStream);
            });
        });

        // Wait for all uploads to complete
        const imageUrls = await Promise.all(uploadPromises);

        res.json({
            success: true,
            imageUrls: imageUrls
        });
    } catch (error) {
        res.status(400).json({
            message: error.message || 'Error uploading files',
            success: false
        });
    }
};

export {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    uploadProjectImages,
};