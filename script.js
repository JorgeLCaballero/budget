const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const initialBalanceInput = document.getElementById('initialBalance');
const defaultIncomeInput = document.getElementById('defaultIncome');
const generateBtn = document.getElementById('generateBtn');
const tableBody = document.querySelector('#forecastTable tbody');
const balanceHeading = document.getElementById('balanceHeading');

const totalIncomeCell = document.getElementById('totalIncome');
const totalMonthlyExpensesCell = document.getElementById('totalMonthlyExpenses');
const totalSpecialExpensesCell = document.getElementById('totalSpecialExpenses');
const totalNetChangeCell = document.getElementById('totalNetChange');
const finalBalanceCell = document.getElementById('finalBalance');

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

function monthSequence(startMonth, endMonth) {
  const out = [];
  const [sy, sm] = startMonth.split('-').map(Number);
  const [ey, em] = endMonth.split('-').map(Number);

  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

function parseNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fmtMonth(yyyyMm) {
  const [y, m] = yyyyMm.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function recalculateTotals() {
  let rollingBalance = parseNumber(initialBalanceInput.value);
  let totalIncome = 0;
  let totalMonthlyExpenses = 0;
  let totalSpecialExpenses = 0;

  [...tableBody.querySelectorAll('tr')].forEach((row) => {
    const income = parseNumber(row.querySelector('.income').value);
    const monthly = parseNumber(row.querySelector('.monthly-expense').value);
    const special = parseNumber(row.querySelector('.special-expense').value);

    totalIncome += income;
    totalMonthlyExpenses += monthly;
    totalSpecialExpenses += special;

    const net = income - monthly - special;
    rollingBalance += net;

    row.querySelector('.net-change').textContent = money.format(net);
    row.querySelector('.ending-balance').textContent = money.format(rollingBalance);
  });

  const totalNetChange = totalIncome - totalMonthlyExpenses - totalSpecialExpenses;

  totalIncomeCell.textContent = money.format(totalIncome);
  totalMonthlyExpensesCell.textContent = money.format(totalMonthlyExpenses);
  totalSpecialExpensesCell.textContent = money.format(totalSpecialExpenses);
  totalNetChangeCell.textContent = money.format(totalNetChange);
  finalBalanceCell.textContent = money.format(rollingBalance);
  balanceHeading.textContent = `Current Forecasted Ending Balance: ${money.format(rollingBalance)}`;
}

function buildTable() {
  const start = startDateInput.value;
  const end = endDateInput.value;

  if (!start || !end) {
    alert('Please select both starting and end dates.');
    return;
  }

  if (start > end) {
    alert('End date must be the same as or after the starting date.');
    return;
  }

  const months = monthSequence(start, end);
  const defaultIncome = parseNumber(defaultIncomeInput.value);

  tableBody.innerHTML = '';
  months.forEach((m) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${fmtMonth(m)}</td>
      <td><input class="income" type="number" step="0.01" value="${defaultIncome}" /></td>
      <td><input class="monthly-expense" type="number" step="0.01" value="0" /></td>
      <td><input class="special-expense" type="number" step="0.01" value="0" /></td>
      <td class="net-change">$0.00</td>
      <td class="ending-balance">$0.00</td>
    `;
    tableBody.appendChild(row);
  });

  tableBody.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', recalculateTotals);
  });

  recalculateTotals();
}

generateBtn.addEventListener('click', buildTable);
initialBalanceInput.addEventListener('input', recalculateTotals);
