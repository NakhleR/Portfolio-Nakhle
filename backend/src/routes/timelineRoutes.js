import express from 'express';
import {
    getTimelineItems,
    getTimelineItem,
    createTimelineItem,
    updateTimelineItem,
    deleteTimelineItem,
} from '../controllers/timelineController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getTimelineItems);
router.get('/:id', getTimelineItem);

// Protected admin routes
router.post('/', protect, admin, createTimelineItem);
router.put('/:id', protect, admin, updateTimelineItem);
router.delete('/:id', protect, admin, deleteTimelineItem);

export default router; 