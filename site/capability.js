const matrix = window.matrixData;
const details = window.capabilityDetails;
const capabilityId = new URLSearchParams(window.location.search).get('id');
const row = matrix.rows.find((item) => item.id === capabilityId);
const detail = details[capabilityId];
const main = document.querySelector('#capabilityMain');
const missing = document.querySelector('#capabilityMissing');
const repoDetailBase =
  'https://github.com/qqqys/code-agent/blob/main/docs/capabilities/';

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

function statusClass(status) {
  if (status === '未确认') return 'unknown';
  if (status === '条件项') return 'conditional';
  return 'confirmed';
}

function rowValueState(value) {
  if (value === '—' || value.includes('未确认') || value.includes('未列出')) {
    return 'unknown';
  }
  if (value.includes('条件') || value.includes('依配置') || value.includes('依部署')) {
    return 'conditional';
  }
  return 'confirmed';
}

function renderList(target, items) {
  target.innerHTML = items.map((item) => `<li>${formatValue(item)}</li>`).join('');
}

function commandFields(record) {
  const commands = record.commands.length
    ? record.commands
        .map((command) => `<code>${escapeHtml(command)}</code>`)
        .join(' ')
    : '<span class="empty-value">无对应命令</span>';
  const aliases = record.aliases.length
    ? record.aliases
        .map((alias) => `<code>${escapeHtml(alias)}</code>`)
        .join(' ')
    : '无公开别名';

  return [
    ['主命令', commands],
    ['别名', aliases],
    ['参数', formatValue(record.parameters)],
    ['执行行为', formatValue(record.behavior)],
    ['可用模式', formatValue(record.mode)],
    ['保存范围', formatValue(record.persistence)],
    ['条件与边界', formatValue(record.conditions)],
  ];
}

function subagentFields(record) {
  return [
    ['矩阵结论', formatValue(record.value)],
    ['入口与配置', formatValue(record.entry)],
    ['定义格式', formatValue(record.format)],
    ['具体行为', formatValue(record.behavior)],
    ['作用域', formatValue(record.scope)],
    ['上下文与继承', formatValue(record.inheritance)],
    ['工作区隔离', formatValue(record.isolation)],
    ['运行限制', formatValue(record.limits)],
    ['条件与边界', formatValue(record.conditions)],
  ];
}

const schemas = {
  commands: {
    quickTitle: '命令对照',
    markdownDirectory: 'commands',
    fields: commandFields,
  },
  subagents: {
    quickTitle: '能力结论',
    markdownDirectory: 'subagents',
    fields: subagentFields,
  },
};

if (!row || !detail) {
  missing.hidden = false;
} else {
  const category = matrix.categories.find((item) => item.id === row.category);
  const schema = schemas[row.category];
  const categoryRows = matrix.rows.filter(
    (item) => item.category === row.category && details[item.id],
  );
  const currentIndex = categoryRows.findIndex((item) => item.id === row.id);
  const previous = categoryRows[currentIndex - 1];
  const next = categoryRows[currentIndex + 1];

  document.title = `${row.capability} · Code Agent 能力矩阵`;
  document.querySelector('meta[name="description"]').content = detail.definition;
  document.querySelector('#categoryLink').href =
    `./#${encodeURIComponent(row.category)}`;
  document.querySelector('#categoryLink').textContent = category.name;
  document.querySelector('#breadcrumbTitle').textContent = row.capability;
  document.querySelector('#capabilityCategory').textContent = category.name;
  document.querySelector('#capabilityTitle').textContent = row.capability;
  document.querySelector('#capabilityDescription').textContent = detail.definition;
  document.querySelector('#capabilityUpdated').textContent = matrix.updatedAt;
  document.querySelector('#quick-title').textContent = schema.quickTitle;

  document.querySelector('#quickGrid').innerHTML = matrix.products
    .map((product) => {
      const value = row.values[product.id];
      return `
        <article class="quick-card quick-card--${rowValueState(value)}">
          <h3>${escapeHtml(product.name)}</h3>
          <p>${formatValue(value)}</p>
          <a href="#product-${product.id}">查看记录 ↓</a>
        </article>
      `;
    })
    .join('');

  renderList(document.querySelector('#includesList'), detail.includes);
  renderList(document.querySelector('#excludesList'), detail.excludes);
  renderList(document.querySelector('#factsList'), detail.facts);

  document.querySelector('#productIndex').innerHTML = matrix.products
    .map(
      (product) =>
        `<a href="#product-${product.id}">${escapeHtml(product.name)}</a>`,
    )
    .join('');

  document.querySelector('#productRecords').innerHTML = matrix.products
    .map((product, index) => {
      const record = detail.products[product.id];
      const sources = record.sources
        .map((sourceId) => matrix.sources[sourceId])
        .map(
          (source) =>
            `<a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} ↗</a>`,
        )
        .join('');
      const fields = schema
        .fields(record)
        .map(
          ([label, value]) =>
            `<div><dt>${escapeHtml(label)}</dt><dd>${value}</dd></div>`,
        )
        .join('');

      return `
        <article id="product-${product.id}" class="product-record">
          <header>
            <span class="record-number">${String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3>${escapeHtml(product.name)}</h3>
              <span class="status status--${statusClass(record.status)}">${escapeHtml(record.status)}</span>
            </div>
          </header>
          <dl>
            ${fields}
            <div><dt>证据</dt><dd class="inline-sources">${sources}</dd></div>
          </dl>
        </article>
      `;
    })
    .join('');

  const allSourceIds = [
    ...new Set(
      Object.values(detail.products).flatMap((product) => product.sources),
    ),
  ];
  document.querySelector('#sourceLinks').innerHTML = allSourceIds
    .map((sourceId) => matrix.sources[sourceId])
    .map(
      (source) =>
        `<a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} <span>↗</span></a>`,
    )
    .join('');

  document.querySelector('#relatedLinks').innerHTML = detail.related
    .map((id) => matrix.rows.find((item) => item.id === id))
    .filter(Boolean)
    .map((related) => {
      const href = details[related.id]
        ? `./capability.html?id=${encodeURIComponent(related.id)}`
        : `./#${encodeURIComponent(related.category)}`;
      return `<a href="${href}">${escapeHtml(related.capability)} →</a>`;
    })
    .join('');

  document.querySelector('#markdownLink').href =
    `${repoDetailBase}${schema.markdownDirectory}/${encodeURIComponent(row.id)}.md`;

  const previousLink = document.querySelector('#previousCapability');
  const nextLink = document.querySelector('#nextCapability');
  if (previous) {
    previousLink.href = `./capability.html?id=${encodeURIComponent(previous.id)}`;
    previousLink.innerHTML = `<span>上一个</span>${escapeHtml(previous.capability)}`;
  } else {
    previousLink.hidden = true;
  }
  if (next) {
    nextLink.href = `./capability.html?id=${encodeURIComponent(next.id)}`;
    nextLink.innerHTML = `<span>下一个</span>${escapeHtml(next.capability)}`;
  } else {
    nextLink.hidden = true;
  }

  document.querySelector('#copyLink').addEventListener('click', async (event) => {
    await navigator.clipboard.writeText(window.location.href);
    event.currentTarget.textContent = '已复制';
    window.setTimeout(() => {
      event.currentTarget.textContent = '复制本页链接';
    }, 1600);
  });

  main.hidden = false;
}
