/**
 * API Service for the Budget Tracker client-side
 * This file contains methods for communicating with the backend API
 */

const API_URL = '/api/v1';

// Auth API calls
const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - API response
   */
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Log in an existing user
   * @param {Object} credentials - Login credentials
   * @returns {Promise} - API response with user data and token
   */
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store token in localStorage for future requests
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Log out the current user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  },
  
  /**
   * Get the current user's profile
   * @returns {Promise} - API response with user data
   */
  getProfile: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get profile');
      }
      
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  /**
   * Update the current user's profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} - API response
   */
  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

// Finance API calls
const financeAPI = {
  /**
   * Get user transactions with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with transactions
   */
  getTransactions: async (params = {}) => {
    try {
      // Build query string from params
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_URL}/finance/transactions${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get transactions');
      }
      
      return data;
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  },
  
  /**
   * Add a new transaction
   * @param {Object} transaction - Transaction data
   * @returns {Promise} - API response
   */
  addTransaction: async (transaction) => {
    try {
      const response = await fetch(`${API_URL}/finance/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(transaction)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add transaction');
      }
      
      return data;
    } catch (error) {
      console.error('Add transaction error:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing transaction
   * @param {string} id - Transaction ID
   * @param {Object} transaction - Updated transaction data
   * @returns {Promise} - API response
   */
  updateTransaction: async (id, transaction) => {
    try {
      const response = await fetch(`${API_URL}/finance/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(transaction)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update transaction');
      }
      
      return data;
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  },
  
  /**
   * Delete a transaction
   * @param {string} id - Transaction ID
   * @returns {Promise} - API response
   */
  deleteTransaction: async (id) => {
    try {
      const response = await fetch(`${API_URL}/finance/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete transaction');
      }
      
      return data;
    } catch (error) {
      console.error('Delete transaction error:', error);
      throw error;
    }
  },
  
  /**
   * Get user budgets
   * @returns {Promise} - API response with budgets
   */
  getBudgets: async () => {
    try {
      const response = await fetch(`${API_URL}/finance/budgets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get budgets');
      }
      
      return data;
    } catch (error) {
      console.error('Get budgets error:', error);
      throw error;
    }
  },
  
  /**
   * Add a new budget
   * @param {Object} budget - Budget data
   * @returns {Promise} - API response
   */
  addBudget: async (budget) => {
    try {
      const response = await fetch(`${API_URL}/finance/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(budget)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add budget');
      }
      
      return data;
    } catch (error) {
      console.error('Add budget error:', error);
      throw error;
    }
  },
  
  /**
   * Get user goals
   * @returns {Promise} - API response with goals
   */
  getGoals: async () => {
    try {
      const response = await fetch(`${API_URL}/finance/goals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get goals');
      }
      
      return data;
    } catch (error) {
      console.error('Get goals error:', error);
      throw error;
    }
  },
  
  /**
   * Add a new goal
   * @param {Object} goal - Goal data
   * @returns {Promise} - API response
   */
  addGoal: async (goal) => {
    try {
      const response = await fetch(`${API_URL}/finance/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(goal)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add goal');
      }
      
      return data;
    } catch (error) {
      console.error('Add goal error:', error);
      throw error;
    }
  },
  
  /**
   * Get monthly data with optional year filter
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with monthly data
   */
  getMonthlyData: async (params = {}) => {
    try {
      // Build query string from params
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_URL}/finance/monthly${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get monthly data');
      }
      
      return data;
    } catch (error) {
      console.error('Get monthly data error:', error);
      throw error;
    }
  },
  
  /**
   * Get financial statistics
   * @returns {Promise} - API response with financial stats
   */
  getFinancialStats: async () => {
    try {
      const response = await fetch(`${API_URL}/finance/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get financial statistics');
      }
      
      return data;
    } catch (error) {
      console.error('Get financial stats error:', error);
      throw error;
    }
  }
};

// Bank API calls
const bankAPI = {
  /**
   * Get user's bank accounts
   * @returns {Promise} - API response with accounts
   */
  getAccounts: async () => {
    try {
      const response = await fetch(`${API_URL}/finance/bank/accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get accounts');
      }
      
      return data;
    } catch (error) {
      console.error('Get accounts error:', error);
      throw error;
    }
  },
  
  /**
   * Add a manual bank account
   * @param {Object} account - Account data
   * @returns {Promise} - API response
   */
  addAccount: async (account) => {
    try {
      const response = await fetch(`${API_URL}/finance/bank/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(account)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add account');
      }
      
      return data;
    } catch (error) {
      console.error('Add account error:', error);
      throw error;
    }
  },
  
  /**
   * Import bank statement data
   * @param {string} data - Bank statement data
   * @returns {Promise} - API response
   */
  importBankData: async (data) => {
    try {
      const response = await fetch(`${API_URL}/finance/bank/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data })
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to import bank data');
      }
      
      return responseData;
    } catch (error) {
      console.error('Import bank data error:', error);
      throw error;
    }
  },
  
  /**
   * Connect to a bank (placeholder)
   * @returns {Promise} - API response
   */
  connectToBank: async () => {
    try {
      const response = await fetch(`${API_URL}/finance/bank/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to bank');
      }
      
      return data;
    } catch (error) {
      console.error('Connect to bank error:', error);
      throw error;
    }
  }
};

// Export all APIs
window.API = {
  auth: authAPI,
  finance: financeAPI,
  bank: bankAPI
}; 