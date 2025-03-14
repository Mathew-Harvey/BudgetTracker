document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    // Global variables
    let currentUser = null;
    let transactions = [];
    let budgets = [];
    let goals = [];
    let accounts = [];
    let monthlyData = [];
    let chartInstances = {};

    // DOM elements - Navigation
    const navLinks = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.section');

    // DOM elements - Charts containers
    const balanceChartContainer = document.getElementById('balance-chart');
    const incomeExpenseChartContainer = document.getElementById('income-expense-chart');
    const spendingChartContainer = document.getElementById('spending-by-category-chart');
    const savingsChartContainer = document.getElementById('savings-trend-chart');
    const budgetProgressChartContainer = document.getElementById('budget-progress-chart');
    const goalsProgressChartContainer = document.getElementById('goals-progress-chart');

    // DOM elements - Statistics
    const totalBalanceElement = document.getElementById('total-balance');
    const monthlyIncomeElement = document.getElementById('monthly-income');
    const monthlyExpensesElement = document.getElementById('monthly-expenses');
    const savingsRateElement = document.getElementById('savings-rate');

    // DOM elements - Forms and modals
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const addBudgetBtn = document.getElementById('add-budget-btn');
    const addGoalBtn = document.getElementById('add-goal-btn');
    const addAccountBtn = document.getElementById('add-account-btn');
    const importBankDataBtn = document.getElementById('import-bank-btn');
    const addIncomeBtn = document.getElementById('add-income-btn');

    // Modal close buttons
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const cancelTransactionBtn = document.getElementById('cancel-transaction');
    const cancelBudgetBtn = document.getElementById('cancel-budget');
    const cancelGoalBtn = document.getElementById('cancel-goal');
    const cancelAccountBtn = document.getElementById('cancel-account');
    const cancelImportBtn = document.getElementById('cancel-import');
    const cancelIncomeBtn = document.getElementById('cancel-income');

    // Modal save buttons
    const saveTransactionBtn = document.getElementById('save-transaction');
    const saveBudgetBtn = document.getElementById('save-budget');
    const saveGoalBtn = document.getElementById('save-goal');
    const saveAccountBtn = document.getElementById('save-account');
    const importDataBtn = document.getElementById('import-data');
    const saveIncomeBtn = document.getElementById('save-income');

    // Form inputs - Transaction
    const transactionDateInput = document.getElementById('transaction-date');
    const transactionAmountInput = document.getElementById('transaction-amount');
    const transactionTypeSelect = document.getElementById('transaction-type');
    const transactionCategorySelect = document.getElementById('transaction-category');
    const transactionDescriptionInput = document.getElementById('transaction-description');
    const transactionAccountSelect = document.getElementById('transaction-account');

    // Form inputs - Budget
    const budgetCategoryInput = document.getElementById('budget-category');
    const budgetAmountInput = document.getElementById('budget-amount');
    const budgetPeriodSelect = document.getElementById('budget-period');
    const budgetStartDateInput = document.getElementById('budget-start-date');
    const budgetEndDateInput = document.getElementById('budget-end-date');
    const budgetNotesInput = document.getElementById('budget-notes');

    // Form inputs - Goal
    const goalNameInput = document.getElementById('goal-name');
    const goalAmountInput = document.getElementById('goal-amount');
    const goalCurrentInput = document.getElementById('goal-current');
    const goalDateInput = document.getElementById('goal-date');
    const goalCategorySelect = document.getElementById('goal-category');

    // Form inputs - Account
    const accountNameInput = document.getElementById('account-name');
    const accountTypeSelect = document.getElementById('account-type');
    const accountInstitutionInput = document.getElementById('account-institution');
    const accountBalanceInput = document.getElementById('account-balance');
    const accountCurrencyInput = document.getElementById('account-currency');

    // Form inputs - Import
    const importDataTextarea = document.getElementById('import-data-text');

    // Form inputs - Income
    const annualIncomeInput = document.getElementById('annual-income');
    const spouseIncomeInput = document.getElementById('spouse-income');
    const netWorthInput = document.getElementById('net-worth');

    // Tables
    const transactionsTable = document.getElementById('transactions-table').querySelector('tbody');
    const budgetsTable = document.getElementById('budgets-table').querySelector('tbody');
    const goalsTable = document.getElementById('goals-table').querySelector('tbody');
    const accountsTable = document.getElementById('accounts-table').querySelector('tbody');

    // Initialize the dashboard
    initializeDashboard();

    // Setup event listeners
    setupEventListeners();

    // Main initialization function
    async function initializeDashboard() {
        try {
            showLoader();
            
            // Load user profile
            await loadUserProfile();
            
            // Load all financial data
            await Promise.all([
                loadTransactions(),
                loadBudgets(),
                loadGoals(),
                loadAccounts(),
                loadMonthlyData()
            ]);
            
            // Update UI components
            updateFinancialStatistics();
            populateTables();
            renderAllCharts();
            
            hideLoader();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            showAlert('Failed to load dashboard data. Please try again.', 'error');
            hideLoader();
        }
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavigation);
        });

        // Modal buttons - Open
        addTransactionBtn.addEventListener('click', openModal.bind(null, 'add-transaction-modal'));
        addBudgetBtn.addEventListener('click', openModal.bind(null, 'add-budget-modal'));
        addGoalBtn.addEventListener('click', openModal.bind(null, 'add-goal-modal'));
        addAccountBtn.addEventListener('click', openModal.bind(null, 'add-account-modal'));
        importBankDataBtn.addEventListener('click', openModal.bind(null, 'import-bank-modal'));
        addIncomeBtn.addEventListener('click', openModal.bind(null, 'add-income-modal'));

        // Modal buttons - Close
        closeModalButtons.forEach(button => {
            button.addEventListener('click', closeCurrentModal);
        });

        // Modal buttons - Cancel
        cancelTransactionBtn.addEventListener('click', closeCurrentModal);
        cancelBudgetBtn.addEventListener('click', closeCurrentModal);
        cancelGoalBtn.addEventListener('click', closeCurrentModal);
        cancelAccountBtn.addEventListener('click', closeCurrentModal);
        cancelImportBtn.addEventListener('click', closeCurrentModal);
        cancelIncomeBtn.addEventListener('click', closeCurrentModal);

        // Modal buttons - Save
        saveTransactionBtn.addEventListener('click', handleSaveTransaction);
        saveBudgetBtn.addEventListener('click', handleSaveBudget);
        saveGoalBtn.addEventListener('click', handleSaveGoal);
        saveAccountBtn.addEventListener('click', handleSaveAccount);
        importDataBtn.addEventListener('click', handleImportData);
        saveIncomeBtn.addEventListener('click', handleSaveIncome);

        // Transaction type change handler
        transactionTypeSelect.addEventListener('change', updateCategoryOptions);

        // Budget period change handler
        budgetPeriodSelect.addEventListener('change', handleBudgetPeriodChange);
    }

    // Navigation Handlers
    function handleNavigation(event) {
        event.preventDefault();
        const targetSection = event.currentTarget.getAttribute('data-section');
        
        // Update active link
        navLinks.forEach(link => {
            if (link.getAttribute('data-section') === targetSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Show target section, hide others
        sections.forEach(section => {
            if (section.id === targetSection) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Redraw charts if needed when section becomes visible
        if (targetSection === 'overview') {
            renderAllCharts();
        }
    }

    // Modal Handlers
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Reset form before opening
        if (modalId === 'add-transaction-modal') {
            resetTransactionForm();
        } else if (modalId === 'add-budget-modal') {
            resetBudgetForm();
        } else if (modalId === 'add-goal-modal') {
            resetGoalForm();
        } else if (modalId === 'add-account-modal') {
            resetAccountForm();
        } else if (modalId === 'import-bank-modal') {
            resetImportForm();
        } else if (modalId === 'add-income-modal') {
            resetIncomeForm();
        }
        
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }

    function closeCurrentModal() {
        const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.classList.remove('modal-open');
    }

    // Form Reset Functions
    function resetTransactionForm() {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        transactionDateInput.value = today;
        
        // Reset other fields
        transactionAmountInput.value = '';
        transactionTypeSelect.value = 'expense';
        updateCategoryOptions(); // Update categories based on default type
        transactionDescriptionInput.value = '';
        
        // Populate account select
        populateAccountSelect();
    }

    function resetBudgetForm() {
        budgetCategoryInput.value = '';
        budgetAmountInput.value = '';
        budgetPeriodSelect.value = 'monthly';
        
        // Set default dates for monthly period
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        
        budgetStartDateInput.value = firstDay;
        budgetEndDateInput.value = lastDay;
        budgetNotesInput.value = '';
    }

    function resetGoalForm() {
        goalNameInput.value = '';
        goalAmountInput.value = '';
        goalCurrentInput.value = '0';
        
        // Set default date to end of year
        const today = new Date();
        const endOfYear = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
        goalDateInput.value = endOfYear;
        goalCategorySelect.value = 'savings';
    }

    function resetAccountForm() {
        accountNameInput.value = '';
        accountTypeSelect.value = 'checking';
        accountInstitutionInput.value = '';
        accountBalanceInput.value = '';
        accountCurrencyInput.value = 'USD';
    }

    function resetImportForm() {
        importDataTextarea.value = '';
    }

    function resetIncomeForm() {
        // Pre-fill with existing values if available
        if (currentUser && currentUser.settings) {
            annualIncomeInput.value = currentUser.settings.annualIncome || '';
            spouseIncomeInput.value = currentUser.settings.spouseIncome || '';
            netWorthInput.value = currentUser.settings.netWorth || '';
        } else {
            annualIncomeInput.value = '';
            spouseIncomeInput.value = '';
            netWorthInput.value = '';
        }
    }

    // UI Utility Functions
    function showLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }

    function hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    function showAlert(message, type = 'info', duration = 5000) {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) return;
        
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type}`;
        alertElement.textContent = message;
        
        alertContainer.appendChild(alertElement);
        
        // Auto-hide after duration
        if (type !== 'error') {
            setTimeout(() => {
                alertElement.classList.add('fade-out');
                setTimeout(() => {
                    alertContainer.removeChild(alertElement);
                }, 300);
            }, duration);
        } else {
            // Add close button for errors
            const closeButton = document.createElement('button');
            closeButton.className = 'alert-close';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => {
                alertElement.classList.add('fade-out');
                setTimeout(() => {
                    alertContainer.removeChild(alertElement);
                }, 300);
            });
            alertElement.appendChild(closeButton);
        }
    }

    function formatCurrency(amount, currency = 'USD') {
        if (isNaN(amount)) return '$0.00';
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    function formatPercentage(value) {
        if (isNaN(value)) return '0%';
        
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(value / 100);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }

    // Category options handling
    function updateCategoryOptions() {
        const transactionType = transactionTypeSelect.value;
        transactionCategorySelect.innerHTML = '';
        
        let categories = [];
        
        if (transactionType === 'income') {
            categories = [
                'Salary', 'Freelance', 'Investments', 'Interest', 'Gifts', 'Refunds', 'Other Income'
            ];
        } else if (transactionType === 'expense') {
            categories = [
                'Housing', 'Transportation', 'Food', 'Utilities', 'Insurance', 
                'Healthcare', 'Debt Payments', 'Entertainment', 'Shopping', 
                'Personal Care', 'Education', 'Travel', 'Gifts & Donations', 'Taxes', 'Other Expenses'
            ];
        } else if (transactionType === 'transfer') {
            categories = ['Transfer'];
        }
        
        // Add options to select
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            transactionCategorySelect.appendChild(option);
        });
    }

    // Account select population
    function populateAccountSelect() {
        transactionAccountSelect.innerHTML = '';
        
        if (accounts.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No accounts available';
            transactionAccountSelect.appendChild(option);
            return;
        }
        
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account._id;
            option.textContent = `${account.name} (${formatCurrency(account.balance, account.currency)})`;
            transactionAccountSelect.appendChild(option);
        });
    }

    // Budget period change handler
    function handleBudgetPeriodChange() {
        const period = budgetPeriodSelect.value;
        const today = new Date();
        
        if (period === 'monthly') {
            // Set to current month
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
            
            budgetStartDateInput.value = firstDay;
            budgetEndDateInput.value = lastDay;
        } else if (period === 'yearly') {
            // Set to current year
            const firstDay = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
            const lastDay = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
            
            budgetStartDateInput.value = firstDay;
            budgetEndDateInput.value = lastDay;
        } else if (period === 'weekly') {
            // Set to current week
            const currentDay = today.getDay(); // 0-6, 0 being Sunday
            const firstDay = new Date(today);
            firstDay.setDate(today.getDate() - currentDay);
            
            const lastDay = new Date(firstDay);
            lastDay.setDate(firstDay.getDate() + 6);
            
            budgetStartDateInput.value = firstDay.toISOString().split('T')[0];
            budgetEndDateInput.value = lastDay.toISOString().split('T')[0];
        }
        // For custom period, let user pick the dates
    }

    // Data Loading Functions
    async function loadUserProfile() {
        try {
            const response = await api.getUserProfile();
            if (response.success) {
                currentUser = response.data;
                // Update UI with user info
                const userNameElement = document.getElementById('user-name');
                if (userNameElement && currentUser.name) {
                    userNameElement.textContent = currentUser.name;
                }
                return currentUser;
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            showAlert('Failed to load user profile. Please reload the page.', 'error');
            if (error.response && error.response.status === 401) {
                // Handle unauthorized: redirect to login
                window.location.href = '/login.html';
            }
        }
        return null;
    }

    async function loadTransactions(params = {}) {
        try {
            const response = await api.getTransactions(params);
            if (response.success) {
                transactions = response.data;
                return transactions;
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            showAlert('Failed to load transaction data.', 'error');
        }
        return [];
    }

    async function loadBudgets() {
        try {
            const response = await api.getBudgets();
            if (response.success) {
                budgets = response.data;
                return budgets;
            }
        } catch (error) {
            console.error('Error loading budgets:', error);
            showAlert('Failed to load budget data.', 'error');
        }
        return [];
    }

    async function loadGoals() {
        try {
            const response = await api.getGoals();
            if (response.success) {
                goals = response.data;
                return goals;
            }
        } catch (error) {
            console.error('Error loading goals:', error);
            showAlert('Failed to load goal data.', 'error');
        }
        return [];
    }

    async function loadAccounts() {
        try {
            const response = await api.getAccounts();
            if (response.success) {
                accounts = response.data;
                return accounts;
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
            showAlert('Failed to load account data.', 'error');
        }
        return [];
    }

    async function loadMonthlyData() {
        try {
            const response = await api.getMonthlyData();
            if (response.success) {
                monthlyData = response.data;
                return monthlyData;
            }
        } catch (error) {
            console.error('Error loading monthly data:', error);
            showAlert('Failed to load monthly financial data.', 'error');
        }
        return [];
    }

    // Form Submit Handlers
    async function handleSaveTransaction() {
        // Input validation
        if (!transactionDateInput.value) {
            showAlert('Please select a date for the transaction.', 'error');
            return;
        }

        if (!transactionAmountInput.value || isNaN(transactionAmountInput.value) || parseFloat(transactionAmountInput.value) <= 0) {
            showAlert('Please enter a valid amount for the transaction.', 'error');
            return;
        }

        if (!transactionCategorySelect.value) {
            showAlert('Please select a category for the transaction.', 'error');
            return;
        }

        if (!transactionAccountSelect.value) {
            showAlert('Please select an account for the transaction.', 'error');
            return;
        }

        // Prepare transaction data
        const transactionData = {
            date: transactionDateInput.value,
            amount: parseFloat(transactionAmountInput.value),
            type: transactionTypeSelect.value,
            category: transactionCategorySelect.value,
            description: transactionDescriptionInput.value,
            account: transactionAccountSelect.value
        };

        try {
            showLoader();
            const response = await api.addTransaction(transactionData);
            
            if (response.success) {
                showAlert('Transaction added successfully!', 'success');
                closeCurrentModal();
                
                // Refresh data and UI
                await Promise.all([
                    loadTransactions(),
                    loadAccounts(),
                    loadMonthlyData()
                ]);
                
                updateFinancialStatistics();
                populateTables();
                renderAllCharts();
            } else {
                showAlert(response.message || 'Failed to add transaction.', 'error');
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
            showAlert(error.message || 'Failed to add transaction. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    async function handleSaveBudget() {
        // Input validation
        if (!budgetCategoryInput.value) {
            showAlert('Please enter a category for the budget.', 'error');
            return;
        }

        if (!budgetAmountInput.value || isNaN(budgetAmountInput.value) || parseFloat(budgetAmountInput.value) <= 0) {
            showAlert('Please enter a valid amount for the budget.', 'error');
            return;
        }

        if (!budgetStartDateInput.value || !budgetEndDateInput.value) {
            showAlert('Please select start and end dates for the budget period.', 'error');
            return;
        }

        // Prepare budget data
        const budgetData = {
            category: budgetCategoryInput.value,
            amount: parseFloat(budgetAmountInput.value),
            period: budgetPeriodSelect.value,
            startDate: budgetStartDateInput.value,
            endDate: budgetEndDateInput.value,
            notes: budgetNotesInput.value
        };

        try {
            showLoader();
            const response = await api.addBudget(budgetData);
            
            if (response.success) {
                showAlert('Budget added successfully!', 'success');
                closeCurrentModal();
                
                // Refresh data and UI
                await loadBudgets();
                populateTables();
                renderBudgetChart();
            } else {
                showAlert(response.message || 'Failed to add budget.', 'error');
            }
        } catch (error) {
            console.error('Error adding budget:', error);
            showAlert(error.message || 'Failed to add budget. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    async function handleSaveGoal() {
        // Input validation
        if (!goalNameInput.value) {
            showAlert('Please enter a name for the goal.', 'error');
            return;
        }

        if (!goalAmountInput.value || isNaN(goalAmountInput.value) || parseFloat(goalAmountInput.value) <= 0) {
            showAlert('Please enter a valid target amount for the goal.', 'error');
            return;
        }

        if (!goalDateInput.value) {
            showAlert('Please select a target date for the goal.', 'error');
            return;
        }

        // Prepare goal data
        const goalData = {
            name: goalNameInput.value,
            targetAmount: parseFloat(goalAmountInput.value),
            currentAmount: parseFloat(goalCurrentInput.value) || 0,
            targetDate: goalDateInput.value,
            category: goalCategorySelect.value
        };

        try {
            showLoader();
            const response = await api.addGoal(goalData);
            
            if (response.success) {
                showAlert('Goal added successfully!', 'success');
                closeCurrentModal();
                
                // Refresh data and UI
                await loadGoals();
                populateTables();
                renderGoalsChart();
            } else {
                showAlert(response.message || 'Failed to add goal.', 'error');
            }
        } catch (error) {
            console.error('Error adding goal:', error);
            showAlert(error.message || 'Failed to add goal. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    async function handleSaveAccount() {
        // Input validation
        if (!accountNameInput.value) {
            showAlert('Please enter a name for the account.', 'error');
            return;
        }

        if (!accountTypeSelect.value) {
            showAlert('Please select an account type.', 'error');
            return;
        }

        if (!accountInstitutionInput.value) {
            showAlert('Please enter the financial institution name.', 'error');
            return;
        }

        if (!accountBalanceInput.value || isNaN(accountBalanceInput.value)) {
            showAlert('Please enter a valid balance for the account.', 'error');
            return;
        }

        // Prepare account data
        const accountData = {
            name: accountNameInput.value,
            type: accountTypeSelect.value,
            institution: accountInstitutionInput.value,
            balance: parseFloat(accountBalanceInput.value),
            currency: accountCurrencyInput.value || 'USD',
            isManual: true
        };

        try {
            showLoader();
            const response = await api.addAccount(accountData);
            
            if (response.success) {
                showAlert('Account added successfully!', 'success');
                closeCurrentModal();
                
                // Refresh data and UI
                await loadAccounts();
                populateTables();
                updateFinancialStatistics();
                renderBalanceChart();
            } else {
                showAlert(response.message || 'Failed to add account.', 'error');
            }
        } catch (error) {
            console.error('Error adding account:', error);
            showAlert(error.message || 'Failed to add account. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    async function handleImportData() {
        // Input validation
        if (!importDataTextarea.value.trim()) {
            showAlert('Please paste your bank statement data for import.', 'error');
            return;
        }

        // Prepare import data
        const importData = {
            data: importDataTextarea.value.trim()
        };

        try {
            showLoader();
            const response = await api.importBankData(importData);
            
            if (response.success) {
                showAlert('Bank data imported successfully!', 'success');
                closeCurrentModal();
                
                // Refresh all data and UI
                await Promise.all([
                    loadTransactions(),
                    loadAccounts(),
                    loadMonthlyData()
                ]);
                
                updateFinancialStatistics();
                populateTables();
                renderAllCharts();
            } else {
                showAlert(response.message || 'Failed to import bank data.', 'error');
            }
        } catch (error) {
            console.error('Error importing bank data:', error);
            showAlert(error.message || 'Failed to import bank data. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    async function handleSaveIncome() {
        // Input validation
        if (!annualIncomeInput.value || isNaN(annualIncomeInput.value)) {
            showAlert('Please enter a valid annual income.', 'error');
            return;
        }

        // Prepare income data
        const incomeData = {
            annualIncome: parseFloat(annualIncomeInput.value),
            spouseIncome: parseFloat(spouseIncomeInput.value) || 0,
            netWorth: parseFloat(netWorthInput.value) || 0
        };

        try {
            showLoader();
            const response = await api.updateUserSettings(incomeData);
            
            if (response.success) {
                showAlert('Income and net worth updated successfully!', 'success');
                closeCurrentModal();
                
                // Refresh user profile
                await loadUserProfile();
                updateFinancialStatistics();
            } else {
                showAlert(response.message || 'Failed to update income data.', 'error');
            }
        } catch (error) {
            console.error('Error updating income:', error);
            showAlert(error.message || 'Failed to update income data. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    // UI Update Functions
    function updateFinancialStatistics() {
        try {
            let totalBalance = 0;
            let monthlyIncome = 0;
            let monthlyExpenses = 0;
            let savingsRate = 0;
            
            // Calculate total balance from accounts
            if (accounts && accounts.length > 0) {
                totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
            }
            
            // Calculate monthly income and expenses from monthly data
            if (monthlyData && monthlyData.length > 0) {
                // Get current month data
                const now = new Date();
                const currentMonth = now.getMonth() + 1; // Javascript months are 0-indexed
                const currentYear = now.getFullYear();
                
                const currentMonthData = monthlyData.find(data => 
                    data.month === currentMonth && data.year === currentYear
                );
                
                if (currentMonthData) {
                    monthlyIncome = currentMonthData.income || 0;
                    monthlyExpenses = currentMonthData.expenses || 0;
                    
                    // Calculate savings rate
                    if (monthlyIncome > 0) {
                        savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
                    }
                }
            }
            
            // Update UI elements
            if (totalBalanceElement) {
                totalBalanceElement.textContent = formatCurrency(totalBalance);
            }
            
            if (monthlyIncomeElement) {
                monthlyIncomeElement.textContent = formatCurrency(monthlyIncome);
            }
            
            if (monthlyExpensesElement) {
                monthlyExpensesElement.textContent = formatCurrency(monthlyExpenses);
            }
            
            if (savingsRateElement) {
                savingsRateElement.textContent = formatPercentage(savingsRate);
            }
        } catch (error) {
            console.error('Error updating financial statistics:', error);
        }
    }

    function populateTables() {
        populateTransactionsTable();
        populateBudgetsTable();
        populateGoalsTable();
        populateAccountsTable();
    }

    function populateTransactionsTable() {
        if (!transactionsTable) return;
        
        // Clear existing rows
        transactionsTable.innerHTML = '';
        
        if (!transactions || transactions.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="6" class="empty-table">No transactions found. Add your first transaction!</td>`;
            transactionsTable.appendChild(emptyRow);
            return;
        }
        
        // Sort transactions by date (newest first)
        const sortedTransactions = [...transactions].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        // Get recent transactions (last 10)
        const recentTransactions = sortedTransactions.slice(0, 10);
        
        // Populate table with transactions
        recentTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.className = transaction.type;
            
            // Find account name
            const account = accounts.find(a => a._id === transaction.account);
            const accountName = account ? account.name : 'Unknown Account';
            
            // Create row
            row.innerHTML = `
                <td>${formatDate(transaction.date)}</td>
                <td>${transaction.description || '-'}</td>
                <td>${transaction.category}</td>
                <td>${accountName}</td>
                <td class="${transaction.type === 'expense' ? 'negative' : 'positive'}">${formatCurrency(transaction.amount)}</td>
                <td>
                    <button class="btn-icon edit-transaction" data-id="${transaction._id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-transaction" data-id="${transaction._id}" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            transactionsTable.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        const editButtons = transactionsTable.querySelectorAll('.edit-transaction');
        const deleteButtons = transactionsTable.querySelectorAll('.delete-transaction');
        
        editButtons.forEach(button => {
            button.addEventListener('click', () => handleEditTransaction(button.getAttribute('data-id')));
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => handleDeleteTransaction(button.getAttribute('data-id')));
        });
    }

    function populateBudgetsTable() {
        if (!budgetsTable) return;
        
        // Clear existing rows
        budgetsTable.innerHTML = '';
        
        if (!budgets || budgets.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="6" class="empty-table">No budgets found. Create your first budget!</td>`;
            budgetsTable.appendChild(emptyRow);
            return;
        }
        
        // Populate table with budgets
        budgets.forEach(budget => {
            const row = document.createElement('tr');
            
            // Calculate spent amount for this budget
            let spentAmount = 0;
            if (transactions && transactions.length > 0) {
                // Filter transactions by category and date range
                const budgetTransactions = transactions.filter(transaction => {
                    const transactionDate = new Date(transaction.date);
                    const startDate = new Date(budget.startDate);
                    const endDate = new Date(budget.endDate);
                    
                    return transaction.category === budget.category && 
                           transaction.type === 'expense' &&
                           transactionDate >= startDate && 
                           transactionDate <= endDate;
                });
                
                // Sum up the amounts
                spentAmount = budgetTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
            }
            
            // Calculate percentage spent
            const percentSpent = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;
            const remainingAmount = budget.amount - spentAmount;
            
            // Create row
            row.innerHTML = `
                <td>${budget.category}</td>
                <td>${formatCurrency(budget.amount)}</td>
                <td>${formatCurrency(spentAmount)} (${percentSpent.toFixed(1)}%)</td>
                <td>${formatCurrency(remainingAmount)}</td>
                <td>${formatDate(budget.startDate)} - ${formatDate(budget.endDate)}</td>
                <td>
                    <button class="btn-icon edit-budget" data-id="${budget._id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-budget" data-id="${budget._id}" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            budgetsTable.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        const editButtons = budgetsTable.querySelectorAll('.edit-budget');
        const deleteButtons = budgetsTable.querySelectorAll('.delete-budget');
        
        editButtons.forEach(button => {
            button.addEventListener('click', () => handleEditBudget(button.getAttribute('data-id')));
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => handleDeleteBudget(button.getAttribute('data-id')));
        });
    }

    function populateGoalsTable() {
        if (!goalsTable) return;
        
        // Clear existing rows
        goalsTable.innerHTML = '';
        
        if (!goals || goals.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="6" class="empty-table">No goals found. Create your first financial goal!</td>`;
            goalsTable.appendChild(emptyRow);
            return;
        }
        
        // Populate table with goals
        goals.forEach(goal => {
            const row = document.createElement('tr');
            
            // Calculate progress percentage
            const progressPercentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const remainingAmount = goal.targetAmount - goal.currentAmount;
            
            // Calculate time remaining
            const today = new Date();
            const targetDate = new Date(goal.targetDate);
            const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
            
            let timeRemainingText = '';
            if (daysRemaining < 0) {
                timeRemainingText = 'Expired';
            } else if (daysRemaining === 0) {
                timeRemainingText = 'Today';
            } else if (daysRemaining === 1) {
                timeRemainingText = '1 day';
            } else {
                timeRemainingText = `${daysRemaining} days`;
            }
            
            // Create row
            row.innerHTML = `
                <td>${goal.name}</td>
                <td>${formatCurrency(goal.targetAmount)}</td>
                <td>${formatCurrency(goal.currentAmount)} (${progressPercentage.toFixed(1)}%)</td>
                <td>${formatCurrency(remainingAmount)}</td>
                <td>${formatDate(goal.targetDate)} (${timeRemainingText})</td>
                <td>
                    <button class="btn-icon edit-goal" data-id="${goal._id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-goal" data-id="${goal._id}" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            goalsTable.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        const editButtons = goalsTable.querySelectorAll('.edit-goal');
        const deleteButtons = goalsTable.querySelectorAll('.delete-goal');
        
        editButtons.forEach(button => {
            button.addEventListener('click', () => handleEditGoal(button.getAttribute('data-id')));
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => handleDeleteGoal(button.getAttribute('data-id')));
        });
    }

    function populateAccountsTable() {
        if (!accountsTable) return;
        
        // Clear existing rows
        accountsTable.innerHTML = '';
        
        if (!accounts || accounts.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="5" class="empty-table">No accounts found. Add your first account!</td>`;
            accountsTable.appendChild(emptyRow);
            return;
        }
        
        // Populate table with accounts
        accounts.forEach(account => {
            const row = document.createElement('tr');
            
            // Format account type for display
            const accountTypeDisplay = account.type.charAt(0).toUpperCase() + account.type.slice(1);
            
            // Create row
            row.innerHTML = `
                <td>${account.name}</td>
                <td>${accountTypeDisplay}</td>
                <td>${account.institution}</td>
                <td>${formatCurrency(account.balance, account.currency)}</td>
                <td>
                    <button class="btn-icon edit-account" data-id="${account._id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-account" data-id="${account._id}" title="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            accountsTable.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        const editButtons = accountsTable.querySelectorAll('.edit-account');
        const deleteButtons = accountsTable.querySelectorAll('.delete-account');
        
        editButtons.forEach(button => {
            button.addEventListener('click', () => handleEditAccount(button.getAttribute('data-id')));
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => handleDeleteAccount(button.getAttribute('data-id')));
        });
    }

    // Item Edit/Delete Handlers
    async function handleEditTransaction(transactionId) {
        try {
            showLoader();
            const transaction = transactions.find(t => t._id === transactionId);
            
            if (!transaction) {
                showAlert('Transaction not found.', 'error');
                hideLoader();
                return;
            }
            
            // Populate form fields with transaction data
            transactionDateInput.value = transaction.date.substring(0, 10); // Format as YYYY-MM-DD
            transactionAmountInput.value = transaction.amount;
            transactionTypeSelect.value = transaction.type;
            updateCategoryOptions(); // Update categories based on type
            
            // Need to set category after categories are populated
            setTimeout(() => {
                transactionCategorySelect.value = transaction.category;
            }, 0);
            
            transactionDescriptionInput.value = transaction.description || '';
            
            // Set up account selection
            populateAccountSelect();
            
            // Need to set account after accounts are populated
            setTimeout(() => {
                transactionAccountSelect.value = transaction.account;
            }, 0);
            
            // Store transaction ID in a data attribute for the save handler
            saveTransactionBtn.setAttribute('data-edit-id', transactionId);
            
            // Open modal
            openModal('add-transaction-modal');
            
            // Update save button event handler
            saveTransactionBtn.removeEventListener('click', handleSaveTransaction);
            saveTransactionBtn.addEventListener('click', handleUpdateTransaction);
            
            hideLoader();
        } catch (error) {
            console.error('Error editing transaction:', error);
            showAlert('Failed to load transaction data for editing.', 'error');
            hideLoader();
        }
    }

    async function handleDeleteTransaction(transactionId) {
        try {
            if (!confirm('Are you sure you want to delete this transaction?')) {
                return;
            }
            
            showLoader();
            const response = await api.deleteTransaction(transactionId);
            
            if (response.success) {
                showAlert('Transaction deleted successfully!', 'success');
                
                // Refresh data and UI
                await Promise.all([
                    loadTransactions(),
                    loadAccounts(),
                    loadMonthlyData()
                ]);
                
                updateFinancialStatistics();
                populateTables();
                renderAllCharts();
            } else {
                showAlert(response.message || 'Failed to delete transaction.', 'error');
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showAlert(error.message || 'Failed to delete transaction. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    async function handleUpdateTransaction() {
        const transactionId = saveTransactionBtn.getAttribute('data-edit-id');
        if (!transactionId) {
            showAlert('Transaction ID not found for update.', 'error');
            return;
        }
        
        // Input validation (same as add)
        if (!transactionDateInput.value) {
            showAlert('Please select a date for the transaction.', 'error');
            return;
        }

        if (!transactionAmountInput.value || isNaN(transactionAmountInput.value) || parseFloat(transactionAmountInput.value) <= 0) {
            showAlert('Please enter a valid amount for the transaction.', 'error');
            return;
        }

        if (!transactionCategorySelect.value) {
            showAlert('Please select a category for the transaction.', 'error');
            return;
        }

        if (!transactionAccountSelect.value) {
            showAlert('Please select an account for the transaction.', 'error');
            return;
        }

        // Prepare transaction data
        const transactionData = {
            date: transactionDateInput.value,
            amount: parseFloat(transactionAmountInput.value),
            type: transactionTypeSelect.value,
            category: transactionCategorySelect.value,
            description: transactionDescriptionInput.value,
            account: transactionAccountSelect.value
        };

        try {
            showLoader();
            const response = await api.updateTransaction(transactionId, transactionData);
            
            if (response.success) {
                showAlert('Transaction updated successfully!', 'success');
                closeCurrentModal();
                
                // Reset save button back to add handler
                saveTransactionBtn.removeAttribute('data-edit-id');
                saveTransactionBtn.removeEventListener('click', handleUpdateTransaction);
                saveTransactionBtn.addEventListener('click', handleSaveTransaction);
                
                // Refresh data and UI
                await Promise.all([
                    loadTransactions(),
                    loadAccounts(),
                    loadMonthlyData()
                ]);
                
                updateFinancialStatistics();
                populateTables();
                renderAllCharts();
            } else {
                showAlert(response.message || 'Failed to update transaction.', 'error');
            }
        } catch (error) {
            console.error('Error updating transaction:', error);
            showAlert(error.message || 'Failed to update transaction. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    // Similar handlers for budget, goal, and account edit/delete
    async function handleEditBudget(budgetId) {
        try {
            showLoader();
            const budget = budgets.find(b => b._id === budgetId);
            
            if (!budget) {
                showAlert('Budget not found.', 'error');
                hideLoader();
                return;
            }
            
            // Populate form fields with budget data
            budgetCategoryInput.value = budget.category;
            budgetAmountInput.value = budget.amount;
            budgetPeriodSelect.value = budget.period;
            budgetStartDateInput.value = budget.startDate.substring(0, 10);
            budgetEndDateInput.value = budget.endDate.substring(0, 10);
            budgetNotesInput.value = budget.notes || '';
            
            // Store budget ID in a data attribute for the save handler
            saveBudgetBtn.setAttribute('data-edit-id', budgetId);
            
            // Open modal
            openModal('add-budget-modal');
            
            // Update save button event handler
            saveBudgetBtn.removeEventListener('click', handleSaveBudget);
            saveBudgetBtn.addEventListener('click', handleUpdateBudget);
            
            hideLoader();
        } catch (error) {
            console.error('Error editing budget:', error);
            showAlert('Failed to load budget data for editing.', 'error');
            hideLoader();
        }
    }

    async function handleDeleteBudget(budgetId) {
        try {
            if (!confirm('Are you sure you want to delete this budget?')) {
                return;
            }
            
            showLoader();
            const response = await api.deleteBudget(budgetId);
            
            if (response.success) {
                showAlert('Budget deleted successfully!', 'success');
                
                // Refresh data and UI
                await loadBudgets();
                populateTables();
                renderBudgetChart();
            } else {
                showAlert(response.message || 'Failed to delete budget.', 'error');
            }
        } catch (error) {
            console.error('Error deleting budget:', error);
            showAlert(error.message || 'Failed to delete budget. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    async function handleUpdateBudget() {
        const budgetId = saveBudgetBtn.getAttribute('data-edit-id');
        if (!budgetId) {
            showAlert('Budget ID not found for update.', 'error');
            return;
        }
        
        // Input validation (same as add)
        if (!budgetCategoryInput.value) {
            showAlert('Please enter a category for the budget.', 'error');
            return;
        }

        if (!budgetAmountInput.value || isNaN(budgetAmountInput.value) || parseFloat(budgetAmountInput.value) <= 0) {
            showAlert('Please enter a valid amount for the budget.', 'error');
            return;
        }

        if (!budgetStartDateInput.value || !budgetEndDateInput.value) {
            showAlert('Please select start and end dates for the budget period.', 'error');
            return;
        }

        // Prepare budget data
        const budgetData = {
            category: budgetCategoryInput.value,
            amount: parseFloat(budgetAmountInput.value),
            period: budgetPeriodSelect.value,
            startDate: budgetStartDateInput.value,
            endDate: budgetEndDateInput.value,
            notes: budgetNotesInput.value
        };

        try {
            showLoader();
            const response = await api.updateBudget(budgetId, budgetData);
            
            if (response.success) {
                showAlert('Budget updated successfully!', 'success');
                closeCurrentModal();
                
                // Reset save button back to add handler
                saveBudgetBtn.removeAttribute('data-edit-id');
                saveBudgetBtn.removeEventListener('click', handleUpdateBudget);
                saveBudgetBtn.addEventListener('click', handleSaveBudget);
                
                // Refresh data and UI
                await loadBudgets();
                populateTables();
                renderBudgetChart();
            } else {
                showAlert(response.message || 'Failed to update budget.', 'error');
            }
        } catch (error) {
            console.error('Error updating budget:', error);
            showAlert(error.message || 'Failed to update budget. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    // Chart Rendering Functions
    function renderAllCharts() {
        renderBalanceChart();
        renderIncomeExpenseChart();
        renderSpendingByCategory();
        renderSavingsTrend();
        renderBudgetChart();
        renderGoalsChart();
    }

    function renderBalanceChart() {
        if (!balanceChartContainer) return;
        
        // Clear any existing chart
        if (chartInstances.balanceChart) {
            chartInstances.balanceChart.destroy();
        }
        
        if (!accounts || accounts.length === 0) {
            balanceChartContainer.innerHTML = '<div class="empty-chart">Add accounts to see your balance distribution</div>';
            return;
        }
        
        // Prepare data for chart
        const accountLabels = accounts.map(account => account.name);
        const accountBalances = accounts.map(account => account.balance);
        const accountColors = generateRandomColors(accounts.length);
        
        // Create chart
        const ctx = balanceChartContainer.getContext('2d');
        chartInstances.balanceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: accountLabels,
                datasets: [{
                    data: accountBalances,
                    backgroundColor: accountColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderIncomeExpenseChart() {
        if (!incomeExpenseChartContainer) return;
        
        // Clear any existing chart
        if (chartInstances.incomeExpenseChart) {
            chartInstances.incomeExpenseChart.destroy();
        }
        
        if (!monthlyData || monthlyData.length === 0) {
            incomeExpenseChartContainer.innerHTML = '<div class="empty-chart">Add transactions to see your income vs. expenses</div>';
            return;
        }
        
        // Get last 6 months of data or all if less
        const last6Months = monthlyData.slice(-6);
        
        // Prepare data for chart
        const labels = last6Months.map(data => {
            const date = new Date(data.year, data.month - 1);
            return date.toLocaleString('default', { month: 'short', year: 'numeric' });
        });
        
        const incomeData = last6Months.map(data => data.income || 0);
        const expensesData = last6Months.map(data => data.expenses || 0);
        
        // Create chart
        const ctx = incomeExpenseChartContainer.getContext('2d');
        chartInstances.incomeExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses',
                        data: expensesData,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderSpendingByCategory() {
        if (!spendingChartContainer) return;
        
        // Clear any existing chart
        if (chartInstances.spendingChart) {
            chartInstances.spendingChart.destroy();
        }
        
        if (!transactions || transactions.length === 0) {
            spendingChartContainer.innerHTML = '<div class="empty-chart">Add transactions to see your spending by category</div>';
            return;
        }
        
        // Filter for expenses only and current month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const currentMonthExpenses = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transaction.type === 'expense' && 
                   transactionDate.getMonth() === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
        });
        
        if (currentMonthExpenses.length === 0) {
            spendingChartContainer.innerHTML = '<div class="empty-chart">No expenses recorded for the current month</div>';
            return;
        }
        
        // Group by category and sum amounts
        const categoryData = {};
        currentMonthExpenses.forEach(transaction => {
            if (!categoryData[transaction.category]) {
                categoryData[transaction.category] = 0;
            }
            categoryData[transaction.category] += transaction.amount;
        });
        
        // Prepare data for chart
        const categories = Object.keys(categoryData);
        const amounts = Object.values(categoryData);
        const colors = generateRandomColors(categories.length);
        
        // Create chart
        const ctx = spendingChartContainer.getContext('2d');
        chartInstances.spendingChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderSavingsTrend() {
        if (!savingsChartContainer) return;
        
        // Clear any existing chart
        if (chartInstances.savingsChart) {
            chartInstances.savingsChart.destroy();
        }
        
        if (!monthlyData || monthlyData.length === 0) {
            savingsChartContainer.innerHTML = '<div class="empty-chart">Add transactions to see your savings trend</div>';
            return;
        }
        
        // Get last 12 months of data or all if less
        const last12Months = monthlyData.slice(-12);
        
        // Prepare data for chart
        const labels = last12Months.map(data => {
            const date = new Date(data.year, data.month - 1);
            return date.toLocaleString('default', { month: 'short', year: 'numeric' });
        });
        
        const savingsData = last12Months.map(data => {
            if (data.income > 0) {
                return ((data.income - data.expenses) / data.income) * 100;
            }
            return 0;
        });
        
        // Create chart
        const ctx = savingsChartContainer.getContext('2d');
        chartInstances.savingsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Savings Rate',
                    data: savingsData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value.toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderBudgetChart() {
        if (!budgetProgressChartContainer) return;
        
        // Clear any existing chart
        if (chartInstances.budgetChart) {
            chartInstances.budgetChart.destroy();
        }
        
        if (!budgets || budgets.length === 0) {
            budgetProgressChartContainer.innerHTML = '<div class="empty-chart">Add budgets to see your spending against budget</div>';
            return;
        }
        
        // Prepare data for chart
        const budgetLabels = [];
        const budgetAmounts = [];
        const spentAmounts = [];
        
        // Calculate current spending for each budget
        budgets.forEach(budget => {
            let spentAmount = 0;
            if (transactions && transactions.length > 0) {
                // Filter transactions by category and date range
                const budgetTransactions = transactions.filter(transaction => {
                    const transactionDate = new Date(transaction.date);
                    const startDate = new Date(budget.startDate);
                    const endDate = new Date(budget.endDate);
                    
                    return transaction.category === budget.category && 
                           transaction.type === 'expense' &&
                           transactionDate >= startDate && 
                           transactionDate <= endDate;
                });
                
                // Sum up the amounts
                spentAmount = budgetTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
            }
            
            budgetLabels.push(budget.category);
            budgetAmounts.push(budget.amount);
            spentAmounts.push(spentAmount);
        });
        
        // Create chart
        const ctx = budgetProgressChartContainer.getContext('2d');
        chartInstances.budgetChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: budgetLabels,
                datasets: [
                    {
                        label: 'Budget',
                        data: budgetAmounts,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Spent',
                        data: spentAmounts,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    function renderGoalsChart() {
        if (!goalsProgressChartContainer) return;
        
        // Clear any existing chart
        if (chartInstances.goalsChart) {
            chartInstances.goalsChart.destroy();
        }
        
        if (!goals || goals.length === 0) {
            goalsProgressChartContainer.innerHTML = '<div class="empty-chart">Add financial goals to track your progress</div>';
            return;
        }
        
        // Prepare data for chart
        const goalLabels = goals.map(goal => goal.name);
        const targetAmounts = goals.map(goal => goal.targetAmount);
        const currentAmounts = goals.map(goal => goal.currentAmount);
        
        // Create chart
        const ctx = goalsProgressChartContainer.getContext('2d');
        chartInstances.goalsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: goalLabels,
                datasets: [
                    {
                        label: 'Target',
                        data: targetAmounts,
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Current',
                        data: currentAmounts,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                const datasetIndex = context.datasetIndex;
                                const index = context.dataIndex;
                                
                                if (datasetIndex === 1) { // Current amount
                                    const target = targetAmounts[index];
                                    const percentage = target > 0 ? ((value / target) * 100).toFixed(1) : 0;
                                    return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                                }
                                
                                return `${label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Helper functions
    function generateRandomColors(count) {
        const colors = [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 255, 0.6)',
            'rgba(54, 162, 64, 0.6)',
            'rgba(153, 206, 86, 0.6)',
            'rgba(75, 192, 128, 0.6)'
        ];
        
        // If we need more colors than we have in our predefined set
        if (count > colors.length) {
            for (let i = colors.length; i < count; i++) {
                const r = Math.floor(Math.random() * 255);
                const g = Math.floor(Math.random() * 255);
                const b = Math.floor(Math.random() * 255);
                colors.push(`rgba(${r}, ${g}, ${b}, 0.6)`);
            }
        }
        
        return colors.slice(0, count);
    }

    // Add remaining edit/delete handlers
    async function handleEditGoal(goalId) {
        try {
            showLoader();
            const goal = goals.find(g => g._id === goalId);
            
            if (!goal) {
                showAlert('Goal not found.', 'error');
                hideLoader();
                return;
            }
            
            // Populate form fields with goal data
            goalNameInput.value = goal.name;
            goalAmountInput.value = goal.targetAmount;
            goalCurrentInput.value = goal.currentAmount;
            goalDateInput.value = goal.targetDate.substring(0, 10);
            goalCategorySelect.value = goal.category;
            
            // Store goal ID in a data attribute for the save handler
            saveGoalBtn.setAttribute('data-edit-id', goalId);
            
            // Open modal
            openModal('add-goal-modal');
            
            // Update save button event handler
            saveGoalBtn.removeEventListener('click', handleSaveGoal);
            saveGoalBtn.addEventListener('click', handleUpdateGoal);
            
            hideLoader();
        } catch (error) {
            console.error('Error editing goal:', error);
            showAlert('Failed to load goal data for editing.', 'error');
            hideLoader();
        }
    }

    async function handleDeleteGoal(goalId) {
        try {
            if (!confirm('Are you sure you want to delete this goal?')) {
                return;
            }
            
            showLoader();
            const response = await api.deleteGoal(goalId);
            
            if (response.success) {
                showAlert('Goal deleted successfully!', 'success');
                
                // Refresh data and UI
                await loadGoals();
                populateTables();
                renderGoalsChart();
            } else {
                showAlert(response.message || 'Failed to delete goal.', 'error');
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
            showAlert(error.message || 'Failed to delete goal. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    async function handleUpdateGoal() {
        const goalId = saveGoalBtn.getAttribute('data-edit-id');
        if (!goalId) {
            showAlert('Goal ID not found for update.', 'error');
            return;
        }
        
        // Input validation (same as add)
        if (!goalNameInput.value) {
            showAlert('Please enter a name for the goal.', 'error');
            return;
        }

        if (!goalAmountInput.value || isNaN(goalAmountInput.value) || parseFloat(goalAmountInput.value) <= 0) {
            showAlert('Please enter a valid target amount for the goal.', 'error');
            return;
        }

        if (!goalDateInput.value) {
            showAlert('Please select a target date for the goal.', 'error');
            return;
        }

        // Prepare goal data
        const goalData = {
            name: goalNameInput.value,
            targetAmount: parseFloat(goalAmountInput.value),
            currentAmount: parseFloat(goalCurrentInput.value) || 0,
            targetDate: goalDateInput.value,
            category: goalCategorySelect.value
        };

        try {
            showLoader();
            const response = await api.updateGoal(goalId, goalData);
            
            if (response.success) {
                showAlert('Goal updated successfully!', 'success');
                closeCurrentModal();
                
                // Reset save button back to add handler
                saveGoalBtn.removeAttribute('data-edit-id');
                saveGoalBtn.removeEventListener('click', handleUpdateGoal);
                saveGoalBtn.addEventListener('click', handleSaveGoal);
                
                // Refresh data and UI
                await loadGoals();
                populateTables();
                renderGoalsChart();
            } else {
                showAlert(response.message || 'Failed to update goal.', 'error');
            }
        } catch (error) {
            console.error('Error updating goal:', error);
            showAlert(error.message || 'Failed to update goal. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    async function handleEditAccount(accountId) {
        try {
            showLoader();
            const account = accounts.find(a => a._id === accountId);
            
            if (!account) {
                showAlert('Account not found.', 'error');
                hideLoader();
                return;
            }
            
            // Populate form fields with account data
            accountNameInput.value = account.name;
            accountTypeSelect.value = account.type;
            accountInstitutionInput.value = account.institution;
            accountBalanceInput.value = account.balance;
            accountCurrencyInput.value = account.currency;
            
            // Store account ID in a data attribute for the save handler
            saveAccountBtn.setAttribute('data-edit-id', accountId);
            
            // Open modal
            openModal('add-account-modal');
            
            // Update save button event handler
            saveAccountBtn.removeEventListener('click', handleSaveAccount);
            saveAccountBtn.addEventListener('click', handleUpdateAccount);
            
            hideLoader();
        } catch (error) {
            console.error('Error editing account:', error);
            showAlert('Failed to load account data for editing.', 'error');
            hideLoader();
        }
    }

    async function handleDeleteAccount(accountId) {
        try {
            if (!confirm('Are you sure you want to delete this account?\nThis will also delete all transactions associated with the account.')) {
                return;
            }
            
            showLoader();
            const response = await api.deleteAccount(accountId);
            
            if (response.success) {
                showAlert('Account deleted successfully!', 'success');
                
                // Refresh data and UI
                await Promise.all([
                    loadAccounts(),
                    loadTransactions()
                ]);
                
                updateFinancialStatistics();
                populateTables();
                renderBalanceChart();
            } else {
                showAlert(response.message || 'Failed to delete account.', 'error');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            showAlert(error.message || 'Failed to delete account. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }

    async function handleUpdateAccount() {
        const accountId = saveAccountBtn.getAttribute('data-edit-id');
        if (!accountId) {
            showAlert('Account ID not found for update.', 'error');
            return;
        }
        
        // Input validation (same as add)
        if (!accountNameInput.value) {
            showAlert('Please enter a name for the account.', 'error');
            return;
        }

        if (!accountTypeSelect.value) {
            showAlert('Please select an account type.', 'error');
            return;
        }

        if (!accountInstitutionInput.value) {
            showAlert('Please enter the financial institution name.', 'error');
            return;
        }

        if (!accountBalanceInput.value || isNaN(accountBalanceInput.value)) {
            showAlert('Please enter a valid balance for the account.', 'error');
            return;
        }

        // Prepare account data
        const accountData = {
            name: accountNameInput.value,
            type: accountTypeSelect.value,
            institution: accountInstitutionInput.value,
            balance: parseFloat(accountBalanceInput.value),
            currency: accountCurrencyInput.value || 'USD'
        };

        try {
            showLoader();
            const response = await api.updateAccount(accountId, accountData);
            
            if (response.success) {
                showAlert('Account updated successfully!', 'success');
                closeCurrentModal();
                
                // Reset save button back to add handler
                saveAccountBtn.removeAttribute('data-edit-id');
                saveAccountBtn.removeEventListener('click', handleUpdateAccount);
                saveAccountBtn.addEventListener('click', handleSaveAccount);
                
                // Refresh data and UI
                await loadAccounts();
                updateFinancialStatistics();
                populateTables();
                renderBalanceChart();
            } else {
                showAlert(response.message || 'Failed to update account.', 'error');
            }
        } catch (error) {
            console.error('Error updating account:', error);
            showAlert(error.message || 'Failed to update account. Please try again.', 'error');
        } finally {
            hideLoader();
        }
    }
});
