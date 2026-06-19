const csvFiles = {
  salidas: 'salidas.csv',
  finde: 'findesemana.csv',
  semanas: 'entresemana-semanas.csv',
  partes: 'entresemana-partes.csv',
  estudio: 'entresemana-estudio.csv'
};

const expectedHeaders = {
  salidas: ['Fecha', 'Hora', 'Territorio', 'Lugar', 'Conductor', 'Observaciones'],
  findesemana: ['Fecha', 'Presidente', 'OradorVisitante', 'NumeroConferencia', 'TituloConferencia', 'Atalaya', 'LectorAtalaya', 'OradorSaliente', 'NumeroSaliente', 'Limpieza', 'CongregacionAsignada', 'Observaciones']
};

const sectionLabels = {
  'tesoros': 'TESOROS DE LA BIBLIA',
  'tesoros de la biblia': 'TESOROS DE LA BIBLIA',
  'seamos': 'SEAMOS MEJORES MAESTROS',
  'seamos mejores maestros': 'SEAMOS MEJORES MAESTROS',
  'vida': 'NUESTRA VIDA CRISTIANA',
  'nuestra vida cristiana': 'NUESTRA VIDA CRISTIANA',
  'mi vida cristiana': 'NUESTRA VIDA CRISTIANA'
};
const sectionOrder = ['TESOROS DE LA BIBLIA', 'SEAMOS MEJORES MAESTROS', 'NUESTRA VIDA CRISTIANA'];
const localData = {};

document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.dataset.section).classList.add('active');
  });
});

document.querySelectorAll('[data-local-csv]').forEach(input => {
  input.addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    const key = event.target.dataset.localCsv;
    const text = await file.text();
    localData[key] = rowsToObjects(parseCSV(text));
    if (key.startsWith('entresemana')) renderEntreSemanaFromCurrentSources();
    if (key === 'salidas') document.getElementById('salidas-content').innerHTML = renderSalidas(localData.salidas);
    if (key === 'findesemana') document.getElementById('findesemana-content').innerHTML = renderFinSemana(localData.findesemana);
  });
});

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function parseCSV(text) {
  const rows = []; let row = []; let cell = ''; let insideQuotes = false;
  const clean = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i]; const next = clean[i + 1];
    if (char === '"' && insideQuotes && next === '"') { cell += '"'; i++; }
    else if (char === '"') insideQuotes = !insideQuotes;
    else if (char === ',' && !insideQuotes) { row.push(cell.trim()); cell = ''; }
    else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell.trim()); if (row.some(value => value !== '')) rows.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell.trim()); if (row.some(value => value !== '')) rows.push(row); }
  return rows;
}

function rowsToObjects(rows) {
  const headers = rows[0] || [];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => obj[header.trim()] = row[index] || '');
    return obj;
  });
}

