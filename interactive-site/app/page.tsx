"use client";

import { useState } from "react";

type Product = "codex" | "claude" | "qwen";
type ProductFilter = Product | "all";
type RelationKey = "validation" | "layering" | "diagnostics";
type DecisionFilter = "all" | "now" | "next" | "deferred" | "no-build";

const products: Array<{
  id: Product;
  name: string;
  version: string;
  channel: string;
  surface: string;
}> = [
  {
    id: "codex",
    name: "Codex",
    version: "0.145.0",
    channel: "latest",
    surface: "CLI",
  },
  {
    id: "claude",
    name: "Claude Code",
    version: "2.1.212",
    channel: "stable",
    surface: "CLI",
  },
  {
    id: "qwen",
    name: "Qwen Code",
    version: "0.21.0",
    channel: "effective latest",
    surface: "CLI",
  },
];

const conclusions = [
  {
    index: "01",
    title: "这是精确切片比较，不是产品总排名",
    body: "结论只适用于三个指定版本、入口与 Surface。Atomic、Claim、Comparison 数量都是证据覆盖量，不能解释为功能数或得分。",
  },
  {
    index: "02",
    title: "R1 已完成，R2 仍独立延期",
    body: "Stage 3 完成 53 次本地观察执行；凭据读取、provider/model 调用、模型费用均为 0。成功路径仍需 fake provider 或专项授权。",
  },
  {
    index: "03",
    title: "关系以 Partial、Unknown、Not assessed 为主",
    body: "现有证据没有支持三产品整体等价，也没有支持“谁更强”。Unknown 和 Not assessed 都不是“不支持”。",
  },
  {
    index: "04",
    title: "Qwen 最终只收敛出 3 个路线图项目",
    body: "一个 P0 有界缺陷、一个 P1 机器错误契约、一个 P1 配置消费链调查；其余保持 Deferred、条件重开或 No-build。",
  },
];

const relationViews: Record<
  RelationKey,
  {
    label: string;
    title: string;
    atomic: string;
    summary: string;
    warning: string;
    pairs: Array<{
      products: [Product, Product];
      pair: string;
      relation: "Partial overlap" | "Unknown" | "Not assessed";
      detail: string;
    }>;
  }
> = {
  validation: {
    label: "配置校验",
    title: "配置类型与跨字段校验",
    atomic: "Phase 2C · selected type/cross-field validation",
    summary:
      "只有 Codex–Claude 在选定校验路径上形成可比较重叠；Qwen 当前只闭合 startup loader 的 bounded non-rejection。",
    warning:
      "Unknown ≠ Not supported。startup loader 未拒绝，也不能外推为 consumer 已接受。",
    pairs: [
      {
        products: ["codex", "claude"],
        pair: "Codex ↔ Claude Code",
        relation: "Partial overlap",
        detail:
          "选定 type/cross-field validation 存在重叠，但 unknown-key handling 与错误 envelope 不同。",
      },
      {
        products: ["codex", "qwen"],
        pair: "Codex ↔ Qwen Code",
        relation: "Unknown",
        detail:
          "Qwen startup loader 未递归执行内部 settings schema；无法判断实际 consumer 的最终策略。",
      },
      {
        products: ["claude", "qwen"],
        pair: "Claude Code ↔ Qwen Code",
        relation: "Unknown",
        detail:
          "尚未获得与 Claude consumer-level validation 对齐的 Qwen observable outcome。",
      },
    ],
  },
  layering: {
    label: "配置分层",
    title: "Effective config layering",
    atomic: "Phase 2D · CAP-12.09-A01",
    summary:
      "三方都观察到多层配置，但优先级、信任抑制与来源投影机制不同，因此三组关系都只是 Partial overlap。",
    warning:
      "三组都不是 Equivalent；unique-sentinel 结果也不等于完整 provenance API。",
    pairs: [
      {
        products: ["codex", "claude"],
        pair: "Codex ↔ Claude Code",
        relation: "Partial overlap",
        detail:
          "Codex 包含 trusted project、untrusted suppression 与 session flag origin；Claude 的选定顺序为 local > project > user。",
      },
      {
        products: ["codex", "qwen"],
        pair: "Codex ↔ Qwen Code",
        relation: "Partial overlap",
        detail:
          "两者都观察到 trust 对项目配置生效的影响，但层级命名、优先级与来源机制不同。",
      },
      {
        products: ["claude", "qwen"],
        pair: "Claude Code ↔ Qwen Code",
        relation: "Partial overlap",
        detail:
          "Qwen 的选定顺序为 System > trusted Workspace > User > SystemDefaults，并包含 untrusted workspace suppression。",
      },
    ],
  },
  diagnostics: {
    label: "诊断故障",
    title: "Diagnostic fault matrix",
    atomic: "Phase 2E · CAP-12.05-A02",
    summary:
      "三方入口、资源对象与故障目标没有形成同构对照，所以三组 pairwise relation 全部保守保持 Not assessed。",
    warning: "Not assessed ≠ 缺失、失败或 Gap。",
    pairs: [
      {
        products: ["codex", "claude"],
        pair: "Codex ↔ Claude Code",
        relation: "Not assessed",
        detail:
          "Claude interactive doctor 因 Keychain 安全边界未运行，双方未形成同构故障对照。",
      },
      {
        products: ["codex", "qwen"],
        pair: "Codex ↔ Qwen Code",
        relation: "Not assessed",
        detail:
          "Codex 观察 custom CA 与 version cache；Qwen 观察 PATH 缺失与 daemon log 降级，故障对象不同。",
      },
      {
        products: ["claude", "qwen"],
        pair: "Claude Code ↔ Qwen Code",
        relation: "Not assessed",
        detail:
          "Claude interactive doctor 未执行，且与 Qwen sdk-daemon 的入口和资源对象不同。",
      },
    ],
  },
};

