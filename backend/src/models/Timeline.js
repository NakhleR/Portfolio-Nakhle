import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema(
    {
        year: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        location: {
            type: String,
        },
        category: {
            type: String,
            required: true,
            enum: ['education', 'work', 'project'],
        },
        description: {
            type: String,
        },
        bullets: {
            type: [String],
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for efficient sorting
timelineSchema.index({ order: 1 });

const Timeline = mongoose.model('Timeline', timelineSchema);

export default Timeline; 