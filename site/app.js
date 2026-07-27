const data = window.matrixData;
const repoDocs = 'https://github.com/qqqys/code-agent/blob/main/docs/';

const state = {
  category: 'all',
  query: '',
  products: new Set(data.products.map((product) => product.id)),
};

const elements = {
  categoryTabs: document.querySelector('#categoryTabs'),
  productToggles: document.querySelector('#productToggles'),
  search: document.querySelector('#searchInput'),
  reset: document.querySelector('#resetButton'),
  head: document.querySelector('#matrixHead'),
  body: document.querySelector('#matrixBody'),
  resultCount: document.querySelector('#resultCount'),
  rowCount: document.querySelector('#rowCount'),
  empty: document.querySelector('#emptyState'),
  panel: document.querySelector('#detailPanel'),
  backdrop: document.querySelector('#detailBackdrop'),
  detailClose: document.querySelector('#detailClose'),
  detailCategory: document.querySelector('#detailCategory'),
  detailTitle: document.querySelector('#detailTitle'),
  detailDescription: document.querySelector('#detailDescription'),
  detailValues: document.querySelector('#detailValues'),
  detailSources: document.querySelector('#detailSources'),
  detailMarkdown: document.querySelector('#detailMarkdown'),
  updatedAt: document.querySelector('#updatedAt'),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatValue(value) {
  return escapeHtml(value).replace(/`([^`]+)`/g, '<code>$1</code>');
}

function valueState(value) {
  if (value === '—' || value.includes('未确认') || value.includes('未列出')) {
    return 'unknown';
  }
  if (
    value.includes('条件') ||
    value.includes('依配置') ||
    value.includes('依运行') ||
    value.includes('依产品') ||
    value.includes('依部署')
  ) {
    return 'conditional';
  }
  return 'confirmed';
}

function searchableText(row) {
  return [
    row.capability,
    row.description,
    ...Object.values(row.values),
    data.categories.find((category) => category.id === row.category)?.name,
  ]
    .join(' ')
    .toLocaleLowerCase('zh-CN');
}

function visibleRows() {
  const query = state.query.trim().toLocaleLowerCase('zh-CN');
  return data.rows.filter((row) => {
    const categoryMatches = state.category === 'all' || row.category === state.category;
    const queryMatches = !query || searchableText(row).includes(query);
    return categoryMatches && queryMatches;
  });
}

function renderCategories() {
  const tabs = [{ id: 'all', name: '全部' }, ...data.categories];
  elements.categoryTabs.innerHTML = tabs
    .map((category) => {
      const count =
        category.id === 'all'
          ? data.rows.length
          : data.rows.filter((row) => row.category === category.id).length;
      return `
        <button
          type="button"
          role="tab"
          data-category="${category.id}"
          aria-selected="${state.category === category.id}"
          class="${state.category === category.id ? 'is-active' : ''}"
        >
          ${escapeHtml(category.name)}
          <span>${count}</span>
        </button>
      `;
    })
    .join('');
}

function renderProductToggles() {
  elements.productToggles.innerHTML = data.products
    .map(
      (product) => `
        <label>
          <input
            type="checkbox"
            value="${product.id}"
            ${state.products.has(product.id) ? 'checked' : ''}
          />
          <span>${escapeHtml(product.name)}</span>
        </label>
      `,
    )
    .join('');
}

function renderTable() {
  const products = data.products.filter((product) => state.products.has(product.id));
  const rows = visibleRows();

  elements.head.innerHTML = `
    <tr>
      <th scope="col" class="capability-column">能力字段</th>
      ${products.map((product) => `<th scope="col">${escapeHtml(product.name)}</th>`).join('')}
    </tr>
  `;

  elements.body.innerHTML = rows
    .map((row) => {
      const category = data.categories.find((item) => item.id === row.category);
      return `
        <tr id="${row.id}" data-row-id="${row.id}">
          <th scope="row" class="capability-column">
            <span class="category-tag">${escapeHtml(category.name)}</span>
            <a href="#${row.id}" class="capability-link" data-detail="${row.id}">
              ${escapeHtml(row.capability)}
              <span aria-hidden="true">↗</span>
            </a>
          </th>
          ${products
            .map((product) => {
              const value = row.values[product.id];
              const status = valueState(value);
              return `<td class="cell cell--${status}">${formatValue(value)}</td>`;
            })
            .join('')}
        </tr>
      `;
    })
    .join('');

  elements.resultCount.textContent = `显示 ${rows.length} / ${data.rows.length} 个字段`;
  elements.empty.hidden = rows.length !== 0;
}

function render() {
  renderCategories();
  renderProductToggles();
  renderTable();
}

function setCategory(category, updateHash = true) {
  state.category = category;
  render();
  if (updateHash) {
    history.replaceState(null, '', category === 'all' ? location.pathname : `#${category}`);
  }
}

