const csvFiles = {
  salidas: 'salidas.csv',
  entresemana: 'entresemana.csv',
  findesemana: 'findesemana.csv'
};

const expectedHeaders = {
  salidas: ['Fecha', 'Hora', 'Territorio', 'Lugar', 'Conductor', 'Observaciones'],
  entresemana: ['Fecha', 'Seccion', 'Titulo', 'Asignado', 'Ayudante', 'Observaciones'],
  findesemana: ['Fecha', 'Horario', 'Conferencia', 'Conferenciante', 'Congregacion', 'Atalaya', 'Lector', 'Observaciones']
};

document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.dataset.section).classList.add('active');
  });
});

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell.trim());
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell.trim());
    if (row.some(value => value !== '')) rows.push(row);
  }

  return rows;
}

function rowsToObjects(rows) {
  const headers = rows[0] || [];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => obj[header] = row[index] || '');
    return obj;
  });
}

function createTable(items, headers) {
  if (!items.length) return '<p>No hay datos cargados.</p>';
  const head = headers.map(h => `<th>${h}</th>`).join('');
  const body = items.map(item => `<tr>${headers.map(h => `<td>${item[h] || ''}</td>`).join('')}</tr>`).join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'Sin fecha';
    if (!acc[value]) acc[value] = [];
    acc[value].push(item);
    return acc;
  }, {});
}

function renderSalidas(items) {
  return createTable(items, expectedHeaders.salidas);
}

function renderEntreSemana(items) {
  const groupedByDate = groupBy(items, 'Fecha');
  return Object.entries(groupedByDate).map(([date, dateItems]) => {
    const groupedBySection = groupBy(dateItems, 'Seccion');
    const sections = Object.entries(groupedBySection).map(([section, sectionItems]) => {
      return `<h4 class="section-title">${section}</h4>` + createTable(sectionItems, ['Titulo', 'Asignado', 'Ayudante', 'Observaciones']);
    }).join('');
    return `<h3 class="date-group">${date}</h3>${sections}`;
  }).join('');
}

function renderFinSemana(items) {
  return createTable(items, expectedHeaders.findesemana);
}

async function loadCSV(type, renderer) {
  const target = document.getElementById(`${type}-content`);
  try {
    const response = await fetch(csvFiles[type], { cache: 'no-store' });
    if (!response.ok) throw new Error(`No se pudo leer ${csvFiles[type]}`);
    const text = await response.text();
    const rows = parseCSV(text);
    const items = rowsToObjects(rows);
    target.innerHTML = renderer(items);
  } catch (error) {
    target.innerHTML = `<div class="error">${error.message}. Revisá que el archivo exista en GitHub y tenga el nombre correcto.</div>`;
  }
}

async function loadConfig() {
  try {
    const response = await fetch('config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('No config');
    const config = await response.json();
    const link = document.getElementById('online-map');
    link.href = config.mapaOnline || '#';
  } catch {
    document.getElementById('online-map').href = '#';
  }
}

function printSection(sectionId) {
  document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('printing'));
  document.getElementById(sectionId).classList.add('printing');
  window.print();
  setTimeout(() => document.getElementById(sectionId).classList.remove('printing'), 500);
}

loadCSV('salidas', renderSalidas);
loadCSV('entresemana', renderEntreSemana);
loadCSV('findesemana', renderFinSemana);
loadConfig();
