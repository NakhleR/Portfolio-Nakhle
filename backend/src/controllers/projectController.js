import Project from '../models/Project.js';

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

        // Create array of image paths
        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

        res.json({
            success: true,
            imageUrls: imagePaths
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