const decisions: Array<{
  id: string;
  category: Exclude<DecisionFilter, "all">;
  classification: string;
  decision: string;
  title: string;
  body: string;
}> = [
  {
    id: "S4-01",
    category: "now",
    classification: "Verified Gap",
    decision: "Now / P0",
    title: "权限错误被误标为缺失",
    body: "EACCES / EPERM 当前映射为 missing_file；应与 ENOENT 分开。",
  },
  {
    id: "S4-02",
    category: "now",
    classification: "Product opportunity",
    decision: "Now / P1",
    title: "Headless 错误缺少机器契约",
    body: "先为 missing credential 与 malformed schema 提供版本化结构错误。",
  },
  {
    id: "S4-03",
    category: "next",
    classification: "Investigation",
    decision: "Next / investigate",
    title: "Loader 通过不代表 Consumer 接受",
    body: "追踪两个 fixture 的 loader → merge/trust → 实际读点，再决定是否修复。",
  },
  {
    id: "S4-04",
    category: "deferred",
    classification: "Product opportunity",
    decision: "Conditional reopen",
    title: "配置来源不可直接解释",
    body: "只在真实支持需求或 S4-03 证明收益后重开 provenance 设计。",
  },
  {
    id: "S4-05",
    category: "deferred",
    classification: "Evidence debt",
    decision: "Deferred evidence",
    title: "成功路径与 Daemon 生命周期未验证",
    body: "等待 deterministic fake provider 或专项授权；不是当前产品缺陷。",
  },
  {
    id: "S4-06",
    category: "no-build",
    classification: "No-build",
    decision: "No-build",
    title: "不复制 standalone doctor",
    body: "三方入口与诊断对象不同，不为命令名 parity 建设。",
  },
  {
    id: "S4-07",
    category: "no-build",
    classification: "No-build",
    decision: "No-build",
    title: "不对齐 Schema 版本外形",
    body: "generated、editor/runtime 与 settings format 是不同机制。",
  },
  {
    id: "S4-08",
    category: "no-build",
    classification: "No-build",
    decision: "No-build",
    title: "不默认严格拒绝未知键",
    body: "尚无证据证明 strict rejection 更优，同时需要保留前向兼容。",
  },
];

