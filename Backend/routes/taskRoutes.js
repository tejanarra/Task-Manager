
const express = require('express');
const { createTask, getTasks, updateTask, deleteTask, getTaskById } = require('../controllers/taskController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/', authenticateToken, createTask);
router.get('/', authenticateToken, getTasks);
router.get('/:taskId', authenticateToken, getTaskById);
router.put('/:taskId', authenticateToken, updateTask);
router.delete('/:taskId', authenticateToken, deleteTask);

module.exports = router;