function createTable(items, headers) {
  if (!items.length) return '<p>No hay datos cargados.</p>';
  const head = headers.map(h => `<th>${escapeHTML(h)}</th>`).join('');
  const body = items.map(item => `<tr>${headers.map(h => `<td>${escapeHTML(item[h] || '')}</td>`).join('')}</tr>`).join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function normalizeSection(section) {
  const clean = String(section || '').trim().toLowerCase();
  return sectionLabels[clean] || String(section || 'OTROS').toUpperCase();
}

function sectionClass(section) {
  if (section === 'TESOROS DE LA BIBLIA') return 'treasures';
  if (section === 'SEAMOS MEJORES MAESTROS') return 'teachers';
  if (section === 'NUESTRA VIDA CRISTIANA') return 'christian';
  return 'treasures';
}

function isSpecialWeek(week) {
  return String(week.Tipo || week.TipoSemana || '').toLowerCase().includes('especial') ||
    (!week.LecturaSemanal && !week.CancionInicial && !week.Presidente && week.Notas);
}

function renderSalidas(items) { return createTable(items, expectedHeaders.salidas); }

function renderEntreSemana({ semanas, partes, estudio }) {
  if (!semanas.length) return '<p>No hay semanas cargadas.</p>';
  const partsByWeek = groupBy(partes, 'Semana');
  const studiesByWeek = groupBy(estudio, 'Semana');

  return semanas.map(week => {
    const semana = week.Semana || 'Semana sin nombre';
    const notes = week.Notas || '';

    if (isSpecialWeek(week)) {
      return `<article class="program-card special-week">
        ${renderTopLine()}
        <h2 class="week-title">${escapeHTML(formatWeekTitle(semana))}</h2>
        ${notes ? `<p class="special-note">${escapeHTML(notes)}</p>` : ''}
      </article>`;
    }

    const weekParts = (partsByWeek[semana] || []).slice().sort((a, b) => Number(a.Orden || 0) - Number(b.Orden || 0));
    const weekStudies = studiesByWeek[semana] || [];
    const groupedSections = {};
    weekParts.forEach(part => {
      const section = normalizeSection(part.Seccion);
      if (!groupedSections[section]) groupedSections[section] = [];
   groupedSections[section].push(part);
});

const orderedSections = [
  ...sectionOrder.filter(section => groupedSections[section]),
  ...Object.keys(groupedSections).filter(section => !sectionOrder.includes(section))
];

const sectionsHtml = orderedSections.map(section => {
  const rows = groupedSections[section].map(item => renderProgramItem(item)).join('');

  const songInside = section === 'NUESTRA VIDA CRISTIANA' && week.CancionVidaCristiana
    ? `<p class="section-song"><strong>Canción ${escapeHTML(week.CancionVidaCristiana)}</strong></p>`
    : '';

  const studiesInside = section === 'NUESTRA VIDA CRISTIANA'
    ? renderStudies(weekStudies)
    : '';

  return `<section class="program-section">
    <div class="section-bar ${sectionClass(section)}">${escapeHTML(section)}</div>
    ${songInside}
    <ol class="program-list">${rows}</ol>
    ${studiesInside}
  </section>`;
}).join('');

return `<article class="program-card">
  ${renderTopLine()}
  <h2 class="week-title">${escapeHTML(formatWeekTitle(semana))}</h2>
  ${notes ? `<p class="week-note">${escapeHTML(notes)}</p>` : ''}
  <div class="program-meta">

        ${week.LecturaSemanal ? `<p><strong>Lectura semanal de la Biblia:</strong> ${escapeHTML(week.LecturaSemanal)}</p>` : ''}
        ${week.CancionInicial ? `<p><strong>Canción ${escapeHTML(week.CancionInicial)}</strong></p>` : ''}
        ${week.Presidente ? `<p><strong>Presidente y oración:</strong> ${escapeHTML(week.Presidente)}</p>` : ''}
      </div>
      ${week.Introduccion ? `<p class="intro-line">${escapeHTML(week.Introduccion)}</p>` : ''}
      ${sectionsHtml}
      <div class="program-footer">
        ${week.Conclusion ? `<p>${escapeHTML(week.Conclusion)}</p>` : ''}
        ${week.CancionFinal ? `<p><strong>Canción ${escapeHTML(week.CancionFinal)}</strong></p>` : ''}
        ${week.OracionFinal ? `<p>Oración: ${escapeHTML(week.OracionFinal)}</p>` : ''}
      </div>
    </article>`;
  }).join('');
}

function renderTopLine() {
  return `<div class="program-topline"><span>Lamadrid</span><span class="top-line"></span><span class="top-right">Programa para la reunión de entre semana</span></div>`;
}

function renderStudies(weekStudies) {
  return weekStudies.map(st => `<div class="book-study">
    <span class="program-number">${escapeHTML(st.Orden || '')}</span>
    <p><span class="program-title">Estudio bíblico de la congregación</span>${st.Lecciones ? ` (${escapeHTML(st.Lecciones)})` : ''}
    ${st.Conductor ? ` <span class="program-dash">—</span> <span class="program-assigned">${escapeHTML(st.Conductor)}</span>` : ''}${st.Lector ? ` <span class="helper">c/ ${escapeHTML(st.Lector)}</span>` : ''}${st.Observaciones ? ` <span class="program-observation">${escapeHTML(st.Observaciones)}</span>` : ''}</p>
  </div>`).join('');
}

function renderProgramItem(item) {
  const helper = item.Ayudante ? ` <span class="helper">c/ ${escapeHTML(item.Ayudante)}</span>` : '';
  const obs = item.Observaciones ? ` <span class="program-observation">${escapeHTML(item.Observaciones)}</span>` : '';
  return `<li>
    <span class="program-number">${item.Orden ? `${escapeHTML(item.Orden)}.` : ''}</span>
    <span><span class="program-title">${escapeHTML(item.Titulo || '')}</span>${item.Asignado ? ` <span class="program-dash">—</span> <span class="program-assigned">${escapeHTML(item.Asignado)}</span>${helper}` : ''}${obs}</span>
  </li>`;
}

function formatWeekTitle(semana) {
  const clean = String(semana || '').trim();
  return clean.toUpperCase().startsWith('SEMANA') ? clean.toUpperCase() : `SEMANA ${clean.toUpperCase()}`;
}

function renderFinSemana(items) {
  if (!items.length) return '<p>No hay datos cargados.</p>';
  const congregacion = items.find(item => item.CongregacionAsignada)?.CongregacionAsignada || '';
  const cards = items.map((item, index) => {
    const colorClass = ['weekend-green', 'weekend-pink', 'weekend-purple'][index % 3];
    return `<article class="weekend-card ${colorClass}">
      <div class="weekend-date">
        <strong>${escapeHTML(item.Fecha || '')}</strong>
        ${item.Limpieza ? `<span>Limpieza ${escapeHTML(item.Limpieza)}</span>` : ''}
      </div>
      <div class="weekend-assignments">
        ${renderWeekendLine('Presidente y oración', item.Presidente)}
        ${renderWeekendLine('Orador visitante', item.OradorVisitante, item.NumeroConferencia)}
        ${item.TituloConferencia ? `<p class="weekend-conference"><strong>Conferencia: &quot;${escapeHTML(item.TituloConferencia)}&quot;</strong></p>` : ''}
        ${renderWeekendLine('Atalaya', item.Atalaya)}
        ${renderWeekendLine('Lector Atalaya', item.LectorAtalaya)}
        ${renderWeekendLine('Orador saliente', item.OradorSaliente, item.NumeroSaliente)}
        ${item.Observaciones ? `<p class="weekend-note">${escapeHTML(item.Observaciones)}</p>` : ''}
      </div>
    </article>`;
  }).join('');

  return `<section class="weekend-program">
    <div class="weekend-cover">
      <div class="cover-icon">▰</div>
      <h3>PROGRAMA DE ASIGNACIONES</h3>
      <p>Conferencia Pública y Estudio de La Atalaya</p>
      <p>Congregación LaMadrid</p>
    </div>
    <div class="weekend-table-head">
      <span>Fecha</span><span>Asignación</span><span>Nombre</span>
    </div>
    ${cards}
    ${congregacion ? `<div class="assigned-congregation">Congregación asignada <strong>${escapeHTML(congregacion)}</strong></div>` : ''}
  </section>`;
}

function renderWeekendLine(label, name, number) {
  if (!name && !number) return '';
  return `<p class="weekend-line"><span>${escapeHTML(label)}</span><span>${escapeHTML(name || '')}</span>${number ? `<span class="weekend-number">${escapeHTML(number)}</span>` : '<span></span>'}</p>`;
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'Sin grupo';
    if (!acc[value]) acc[value] = [];
    acc[value].push(item);
    return acc;
  }, {});
}

