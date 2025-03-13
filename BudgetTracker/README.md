# Budget Tracker

A comprehensive budget tracking application built with Node.js, Express, and MongoDB. This application allows users to manage their finances by tracking income, expenses, budgets, and financial goals.

## Features

- **User Authentication:** Register, login, password reset, and profile management
- **Transaction Management:** Add, view, update, and delete financial transactions
- **Budget Planning:** Create and manage category-based budgets
- **Goal Setting:** Set and track financial savings goals
- **Bank Statement Import:** Import transactions from bank statements
- **Bank Account Linking:** Connect to bank accounts (placeholder for bank API integration)
- **Financial Analytics:** View spending patterns, income vs. expenses, and savings rates
- **Monthly Reports:** Track financial progress on a monthly basis

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Frontend:** HTML, CSS, JavaScript (Client files in public directory)
- **API Documentation:** API endpoints documented with comments

## Setup Instructions

### Prerequisites

- Node.js (v12 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/budget-tracker.git
   cd budget-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   ```

4. Run the application:
   ```
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

5. The server will start on the port specified in your environment variables (default: 5000)

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update user profile
- `POST /api/v1/auth/forgotpassword` - Request password reset
- `PUT /api/v1/auth/resetpassword/:resettoken` - Reset password
- `PUT /api/v1/auth/updatepassword` - Update password (logged in)

### Finance Management
- `GET /api/v1/finance/transactions` - Get user transactions
- `POST /api/v1/finance/transactions` - Add transaction
- `PUT /api/v1/finance/transactions/:id` - Update transaction
- `DELETE /api/v1/finance/transactions/:id` - Delete transaction
- `GET /api/v1/finance/budgets` - Get user budgets
- `POST /api/v1/finance/budgets` - Add budget
- `PUT /api/v1/finance/budgets/:id` - Update budget
- `DELETE /api/v1/finance/budgets/:id` - Delete budget
- `GET /api/v1/finance/goals` - Get user goals
- `POST /api/v1/finance/goals` - Add goal
- `PUT /api/v1/finance/goals/:id` - Update goal
- `DELETE /api/v1/finance/goals/:id` - Delete goal
- `GET /api/v1/finance/monthly` - Get monthly data
- `POST /api/v1/finance/monthly` - Add/update monthly data
- `GET /api/v1/finance/stats` - Get financial statistics

### Bank Integration
- `GET /api/v1/finance/bank/accounts` - Get bank accounts
- `POST /api/v1/finance/bank/accounts` - Add manual account
- `PUT /api/v1/finance/bank/accounts/:id` - Update account
- `DELETE /api/v1/finance/bank/accounts/:id` - Delete account
- `POST /api/v1/finance/bank/import` - Import bank data
- `POST /api/v1/finance/bank/connect` - Connect to bank (placeholder)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Express.js documentation
- Mongoose documentation
- MongoDB documentation 