const roadmap = [
  {
    id: "BL-01",
    source: "S4-01",
    priority: "P0",
    title: "Daemon preflight error classification",
    outcome: "permission failure 不再标为 missing_file",
    deliverables: [
      "ENOENT 保持 missing",
      "EACCES / EPERM 返回 permission-specific machine kind",
      "保留现有 message 与 envelope",
      "补齐 shared type、mapper 与 preflight contract tests",
    ],
    boundaries: [
      "不重做全部 daemon taxonomy",
      "不改变工具集合、HTTP route 或 overall status",
      "不新增 standalone doctor",
    ],
  },
  {
    id: "BL-02",
    source: "S4-02",
    priority: "P1",
    title: "Headless machine error contract v1",
    outcome: "两个无模型 failure 获得 additive、版本化的机器错误契约",
    deliverables: [
      "仅覆盖 missing credential 与 malformed output schema",
      "至少表达 version、code/category、stage、retryable、correlation",
      "保留 message、已有字段与 exit semantics",
      "全部 contract tests 离线运行",
    ],
    boundaries: [
      "不覆盖 provider transient、tool failure、cancel",
      "不覆盖 success / final / event lifecycle",
      "不复制 Codex / Claude 的 JSON shape",
    ],
  },
  {
    id: "BL-03",
    source: "S4-03",
    priority: "P1",
    title: "Config loader → consumer investigation",
    outcome: "两个 fixture 获得可审计的 loader-to-read-site policy matrix",
    deliverables: [
      '调查 general.vimMode: "true"',
      "调查 command hook 缺少 command",
      "建立 source → migration → merge/trust → effective → read sites 矩阵",
      "此阶段不修改生产行为",
    ],
    boundaries: [
      "不重写全量 settings",
      "不默认 strict reject unknown key",
      "未完成读点调查前不增加 global startup validation",
    ],
  },
];

