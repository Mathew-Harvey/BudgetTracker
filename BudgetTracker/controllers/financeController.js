const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const MonthlyData = require('../models/MonthlyData');

// @desc    Get user transactions
// @route   GET /api/finance/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Filter by date range if provided
    const dateFilter = {};
    if (req.query.startDate) {
      dateFilter.date = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      if (dateFilter.date) {
        dateFilter.date.$lte = new Date(req.query.endDate);
      } else {
        dateFilter.date = { $lte: new Date(req.query.endDate) };
      }
    }
    
    // Filter by category if provided
    const categoryFilter = req.query.category ? { category: req.query.category } : {};
    
    // Combine filters
    const filter = {
      user: req.user.id,
      ...dateFilter,
      ...categoryFilter
    };

    // Count total documents
    const total = await Transaction.countDocuments(filter);

    // Get transactions
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 }) // Sort by date, newest first
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination,
      total,
      data: transactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Add transaction
// @route   POST /api/finance/transactions
// @access  Private
exports.addTransaction = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;

    const transaction = await Transaction.create(req.body);

    // Update monthly data
    await updateMonthlyData(req.user.id);

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Update transaction
// @route   PUT /api/finance/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this transaction'
      });
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Update monthly data
    await updateMonthlyData(req.user.id);

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/finance/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Make sure user owns transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this transaction'
      });
    }

    await transaction.remove();

    // Update monthly data
    await updateMonthlyData(req.user.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Get user budgets
// @route   GET /api/finance/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Add budget
// @route   POST /api/finance/budgets
// @access  Private
exports.addBudget = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;

    const budget = await Budget.create(req.body);

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error(error);
    
    // Handle duplicate key (category already exists for this period)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A budget for this category and period already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Update budget
// @route   PUT /api/finance/budgets/:id
// @access  Private
exports.updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this budget'
      });
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/finance/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found'
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this budget'
      });
    }

    await budget.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Get user goals
// @route   GET /api/finance/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Add goal
// @route   POST /api/finance/goals
// @access  Private
exports.addGoal = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;

    const goal = await Goal.create(req.body);

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Update goal
// @route   PUT /api/finance/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    // Make sure user owns goal
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this goal'
      });
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Delete goal
// @route   DELETE /api/finance/goals/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    // Make sure user owns goal
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this goal'
      });
    }

    await goal.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Get monthly data
