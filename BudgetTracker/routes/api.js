const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Import controllers
const financeController = require('../controllers/financeController');
const bankController = require('../controllers/bankController');

// Finance routes
// Transactions
router.route('/transactions')
  .get(protect, financeController.getTransactions)
  .post(protect, financeController.addTransaction);

router.route('/transactions/:id')
  .put(protect, financeController.updateTransaction)
  .delete(protect, financeController.deleteTransaction);

// Budgets
router.route('/budgets')
  .get(protect, financeController.getBudgets)
  .post(protect, financeController.addBudget);

router.route('/budgets/:id')
  .put(protect, financeController.updateBudget)
  .delete(protect, financeController.deleteBudget);

// Goals
router.route('/goals')
  .get(protect, financeController.getGoals)
  .post(protect, financeController.addGoal);

router.route('/goals/:id')
  .put(protect, financeController.updateGoal)
  .delete(protect, financeController.deleteGoal);

// Monthly data
router.route('/monthly')
  .get(protect, financeController.getMonthlyData)
  .post(protect, financeController.addOrUpdateMonthlyData);

// Stats and summaries
router.get('/stats', protect, financeController.getFinancialStatistics);

// Bank routes
router.route('/bank/accounts')
  .get(protect, bankController.getAccounts)
  .post(protect, bankController.addAccount);

router.route('/bank/accounts/:id')
  .put(protect, bankController.updateAccount)
  .delete(protect, bankController.deleteAccount);

router.post('/bank/import', protect, bankController.importBankData);
router.post('/bank/connect', protect, bankController.connectToBank);

module.exports = router; 