function openDetail(id, updateHash = true) {
  const row = data.rows.find((item) => item.id === id);
  if (!row) return;

  const category = data.categories.find((item) => item.id === row.category);
  elements.detailCategory.textContent = category.name;
  elements.detailTitle.textContent = row.capability;
  elements.detailDescription.textContent = row.description;
  elements.detailValues.innerHTML = data.products
    .map(
      (product) => `
        <div>
          <dt>${escapeHtml(product.name)}</dt>
          <dd class="cell--${valueState(row.values[product.id])}">
            ${formatValue(row.values[product.id])}
          </dd>
        </div>
      `,
    )
    .join('');
  elements.detailSources.innerHTML = row.sources
    .map((sourceId) => data.sources[sourceId])
    .map(
      (source) =>
        `<a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} ↗</a>`,
    )
    .join('');
  elements.detailMarkdown.href = `${repoDocs}${encodeURIComponent(category.doc).replaceAll('%2F', '/')}`;
  elements.panel.classList.add('is-open');
  elements.panel.setAttribute('aria-hidden', 'false');
  elements.backdrop.hidden = false;
  document.body.classList.add('detail-open');
  if (updateHash) history.replaceState(null, '', `#${id}`);
}

function closeDetail({ restoreCategoryHash = true } = {}) {
  elements.panel.classList.remove('is-open');
  elements.panel.setAttribute('aria-hidden', 'true');
  elements.backdrop.hidden = true;
  document.body.classList.remove('detail-open');
  if (restoreCategoryHash) {
    const hash = state.category === 'all' ? location.pathname : `#${state.category}`;
    history.replaceState(null, '', hash);
  }
}

function handleHash() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (!hash) return;
  if (data.categories.some((category) => category.id === hash)) {
    closeDetail({ restoreCategoryHash: false });
    setCategory(hash, false);
    return;
  }
  const row = data.rows.find((item) => item.id === hash);
  if (row) {
    state.category = row.category;
    render();
    openDetail(hash, false);
    requestAnimationFrame(() => document.querySelector(`#${CSS.escape(hash)}`)?.scrollIntoView({ block: 'center' }));
  }
}

elements.categoryTabs.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  closeDetail({ restoreCategoryHash: false });
  setCategory(button.dataset.category);
});

elements.productToggles.addEventListener('change', (event) => {
  const input = event.target.closest('input[type="checkbox"]');
  if (!input) return;
  if (input.checked) state.products.add(input.value);
  else if (state.products.size > 1) state.products.delete(input.value);
  else input.checked = true;
  render();
});

elements.search.addEventListener('input', () => {
  state.query = elements.search.value;
  renderTable();
});

elements.body.addEventListener('click', (event) => {
  const link = event.target.closest('[data-detail]');
  if (!link) return;
  event.preventDefault();
  openDetail(link.dataset.detail);
});

elements.reset.addEventListener('click', () => {
  state.category = 'all';
  state.query = '';
  state.products = new Set(data.products.map((product) => product.id));
  elements.search.value = '';
  closeDetail({ restoreCategoryHash: false });
  history.replaceState(null, '', location.pathname);
  render();
});

elements.empty.querySelector('button').addEventListener('click', () => elements.reset.click());
elements.detailClose.addEventListener('click', () => closeDetail());
elements.backdrop.addEventListener('click', () => closeDetail());
window.addEventListener('hashchange', handleHash);
window.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    elements.search.focus();
  }
  if (event.key === 'Escape' && elements.panel.classList.contains('is-open')) {
    closeDetail();
  }
});

elements.updatedAt.textContent = `核对于 ${data.updatedAt}`;
elements.rowCount.textContent = data.rows.length;
render();
handleHash();