// @route   GET /api/finance/monthlydata
// @access  Private
exports.getMonthlyData = async (req, res, next) => {
  try {
    // Filter by year if provided
    const yearFilter = req.query.year ? { year: parseInt(req.query.year, 10) } : {};
    
    const monthlyData = await MonthlyData.find({
      user: req.user.id,
      ...yearFilter
    }).sort({ year: 1, monthNum: 1 });

    res.status(200).json({
      success: true,
      count: monthlyData.length,
      data: monthlyData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Add or update monthly data
// @route   POST /api/finance/monthlydata
// @access  Private
exports.addMonthlyData = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Extract month and year from month string (e.g., "Jan 2023")
    if (req.body.month) {
      const parts = req.body.month.split(' ');
      if (parts.length === 2) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = monthNames.indexOf(parts[0]);
        if (monthIndex !== -1) {
          req.body.monthNum = monthIndex;
          req.body.year = parseInt(parts[1], 10);
        }
      }
    }

    // Find if monthly data already exists
    let monthlyData = await MonthlyData.findOne({
      user: req.user.id,
      year: req.body.year,
      monthNum: req.body.monthNum
    });

    if (monthlyData) {
      // Update existing monthly data
      monthlyData = await MonthlyData.findByIdAndUpdate(monthlyData._id, req.body, {
        new: true,
        runValidators: true
      });
    } else {
      // Create new monthly data
      monthlyData = await MonthlyData.create(req.body);
    }

    res.status(201).json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Get financial statistics summary
// @route   GET /api/finance/stats
// @access  Private
exports.getFinancialStats = async (req, res, next) => {
  try {
    // Get total income, expenses, and savings from transactions
    const [incomeStats] = await Transaction.aggregate([
      { $match: { user: req.user._id, amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const [expenseStats] = await Transaction.aggregate([
      { $match: { user: req.user._id, amount: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
    ]);

    // Get category spending breakdown
    const categorySpending = await Transaction.aggregate([
      { $match: { user: req.user._id, amount: { $lt: 0 } } },
      { $group: { _id: '$category', amount: { $sum: { $abs: '$amount' } } } },
      { $project: { _id: 0, category: '$_id', amount: 1 } },
      { $sort: { amount: -1 } }
    ]);

    // Get current net worth and savings rate from latest monthly data
    const latestMonthly = await MonthlyData.findOne({ user: req.user.id })
      .sort({ year: -1, monthNum: -1 })
      .limit(1);

    // Get incomplete goals
    const goals = await Goal.find({ 
      user: req.user.id,
      status: 'in-progress'
    });

    res.status(200).json({
      success: true,
      data: {
        totalIncome: incomeStats ? incomeStats.total : 0,
        totalExpenses: expenseStats ? expenseStats.total : 0,
        savingsRate: latestMonthly ? latestMonthly.savingsRate : 0,
        netWorth: latestMonthly ? latestMonthly.netWorth : 0,
        categorySpending,
        activeGoals: goals.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// Helper function to update monthly data based on transactions
const updateMonthlyData = async (userId) => {
  try {
    // Get all months that have transactions
    const months = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          }
        }
      }
    ]);

    for (const monthGroup of months) {
      const year = monthGroup._id.year;
      const month = monthGroup._id.month - 1; // MongoDB months are 1-12, JS months are 0-11
      
      // Get start and end date for the month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      // Calculate income, expenses for the month
      const [incomeData] = await Transaction.aggregate([
        { 
          $match: { 
            user: userId,
            amount: { $gt: 0 },
            date: { $gte: startDate, $lte: endDate }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const [expenseData] = await Transaction.aggregate([
        { 
          $match: { 
            user: userId,
            amount: { $lt: 0 },
            date: { $gte: startDate, $lte: endDate }
          } 
        },
        { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
      ]);

      // Get category spending breakdown
      const categorySpending = await Transaction.aggregate([
        { 
          $match: { 
            user: userId,
            amount: { $lt: 0 },
            date: { $gte: startDate, $lte: endDate }
          } 
        },
        { $group: { _id: '$category', amount: { $sum: { $abs: '$amount' } } } },
        { $project: { category: '$_id', amount: 1, _id: 0 } }
      ]);

      // Get budgets for the categories
      const budgets = await Budget.find({
        user: userId,
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      });

      // Add budget amounts to category spending
      const categorySpendingWithBudgets = categorySpending.map(category => {
        const matchingBudget = budgets.find(b => b.category === category.category);
        return {
          category: category.category,
          amount: category.amount,
          budget: matchingBudget ? matchingBudget.amount : 0
        };
      });

      // Calculate income, expenses, and savings
      const income = incomeData ? incomeData.total : 0;
      const expenses = expenseData ? expenseData.total : 0;
      const savings = income - expenses;
      
      // Calculate savings rate
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;

      // Format month name
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = `${monthNames[month]} ${year}`;

      // Find or create monthly data
      let monthlyData = await MonthlyData.findOne({
        user: userId,
        year,
        monthNum: month
      });

      if (monthlyData) {
        // Update existing monthly data
        monthlyData.income = income;
        monthlyData.expenses = expenses;
        monthlyData.savings = savings;
        monthlyData.savingsRate = savingsRate;
        monthlyData.categorySpending = categorySpendingWithBudgets;
        monthlyData.isAutoGenerated = true;
        await monthlyData.save();
      } else {
        // Create new monthly data
        await MonthlyData.create({
          user: userId,
          month: monthName,
          year,
          monthNum: month,
          income,
          expenses,
          savings,
          savingsRate,
          categorySpending: categorySpendingWithBudgets,
          isAutoGenerated: true
        });
      }
    }
  } catch (error) {
    console.error('Error updating monthly data:', error);
    throw error;
  }
}; 