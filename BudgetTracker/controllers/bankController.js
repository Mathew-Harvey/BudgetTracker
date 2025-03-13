const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @desc    Get user's bank accounts
// @route   GET /api/bank/accounts
// @access  Private
exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    console.error('Error fetching accounts:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Add a manual bank account
// @route   POST /api/bank/accounts
// @access  Private
exports.addAccount = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    // Ensure it's marked as a manual account
    req.body.isManual = true;
    
    const account = await Account.create(req.body);

    res.status(201).json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Error adding account:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Update account
// @route   PUT /api/bank/accounts/:id
// @access  Private
exports.updateAccount = async (req, res, next) => {
  try {
    let account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    // Make sure user owns account
    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this account'
      });
    }

    // Prevent updating sensitive fields for linked accounts
    if (!account.isManual) {
      const restrictedFields = ['institution', 'externalId', 'accessToken'];
      restrictedFields.forEach(field => {
        if (req.body[field]) {
          delete req.body[field];
        }
      });
    }

    account = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Error updating account:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Delete account
// @route   DELETE /api/bank/accounts/:id
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    // Make sure user owns account
    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this account'
      });
    }

    await account.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting account:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Import bank statement data
// @route   POST /api/bank/import
// @access  Private
exports.importBankData = async (req, res, next) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Please provide bank statement data'
      });
    }
    
    // Parse CSV or other format data
    const parsedData = parseBankData(data);
    
    // Save transactions to database
    const savedTransactions = [];
    
    for (const transaction of parsedData.transactions) {
      // Add user ID to transaction
      transaction.user = req.user.id;
      
      const savedTransaction = await Transaction.create(transaction);
      savedTransactions.push(savedTransaction);
    }

    res.status(201).json({
      success: true,
      count: savedTransactions.length,
      data: {
        transactions: savedTransactions,
        summary: parsedData.summary
      }
    });
  } catch (error) {
    console.error('Error importing bank data:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Connect to a bank (placeholder for external API integration)
// @route   POST /api/bank/connect
// @access  Private
exports.connectToBank = async (req, res, next) => {
  try {
    // This is a placeholder for connecting to a bank API
    // In a real application, this would involve:
    // 1. Initiating OAuth flow with a banking API provider (like Plaid, Teller, etc.)
    // 2. Storing access tokens securely
    // 3. Setting up webhooks for transaction updates
    
    res.status(200).json({
      success: true,
      message: 'This is a placeholder for bank API integration. In a real application, this would connect to a banking API service.',
      instructions: 'To implement actual bank connection, integrate with services like Plaid, Teller, or direct bank APIs.'
    });
  } catch (error) {
    console.error('Error connecting to bank:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// Helper function to parse bank statement data
// This is a simple example - real implementation would be more robust
const parseBankData = (data) => {
  const transactions = [];
  let summary = {
    totalIncome: 0,
    totalExpenses: 0,
    startingBalance: 0,
    endingBalance: 0
  };
  
  // Split by lines
  const lines = data.split('\n');
  
  // Determine if this has a header row
  let startLine = 0;
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes('date') || firstLine.includes('description') || firstLine.includes('amount')) {
    startLine = 1; // Skip header row
  }
  
  // Parse each transaction line
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue;
    
    // Parse CSV line properly, handling quoted fields
    const fields = parseCSVLine(line);
    
    // Basic assumption of CSV format: date,description,amount,category
    if (fields.length >= 3) {
      try {
        const date = formatDate(fields[0]);
        const description = fields[1].replace(/"/g, '').trim();
        const amount = parseFloat(fields[2].replace(/[^0-9.-]/g, ''));
        const category = fields[3] ? fields[3].replace(/"/g, '').trim() : determineCategory(description);
        
        if (isNaN(amount)) {
          continue; // Skip invalid amounts
        }
        
        // Create transaction object
        const transaction = {
          date: new Date(date),
          description,
          amount,
          category,
          notes: 'Imported from bank statement'
        };
        
        transactions.push(transaction);
        
        // Update summary totals
        if (amount > 0) {
          summary.totalIncome += amount;
        } else {
          summary.totalExpenses += Math.abs(amount);
        }
      } catch (error) {
        console.error(`Error parsing line ${i}: ${line}`);
        // Continue with next line
      }
    }
  }
  
  // Calculate final balances
  summary.endingBalance = summary.startingBalance + summary.totalIncome - summary.totalExpenses;
  
  return { transactions, summary };
};

// Helper to parse CSV line correctly, handling quoted fields
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

// Helper to format date correctly
const formatDate = (dateStr) => {
  // Remove quotes if present
  dateStr = dateStr.replace(/"/g, '').trim();
  
  // Try to determine format
  let parts;
  if (dateStr.includes('/')) {
    parts = dateStr.split('/');
  } else if (dateStr.includes('-')) {
    parts = dateStr.split('-');
  } else {
    throw new Error(`Unable to parse date format: ${dateStr}`);
  }
  
  // Handle DD/MM/YYYY format
  if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2) {
    // Convert to MM/DD/YYYY for JS Date compatibility
    return `${parts[1]}/${parts[0]}/${parts[2]}`;
  }
  
  return dateStr;
};

// Helper to determine category based on description
const determineCategory = (description) => {
  description = description.toLowerCase();
  
  const categoryMapping = {
    'grocery': 'Food',
    'supermarket': 'Food',
    'restaurant': 'Food',
    'uber eats': 'Food',
    'doordash': 'Food',
    
    'rent': 'Housing',
    'mortgage': 'Housing',
    
    'uber': 'Transportation',
    'lyft': 'Transportation',
    'gasoline': 'Transportation',
    'gas station': 'Transportation',
    
    'electricity': 'Utilities',
    'water': 'Utilities',
    'gas bill': 'Utilities',
    'internet': 'Utilities',
    'phone': 'Utilities',
    
    'doctor': 'Healthcare',
    'pharmacy': 'Healthcare',
    'medical': 'Healthcare',
    
    'netflix': 'Entertainment',
    'spotify': 'Entertainment',
    'apple music': 'Entertainment',
    'cinema': 'Entertainment',
    'movie': 'Entertainment',
    
    'salary': 'Income',
    'payroll': 'Income',
    'deposit': 'Income',
    
    'insurance': 'Insurance',
    'investment': 'Investments'
  };
  
  for (const [keyword, category] of Object.entries(categoryMapping)) {
    if (description.includes(keyword)) {
      return category;
    }
  }
  
  return 'Other';
}; 