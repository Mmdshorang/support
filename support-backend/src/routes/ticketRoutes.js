import express from 'express';
import {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketStats,
} from '../controllers/ticketController.js';
import {
  getMessages,
  createMessage,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Ticket routes
router
  .route('/')
  .get(protect, getTickets)
  .post(protect, createTicket);

router.get('/stats/overview', protect, getTicketStats);

router
  .route('/:id')
  .get(protect, getTicket)
  .put(protect, updateTicket)
  .delete(protect, authorize('admin'), deleteTicket);

// Message routes
router
  .route('/:ticketId/messages')
  .get(protect, getMessages)
  .post(protect, createMessage);

router
  .route('/:ticketId/messages/:messageId')
  .delete(protect, authorize('admin'), deleteMessage);

export default router;
