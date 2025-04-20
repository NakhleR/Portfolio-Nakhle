import Timeline from '../models/Timeline.js';

// @desc    Get all timeline items
// @route   GET /api/timeline
// @access  Public
const getTimelineItems = async (req, res) => {
    try {
        const timelineItems = await Timeline.find({}).sort({ order: 1 });
        res.json(timelineItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single timeline item
// @route   GET /api/timeline/:id
// @access  Public
const getTimelineItem = async (req, res) => {
    try {
        const timelineItem = await Timeline.findById(req.params.id);

        if (timelineItem) {
            res.json(timelineItem);
        } else {
            res.status(404);
            throw new Error('Timeline item not found');
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Create a timeline item
// @route   POST /api/timeline
// @access  Private/Admin
const createTimelineItem = async (req, res) => {
    try {
        const { year, title, location, category, description, bullets, order } = req.body;

        const timelineItem = new Timeline({
            year,
            title,
            location,
            category,
            description,
            bullets,
            order,
        });

        const createdTimelineItem = await timelineItem.save();
        res.status(201).json(createdTimelineItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a timeline item
// @route   PUT /api/timeline/:id
// @access  Private/Admin
const updateTimelineItem = async (req, res) => {
    try {
        const { year, title, location, category, description, bullets, order } = req.body;

        const timelineItem = await Timeline.findById(req.params.id);

        if (timelineItem) {
            timelineItem.year = year || timelineItem.year;
            timelineItem.title = title || timelineItem.title;
            timelineItem.location = location || timelineItem.location;
            timelineItem.category = category || timelineItem.category;
            timelineItem.description = description || timelineItem.description;
            timelineItem.bullets = bullets || timelineItem.bullets;
            timelineItem.order = order !== undefined ? order : timelineItem.order;

            const updatedTimelineItem = await timelineItem.save();
            res.json(updatedTimelineItem);
        } else {
            res.status(404);
            throw new Error('Timeline item not found');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a timeline item
// @route   DELETE /api/timeline/:id
// @access  Private/Admin
const deleteTimelineItem = async (req, res) => {
    try {
        const timelineItem = await Timeline.findById(req.params.id);

        if (timelineItem) {
            await Timeline.deleteOne({ _id: timelineItem._id });
            res.json({ message: 'Timeline item removed' });
        } else {
            res.status(404);
            throw new Error('Timeline item not found');
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export {
    getTimelineItems,
    getTimelineItem,
    createTimelineItem,
    updateTimelineItem,
    deleteTimelineItem,
}; 