const phaseLinks = [
  { label: "总览", target: "overview" },
  { label: "关系", target: "relations" },
  { label: "决策", target: "decisions" },
  { label: "路线图", target: "roadmap" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

export default function Home() {
  const [activeProduct, setActiveProduct] = useState<ProductFilter>("all");
  const [activeRelation, setActiveRelation] =
    useState<RelationKey>("validation");
  const [decisionFilter, setDecisionFilter] =
    useState<DecisionFilter>("all");
  const relation = relationViews[activeRelation];
  const visibleDecisions = decisions.filter(
    (item) => decisionFilter === "all" || item.category === decisionFilter,
  );

  return (
    <main>
      <header className="topbar">
        <button
          className="wordmark"
          type="button"
          onClick={() => scrollToSection("top")}
          aria-label="返回页面顶部"
        >
          CCQ <span>{"//"}</span> 2026.07
        </button>
        <nav className="topnav" aria-label="报告章节">
          {phaseLinks.map((item) => (
            <button
              type="button"
              key={item.target}
              onClick={() => scrollToSection(item.target)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="print-button"
          onClick={() => window.print()}
        >
          打印 / PDF
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">
            EXACT-SLICE RESEARCH <span>FINAL · STAGE 0–6</span>
          </p>
          <h1>
            对比不是计数，
            <br />
            是证据边界。
          </h1>
          <p className="hero-intro">
            Codex、Claude Code 与 Qwen Code 的功能对比，按指定版本、入口和
            Surface 建立事实、关系与决策。为 Qwen 研发评审而写。
          </p>

          <div className="product-selector" aria-label="突出显示产品">
            <button
              type="button"
              className={activeProduct === "all" ? "is-active" : ""}
              aria-pressed={activeProduct === "all"}
              onClick={() => setActiveProduct("all")}
            >
              三方
            </button>
            {products.map((product) => (
              <button
                type="button"
                key={product.id}
                data-product={product.id}
                className={activeProduct === product.id ? "is-active" : ""}
                aria-pressed={activeProduct === product.id}
                onClick={() => setActiveProduct(product.id)}
              >
                {product.name}
              </button>
            ))}
          </div>

          <div className="version-ledger">
            {products.map((product) => (
              <article
                key={product.id}
                data-product={product.id}
                className={
                  activeProduct !== "all" && activeProduct !== product.id
                    ? "is-muted"
                    : ""
                }
              >
                <span className="product-signal" aria-hidden="true" />
                <div>
                  <strong>{product.name}</strong>
                  <p>
                    {product.version} / {product.channel} / {product.surface}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="evidence-instrument" aria-label="证据规模摘要">
          <div className="instrument-register register-one" />
          <div className="instrument-register register-two" />
          <div className="signal-line codex-line" />
          <div className="signal-line claude-line" />
          <div className="signal-line qwen-line" />
          <div className="lens">
            <span className="lens-label">EVIDENCE LENS</span>
            <strong>550</strong>
            <span>atomic records</span>
          </div>
          <div className="lens-note note-left">
            <span>144</span>
            topics
          </div>
          <div className="lens-note note-right">
            <span>95</span>
            comparisons
          </div>
        </div>

        <div className="hero-status">
          <span className="status-mark" aria-hidden="true" />
          <strong>原总计划已闭环</strong>
          <span>R2 独立 Deferred</span>
          <span>Credential / Provider / Cost = 0 / 0 / 0</span>
        </div>
      </section>

      <div className="phase-ruler" aria-label="总计划阶段状态">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index}>
            <span>{index}</span>
            <i aria-hidden="true" />
            <small>Complete</small>
          </div>
        ))}
      </div>

      <section className="section-block overview-section" id="overview">
        <div className="section-heading">
          <p className="section-number">00 / READ FIRST</p>
          <h2>先读结论，再看证据。</h2>
          <p>
            页面刻意不提供“功能总数”或“产品得分”。所有数字先说明它是什么，再说明它不是什么。
          </p>
        </div>

        <div className="conclusion-list">
          {conclusions.map((item) => (
            <article key={item.index}>
              <span>{item.index}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="evidence-ledger">
          <div className="ledger-title">
            <p className="eyebrow">EVIDENCE LEDGER</p>
            <h3>覆盖量，不是排行榜。</h3>
          </div>
          <div className="ledger-grid">
            <div>
              <strong>144</strong>
              <span>topics</span>
              <small>用户任务主题</small>
            </div>
            <div>
              <strong>550</strong>
              <span>atomics</span>
              <small>原子能力记录</small>
            </div>
            <div>
              <strong>425</strong>
              <span>CLI claims</span>
              <small>指定 CLI Slice</small>
            </div>
            <div>
              <strong>38</strong>
              <span>secondary claims</span>
              <small>sdk / daemon，不外推 CLI</small>
            </div>
            <div>
              <strong>95</strong>
              <span>comparisons</span>
              <small>pairwise scoped relation</small>
            </div>
          </div>
        </div>

        <div className="runtime-strip">
          <div className="runtime-copy">
            <p className="eyebrow">RUNTIME · R1</p>
            <h3>53 次本地观察执行</h3>
            <p>
              只表示 harness、安全、完整性与 observation gate
              通过，不是成功任务数。
            </p>
          </div>
          <div className="runtime-visual">
            <div className="runtime-bar" aria-label="运行时执行分布">
              <span className="phase-2b" style={{ flex: 23 }}>
                <b>23</b>
              </span>
              <span className="phase-2c" style={{ flex: 15 }}>
                <b>15</b>
              </span>
              <span className="phase-2d" style={{ flex: 8 }}>
                <b>8</b>
              </span>
              <span className="phase-2e" style={{ flex: 7 }}>
                <b>7</b>
              </span>
            </div>
            <div className="runtime-key">
              <span>2B · Headless / local config</span>
              <span>2C · Config schema</span>
              <span>2D · Identity / layering</span>
              <span>2E · Diagnostic faults</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block relation-section" id="relations">
        <div className="section-heading split-heading">
          <div>
            <p className="section-number">01 / RELATION EXPLORER</p>
            <h2>相同名称，不等于相同行为。</h2>
          </div>
          <p>
            选择一个可比较任务，查看三组 pairwise relation。产品筛选只做视觉聚焦，不改变结论。
          </p>
        </div>

        <div className="relation-tabs" role="tablist" aria-label="比较场景">
          {(Object.keys(relationViews) as RelationKey[]).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeRelation === key}
              aria-controls="relation-panel"
              className={activeRelation === key ? "is-active" : ""}
              onClick={() => setActiveRelation(key)}
            >
              {relationViews[key].label}
            </button>
          ))}
        </div>

        <div
          className="relation-workbench"
          id="relation-panel"
          role="tabpanel"
        >
          <div className="relation-context">
            <p className="utility-label">{relation.atomic}</p>
            <h3>{relation.title}</h3>
            <p>{relation.summary}</p>
            <div className="relation-warning">
              <span>BOUNDARY</span>
              {relation.warning}
            </div>
          </div>

          <div className="pair-list">
            {relation.pairs.map((pair) => {
              const muted =
                activeProduct !== "all" &&
                !pair.products.includes(activeProduct);
              return (
                <article
                  key={pair.pair}
                  className={muted ? "is-muted" : ""}
                >
                  <div className="pair-heading">
                    <h4>{pair.pair}</h4>
                    <span
                      className={`relation-chip relation-${pair.relation
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {pair.relation}
                    </span>
                  </div>
                  <p>{pair.detail}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="surface-note">
          <strong>Surface boundary</strong>
          <span>
            主 Claim Cohort 是 CLI；Stage 3 还使用 Codex app-server 与 Qwen
            sdk-daemon。secondary evidence 不反向改写 CLI Claim。
          </span>
        </div>
      </section>

      <section className="section-block decision-section" id="decisions">
        <div className="section-heading split-heading">
          <div>
            <p className="section-number">02 / QWEN DECISION REGISTER</p>
            <h2>差异先分类，再决定是否建设。</h2>
          </div>
          <p>
            Gap、机会、调查、Evidence debt 与 No-build
            是不同结论。竞品存在某种形态，不自动构成 Qwen 缺口。
          </p>
        </div>

        <div className="decision-filters" aria-label="筛选 Qwen 决策">
          {(
            [
              ["all", "全部 8"],
              ["now", "Now"],
              ["next", "Next"],
              ["deferred", "Deferred"],
              ["no-build", "No-build"],
            ] as Array<[DecisionFilter, string]>
          ).map(([key, label]) => (
            <button
              type="button"
              key={key}
              className={decisionFilter === key ? "is-active" : ""}
              aria-pressed={decisionFilter === key}
              onClick={() => setDecisionFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="decision-table">
          <div className="decision-table-head" aria-hidden="true">
            <span>ID</span>
            <span>Class / Decision</span>
            <span>用户问题与边界</span>
          </div>
          {visibleDecisions.map((item) => (
            <article key={item.id} data-category={item.category}>
              <strong className="decision-id">{item.id}</strong>
              <div className="decision-class">
                <span>{item.classification}</span>
                <b>{item.decision}</b>
              </div>
              <div className="decision-copy">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block roadmap-section" id="roadmap">
        <div className="section-heading split-heading">
          <div>
            <p className="section-number">03 / PROPOSED ROADMAP</p>
            <h2>最后只留下三项。</h2>
          </div>
          <p>
            P0/P1 是本轮建议优先级，不代表已立项、承诺日期或授权开发。点击项目展开最小交付与停止线。
          </p>
        </div>

        <div className="roadmap-list">
          {roadmap.map((item, index) => (
            <details key={item.id} open={index === 0}>
              <summary>
                <div className="roadmap-code">
                  <span>{item.id}</span>
                  <small>from {item.source}</small>
                </div>
                <div className="roadmap-title">
                  <p>{item.title}</p>
                  <strong>{item.outcome}</strong>
                </div>
                <span className="priority">{item.priority}</span>
                <i aria-hidden="true">+</i>
              </summary>
              <div className="roadmap-detail">
                <div>
                  <h4>Smallest deliverable</h4>
                  <ul>
                    {item.deliverables.map((deliverable) => (
                      <li key={deliverable}>{deliverable}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Stop line</h4>
                  <ul>
                    {item.boundaries.map((boundary) => (
                      <li key={boundary}>{boundary}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          ))}
        </div>

        <div className="deferred-panel">
          <div>
            <p className="utility-label">R2 · INDEPENDENTLY DEFERRED</p>
            <h3>未授权成功路径不进入产品 backlog。</h3>
          </div>
          <ol>
            <li>
              <span>R2-1</span> argv / stdin success
            </li>
            <li>
              <span>R2-2</span> complete event / final lifecycle
            </li>
            <li>
              <span>R2-3</span> legal output-schema success
            </li>
            <li>
              <span>R2-4</span> provider error taxonomy
            </li>
          </ol>
          <p>
            需要 deterministic fake provider，或单独明确 identity、endpoint、model、
            region 与费用上限。
          </p>
        </div>
      </section>

      <footer>
        <div>
          <strong>Codex × Claude Code × Qwen Code</strong>
          <span>Exact-version · Evidence-first · Qwen-oriented</span>
        </div>
        <p>
          Final research slice · 2026-07-26
          <br />
          Unknown ≠ Not supported · Not assessed ≠ Gap
        </p>
      </footer>
    </main>
  );
}
