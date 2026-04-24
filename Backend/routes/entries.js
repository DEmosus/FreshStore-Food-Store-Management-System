const express = require('express');
const { body } = require('express-validator');
const {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  getDashboardStats,
  getReportStats,
} = require('../controllers/entryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All entry routes require authentication
router.use(protect);

// Stats routes (before /:id to avoid conflict)
router.get('/stats/dashboard', getDashboardStats);
router.get('/stats/report', getReportStats);

const entryValidation = [
  body('itemName').trim().notEmpty().withMessage('Item name is required'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be a positive number'),
  body('pricePerUnit').isFloat({ min: 0 }).withMessage('Price must be zero or positive'),
  body('type').isIn(['stock', 'sale']).withMessage('Type must be stock or sale'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
];

router.route('/').get(getEntries).post(entryValidation, createEntry);

router.route('/:id').get(getEntry).put(entryValidation, updateEntry).delete(deleteEntry);

module.exports = router;
