const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const startMonthInput = document.getElementById('startMonth');
const startYearInput = document.getElementById('startYear');
const endMonthInput = document.getElementById('endMonth');
const endYearInput = document.getElementById('endYear');
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

const money = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

function formatCurrency(value) {
  return `$${money.format(value)}`;
}

function parseNumber(value) {
  const clean = String(value).replace(/,/g, '').trim();
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

function applyFormattedValue(input) {
  const value = parseNumber(input.value);
  input.value = money.format(value);
}

function bindFormattedInput(input, onInput) {
  applyFormattedValue(input);
  input.addEventListener('focus', () => {
    input.value = parseNumber(input.value) || input.value === '0' ? String(parseNumber(input.value)) : '';
  });
  input.addEventListener('blur', () => applyFormattedValue(input));
  input.addEventListener('input', onInput);
}

function getYearMonth(yearEl, monthEl) {
  return `${yearEl.value}-${String(Number(monthEl.value) + 1).padStart(2, '0')}`;
}

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

function fmtMonth(yyyyMm) {
  const [y, m] = yyyyMm.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
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

    row.querySelector('.net-change').textContent = formatCurrency(net);
    row.querySelector('.ending-balance').textContent = formatCurrency(rollingBalance);
  });

  const totalNetChange = totalIncome - totalMonthlyExpenses - totalSpecialExpenses;

  totalIncomeCell.textContent = formatCurrency(totalIncome);
  totalMonthlyExpensesCell.textContent = formatCurrency(totalMonthlyExpenses);
  totalSpecialExpensesCell.textContent = formatCurrency(totalSpecialExpenses);
  totalNetChangeCell.textContent = formatCurrency(totalNetChange);
  finalBalanceCell.textContent = formatCurrency(rollingBalance);
  balanceHeading.textContent = `Current Forecasted Ending Balance: ${formatCurrency(rollingBalance)}`;
}

function buildTable() {
  const start = getYearMonth(startYearInput, startMonthInput);
  const end = getYearMonth(endYearInput, endMonthInput);

  if (start > end) {
    alert('The ending month must be the same as or after the starting month.');
    return;
  }

  const months = monthSequence(start, end);
  const defaultIncome = parseNumber(defaultIncomeInput.value);

  tableBody.innerHTML = '';
  months.forEach((m) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${fmtMonth(m)}</td>
      <td><input class="income" type="text" inputmode="decimal" value="${money.format(defaultIncome)}" /></td>
      <td><input class="monthly-expense" type="text" inputmode="decimal" value="0" /></td>
      <td><input class="special-expense" type="text" inputmode="decimal" value="0" /></td>
      <td class="net-change">$0</td>
      <td class="ending-balance">$0</td>
    `;
    tableBody.appendChild(row);
  });

  tableBody.querySelectorAll('input').forEach((input) => bindFormattedInput(input, recalculateTotals));
  recalculateTotals();
}

function setupDatePickers() {
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 12; i += 1) {
    startMonthInput.add(new Option(MONTH_NAMES[i], i));
    endMonthInput.add(new Option(MONTH_NAMES[i], i));
  }

  for (let year = currentYear - 5; year <= currentYear + 20; year += 1) {
    startYearInput.add(new Option(year, year));
    endYearInput.add(new Option(year, year));
  }

  startMonthInput.value = String(new Date().getMonth());
  startYearInput.value = String(currentYear);
  endMonthInput.value = String(new Date().getMonth());
  endYearInput.value = String(currentYear + 1);
}

setupDatePickers();
bindFormattedInput(initialBalanceInput, recalculateTotals);
bindFormattedInput(defaultIncomeInput, () => {});
generateBtn.addEventListener('click', buildTable);
