// State variables
let token = localStorage.getItem('token') || '';
let username = localStorage.getItem('username') || '';

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const navAuthSection = document.getElementById('nav-auth-section');
const userDisplayName = document.getElementById('user-display-name');
const btnLogout = document.getElementById('btn-logout');
const alertContainer = document.getElementById('alert-container');

// Auth DOM
const loginBox = document.getElementById('login-box');
const signupBox = document.getElementById('signup-box');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const linkShowSignup = document.getElementById('link-show-signup');
const linkShowLogin = document.getElementById('link-show-login');

// Metrics DOM
const valBalance = document.getElementById('val-balance');
const valTotalIncome = document.getElementById('val-total-income');
const valTotalExpense = document.getElementById('val-total-expense');

// Income DOM
const btnToggleIncomeForm = document.getElementById('btn-toggle-income-form');
const incomeForm = document.getElementById('income-form');
const btnCancelIncome = document.getElementById('btn-cancel-income');
const incomeList = document.getElementById('income-list');

// Expense DOM
const btnToggleExpenseForm = document.getElementById('btn-toggle-expense-form');
const expenseForm = document.getElementById('expense-form');
const btnCancelExpense = document.getElementById('btn-cancel-expense');
const expenseList = document.getElementById('expense-list');

// Helper: Show/Hide Elements
function show(element) {
  element.classList.remove('hidden');
}

function hide(element) {
  element.classList.add('hidden');
}

// Helper: Show notification alerts
let alertTimeout;
function showAlert(message, type = 'success') {
  clearTimeout(alertTimeout);
  alertContainer.textContent = message;
  alertContainer.className = `alert alert-${type}`;
  show(alertContainer);
  alertTimeout = setTimeout(() => {
    hide(alertContainer);
  }, 5000);
}

// Render Page based on auth state
function init() {
  // Set default dates to today's date in forms
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('income-date').value = today;
  document.getElementById('expense-date').value = today;

  if (token) {
    userDisplayName.textContent = username;
    show(navAuthSection);
    hide(authSection);
    show(dashboardSection);
    fetchDashboardData();
  } else {
    hide(navAuthSection);
    show(authSection);
    hide(dashboardSection);
  }
}

// Navigation / Auth toggle
linkShowSignup.addEventListener('click', (e) => {
  e.preventDefault();
  hide(loginBox);
  show(signupBox);
});

linkShowLogin.addEventListener('click', (e) => {
  e.preventDefault();
  hide(signupBox);
  show(loginBox);
});

// Event: Signup submit
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById('signup-username').value.trim();
  const passwordInput = document.getElementById('signup-password').value;

  try {
    const response = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Signup failed');
    }

    showAlert('Registration successful! Please log in.', 'success');
    signupForm.reset();
    hide(signupBox);
    show(loginBox);
  } catch (err) {
    showAlert(err.message, 'danger');
  }
});

// Event: Login submit
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById('login-username').value.trim();
  const passwordInput = document.getElementById('login-password').value;

  try {
    // Swagger Auth uses form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', usernameInput);
    formData.append('password', passwordInput);

    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Invalid username or password');
    }

    token = data.access_token;
    username = usernameInput;
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);

    showAlert('Welcome back!', 'success');
    loginForm.reset();
    init();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
});

// Event: Logout
btnLogout.addEventListener('click', () => {
  token = '';
  username = '';
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  showAlert('Logged out successfully.', 'success');
  init();
});

// Fetch all dashboard data
async function fetchDashboardData() {
  if (!token) return;
  
  await Promise.all([
    fetchBalance(),
    fetchTotalIncome(),
    fetchTotalExpense(),
    fetchIncomesList(),
    fetchExpensesList()
  ]);
}

// Fetch helper: Authenticated headers
function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Fetch Metrics
async function fetchBalance() {
  try {
    const response = await fetch('/balance/', { headers: getAuthHeaders() });
    if (response.status === 401) return handleSessionExpired();
    const data = await response.json();
    valBalance.textContent = `$${Number(data.balance).toFixed(2)}`;
  } catch (err) {
    console.error('Error fetching balance:', err);
  }
}

async function fetchTotalIncome() {
  try {
    const response = await fetch('/income/total-income', { headers: getAuthHeaders() });
    if (response.status === 401) return handleSessionExpired();
    const data = await response.json();
    valTotalIncome.textContent = `$${Number(data.total_income).toFixed(2)}`;
  } catch (err) {
    console.error('Error fetching total income:', err);
  }
}

async function fetchTotalExpense() {
  try {
    const response = await fetch('/expense/total-expense', { headers: getAuthHeaders() });
    if (response.status === 401) return handleSessionExpired();
    const data = await response.json();
    valTotalExpense.textContent = `$${Number(data.total_expense).toFixed(2)}`;
  } catch (err) {
    console.error('Error fetching total expense:', err);
  }
}

// Fetch Lists
async function fetchIncomesList() {
  try {
    const response = await fetch('/income/', { headers: getAuthHeaders() });
    if (response.status === 401) return handleSessionExpired();
    const incomes = await response.json();
    renderIncomes(incomes);
  } catch (err) {
    console.error('Error fetching incomes:', err);
  }
}

