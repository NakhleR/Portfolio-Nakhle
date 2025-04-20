import express from 'express';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
} from '../controllers/projectController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);

// Protected admin routes
router.post('/', protect, admin, createProject);
router.put('/:id', protect, admin, updateProject);
router.delete('/:id', protect, admin, deleteProject);

export default router; 