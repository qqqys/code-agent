const data = window.matrixData;
const details = window.capabilityDetails;

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
  empty: document.querySelector('#emptyState'),
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
      const detailHref = details[row.id]
        ? `./capability.html?id=${encodeURIComponent(row.id)}`
        : null;
      const title = detailHref
        ? `<a href="${detailHref}" class="capability-link">
              ${escapeHtml(row.capability)}
              <span aria-hidden="true">→</span>
            </a>`
        : `<span class="capability-title">${escapeHtml(row.capability)}</span>
           <span class="detail-pending">详情待补</span>`;
      return `
        <tr id="${row.id}" data-row-id="${row.id}">
          <th scope="row" class="capability-column">
            <span class="category-tag">${escapeHtml(category.name)}</span>
            ${title}
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

function handleHash() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (!hash) return;
  if (data.categories.some((category) => category.id === hash)) {
    setCategory(hash, false);
    return;
  }
  const row = data.rows.find((item) => item.id === hash);
  if (row) {
    state.category = row.category;
    render();
    requestAnimationFrame(() => document.querySelector(`#${CSS.escape(hash)}`)?.scrollIntoView({ block: 'center' }));
  }
}

elements.categoryTabs.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
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

elements.reset.addEventListener('click', () => {
  state.category = 'all';
  state.query = '';
  state.products = new Set(data.products.map((product) => product.id));
  elements.search.value = '';
  history.replaceState(null, '', location.pathname);
  render();
});

elements.empty.querySelector('button').addEventListener('click', () => elements.reset.click());
window.addEventListener('hashchange', handleHash);
window.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    elements.search.focus();
  }
});

render();
handleHash();
if (elements.updatedAt) {
  elements.updatedAt.textContent = `核对于 ${data.updatedAt}`;
}
