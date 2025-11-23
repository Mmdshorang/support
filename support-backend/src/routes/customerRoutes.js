import express from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerTickets,
  updateCustomerUserRole,
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin', 'support'), getCustomers)
  .post(protect, authorize('admin', 'support'), createCustomer);

router
  .route('/:id')
  .get(protect, authorize('admin', 'support'), getCustomer)
  .put(protect, authorize('admin', 'support'), updateCustomer)
  .delete(protect, authorize('admin'), deleteCustomer);

router
  .route('/:id/tickets')
  .get(protect, authorize('admin', 'support'), getCustomerTickets);

router.put('/:id/user-role', protect, authorize('admin'), updateCustomerUserRole);

export default router;
