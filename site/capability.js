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

function securityFields(record) {
  return [
    ['矩阵结论', formatValue(record.value)],
    ['入口与切换', formatValue(record.entry)],
    ['默认状态', formatValue(record.defaults)],
    ['具体行为', formatValue(record.behavior)],
    ['规则能力', formatValue(record.rules)],
    ['隔离边界', formatValue(record.boundary)],
    ['保存与作用域', formatValue(record.persistence)],
    ['非交互行为', formatValue(record.noninteractive)],
    ['条件与边界', formatValue(record.conditions)],
  ];
}

function sessionFields(record) {
  return [
    ['矩阵结论', formatValue(record.value)],
    ['入口与切换', formatValue(record.entry)],
    ['保存位置', formatValue(record.storage)],
    ['具体行为', formatValue(record.behavior)],
    ['状态范围', formatValue(record.scope)],
    ['自动行为', formatValue(record.automation)],
    ['保存与保留', formatValue(record.persistence)],
    ['适用界面', formatValue(record.surfaces)],
    ['条件与边界', formatValue(record.conditions)],
  ];
}

function extensionFields(record) {
  return [
    ['矩阵结论', formatValue(record.value)],
    ['入口与配置', formatValue(record.entry)],
    ['文件与目录', formatValue(record.location)],
    ['具体行为', formatValue(record.behavior)],
    ['作用域与优先级', formatValue(record.scope)],
    ['扩展构成', formatValue(record.components)],
    ['加载与刷新', formatValue(record.loading)],
    ['适用界面', formatValue(record.surfaces)],
    ['权限与信任', formatValue(record.permissions)],
    ['条件与边界', formatValue(record.conditions)],
  ];
}

function executionFields(record) {
  return [
    ['矩阵结论', formatValue(record.value)],
    ['入口与工具', formatValue(record.entry)],
    ['核心机制', formatValue(record.primitives)],
    ['执行行为', formatValue(record.behavior)],
    ['运行范围', formatValue(record.scope)],
    ['后台与并发', formatValue(record.background)],
    ['Git 与平台联动', formatValue(record.integration)],
    ['状态与产物', formatValue(record.artifacts)],
    ['条件与边界', formatValue(record.conditions)],
  ];
}

function surfaceFields(record) {
  return [
    ['矩阵结论', formatValue(record.value)],
    ['入口与调用', formatValue(record.entry)],
    ['协议与输出', formatValue(record.protocol)],
    ['具体行为', formatValue(record.behavior)],
    ['会话与状态', formatValue(record.state)],
    ['工具与能力', formatValue(record.tools)],
    ['认证与权限', formatValue(record.auth)],
    ['运行位置', formatValue(record.deployment)],
    ['条件与边界', formatValue(record.conditions)],
  ];
}

function modelFields(record) {
  return [
    ['矩阵结论', formatValue(record.value)],
    ['入口与配置', formatValue(record.entry)],
    ['支持范围', formatValue(record.mechanism)],
    ['具体行为', formatValue(record.behavior)],
    ['会话与作用域', formatValue(record.scope)],
    ['持久化位置', formatValue(record.persistence)],
    ['自动化用法', formatValue(record.automation)],
    ['安全与管理', formatValue(record.security)],
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
  security: {
    quickTitle: '权限结论',
    markdownDirectory: 'security',
    fields: securityFields,
  },
  sessions: {
    quickTitle: '会话结论',
    markdownDirectory: 'sessions',
    fields: sessionFields,
  },
  extensions: {
    quickTitle: '扩展结论',
    markdownDirectory: 'extensions',
    fields: extensionFields,
  },
  execution: {
    quickTitle: '执行结论',
    markdownDirectory: 'execution',
    fields: executionFields,
  },
  surfaces: {
    quickTitle: '能力结论',
    markdownDirectory: 'surfaces',
    fields: surfaceFields,
  },
  models: {
    quickTitle: '模型与认证结论',
    markdownDirectory: 'models',
    fields: modelFields,
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
        <article class="quick-card quick-card--${statusClass(detail.products[product.id].status)}">
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
