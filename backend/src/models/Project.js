import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        longDescription: {
            type: String,
        },
        technologies: {
            type: [String],
        },
        images: {
            type: [String],
        },
        liveUrl: {
            type: String,
        },
        githubUrl: {
            type: String,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for efficient sorting
projectSchema.index({ order: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project; 