async function fetchCsvObjects(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`No se pudo leer ${path}`);
  return rowsToObjects(parseCSV(await response.text()));
}

async function loadCSV(type) {
  try {
    if (type === 'salidas') {
      const data = await fetchCsvObjects(csvFiles.salidas);
      localData.salidasGithub = data;
      document.getElementById('salidas-content').innerHTML = renderSalidas(data);
    }
    if (type === 'findesemana') {
      const data = await fetchCsvObjects(csvFiles.finde);
      localData.findesemanaGithub = data;
      document.getElementById('findesemana-content').innerHTML = renderFinSemana(data);
    }
    if (type === 'entresemana') {
      localData['entresemana-semanas-github'] = await fetchCsvObjects(csvFiles.semanas);
      localData['entresemana-partes-github'] = await fetchCsvObjects(csvFiles.partes);
      localData['entresemana-estudio-github'] = await fetchCsvObjects(csvFiles.estudio);
      renderEntreSemanaFromCurrentSources();
    }
  } catch (error) {
    document.getElementById(`${type}-content`).innerHTML = `<div class="error">${escapeHTML(error.message)}. Revisá que el archivo exista y tenga el nombre correcto.</div>`;
  }
}

function renderEntreSemanaFromCurrentSources() {
  const data = {
    semanas: localData['entresemana-semanas'] || localData['entresemana-semanas-github'] || [],
    partes: localData['entresemana-partes'] || localData['entresemana-partes-github'] || [],
    estudio: localData['entresemana-estudio'] || localData['entresemana-estudio-github'] || []
  };
  document.getElementById('entresemana-content').innerHTML = renderEntreSemana(data);
}

async function reloadFromGithub(type) {
  if (type === 'salidas') delete localData.salidas;
  if (type === 'findesemana') delete localData.findesemana;
  if (type === 'entresemana') {
    delete localData['entresemana-semanas'];
    delete localData['entresemana-partes'];
    delete localData['entresemana-estudio'];
  }
  document.querySelectorAll(`[data-local-csv^="${type}"]`).forEach(input => input.value = '');
  await loadCSV(type);
}

async function loadConfig() {
  try {
    const response = await fetch('config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('No config');
    const config = await response.json();
    document.getElementById('online-map').href = config.mapaOnline || '#';
  } catch { document.getElementById('online-map').href = '#'; }
}

function printSection(sectionId) {
  document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('printing'));
  document.getElementById(sectionId).classList.add('printing');
  window.print();
  setTimeout(() => document.getElementById(sectionId).classList.remove('printing'), 500);
}

loadCSV('salidas');
loadCSV('entresemana');
loadCSV('findesemana');
loadConfig();