async function fetchExpensesList() {
  try {
    const response = await fetch('/expense/', { headers: getAuthHeaders() });
    if (response.status === 401) return handleSessionExpired();
    const expenses = await response.json();
    renderExpenses(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
  }
}

// Session expiration helper
function handleSessionExpired() {
  token = '';
  username = '';
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  showAlert('Your session has expired. Please log in again.', 'danger');
  init();
}

// Render Lists
function renderIncomes(incomes) {
  incomeList.innerHTML = '';
  if (!incomes || incomes.length === 0) {
    incomeList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📥</div>
        <div class="empty-state-text">No incomes logged yet. Add one above!</div>
      </div>
    `;
    return;
  }

  // Sort by date descending
  incomes.sort((a, b) => new Date(b.date) - new Date(a.date));

  incomes.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'list-item';
    
    // Category/source tag is neutral background and text-primary
    const dateFormatted = new Date(item.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    let tagsHtml = `<span class="list-item-tag">Income</span>`;
    if (item.is_recurring) {
      tagsHtml += `<span class="list-item-tag">Recurring</span>`;
    }

    itemEl.innerHTML = `
      <div class="list-item-left">
        <div class="list-item-title">${escapeHtml(item.source)}</div>
        <div class="list-item-meta">
          <span>${dateFormatted}</span>
          ${tagsHtml}
        </div>
      </div>
      <div class="list-item-right">
        <div class="list-item-amount income">+ $${Number(item.amount).toFixed(2)}</div>
        <button class="btn btn-danger" onclick="deleteIncome(${item.id})">Delete</button>
      </div>
    `;
    incomeList.appendChild(itemEl);
  });
}

function renderExpenses(expenses) {
  expenseList.innerHTML = '';
  if (!expenses || expenses.length === 0) {
    expenseList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💸</div>
        <div class="empty-state-text">No expenses logged yet. Add one above!</div>
      </div>
    `;
    return;
  }

  // Sort by date descending
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

  expenses.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'list-item';
    
    const dateFormatted = new Date(item.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    let tagsHtml = `<span class="list-item-tag">${escapeHtml(item.category)}</span>`;
    if (item.is_recurring) {
      tagsHtml += `<span class="list-item-tag">Recurring</span>`;
    }

    itemEl.innerHTML = `
      <div class="list-item-left">
        <div class="list-item-title">${escapeHtml(item.category)}</div>
        <div class="list-item-meta">
          <span>${dateFormatted}</span>
          ${tagsHtml}
        </div>
      </div>
      <div class="list-item-right">
        <div class="list-item-amount expense">- $${Number(item.amount).toFixed(2)}</div>
        <button class="btn btn-danger" onclick="deleteExpense(${item.id})">Delete</button>
      </div>
    `;
    expenseList.appendChild(itemEl);
  });
}

// Helper: Escape HTML to avoid XSS
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Global functions for Deleting items (so onclick can access them)
window.deleteIncome = async function(id) {
  if (!confirm('Are you sure you want to delete this income entry?')) return;
  try {
    const response = await fetch(`/income/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to delete income');
    
    showAlert('Income entry deleted.', 'success');
    fetchDashboardData();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
};

window.deleteExpense = async function(id) {
  if (!confirm('Are you sure you want to delete this expense entry?')) return;
  try {
    const response = await fetch(`/expense/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to delete expense');
    
    showAlert('Expense entry deleted.', 'success');
    fetchDashboardData();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
};

// Forms collapsing/expanding
btnToggleIncomeForm.addEventListener('click', () => {
  if (incomeForm.classList.contains('hidden')) {
    show(incomeForm);
    btnToggleIncomeForm.textContent = '−';
  } else {
    hide(incomeForm);
    btnToggleIncomeForm.textContent = '+';
  }
});

btnCancelIncome.addEventListener('click', () => {
  hide(incomeForm);
  incomeForm.reset();
  btnToggleIncomeForm.textContent = '+';
});

btnToggleExpenseForm.addEventListener('click', () => {
  if (expenseForm.classList.contains('hidden')) {
    show(expenseForm);
    btnToggleExpenseForm.textContent = '−';
  } else {
    hide(expenseForm);
    btnToggleExpenseForm.textContent = '+';
  }
});

btnCancelExpense.addEventListener('click', () => {
  hide(expenseForm);
  expenseForm.reset();
  btnToggleExpenseForm.textContent = '+';
});

// Event: Submit Income Form
incomeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sourceVal = document.getElementById('income-source').value.trim();
  const amountVal = parseFloat(document.getElementById('income-amount').value);
  const dateVal = document.getElementById('income-date').value;
  const isRecurringVal = document.getElementById('income-recurring').checked;

  try {
    const response = await fetch('/income/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount: amountVal,
        date: dateVal,
        source: sourceVal,
        is_recurring: isRecurringVal
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to save income');

    showAlert('Income added successfully!', 'success');
    incomeForm.reset();
    hide(incomeForm);
    btnToggleIncomeForm.textContent = '+';
    fetchDashboardData();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
});

// Event: Submit Expense Form
expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const categoryVal = document.getElementById('expense-category').value.trim();
  const amountVal = parseFloat(document.getElementById('expense-amount').value);
  const dateVal = document.getElementById('expense-date').value;
  const isRecurringVal = document.getElementById('expense-recurring').checked;

  try {
    const response = await fetch('/expense/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount: amountVal,
        date: dateVal,
        category: categoryVal,
        is_recurring: isRecurringVal
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to save expense');

    showAlert('Expense added successfully!', 'success');
    expenseForm.reset();
    hide(expenseForm);
    btnToggleExpenseForm.textContent = '+';
    fetchDashboardData();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
});

// Initial startup
window.addEventListener('DOMContentLoaded', init);
