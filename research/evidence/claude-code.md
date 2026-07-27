# Claude Code：阶段 1B Evidence Ledger

> 主基线：`2.1.212` / `stable`  
> latest 增量：`2.1.220` / `latest`  
> 采集平台：macOS 26.5.1 (25F80), arm64, zsh 5.9  
> 官方网页 snapshot：`2026-07-25T14:42:21Z`

## 1. Ledger 约定

本文只使用以下证据源：

- 冻结的 Claude Code native binary、由其导出的 bounded strings 文件；
- Claude Code 官方 native manifest；
- `github.com/anthropics/claude-code` 的 immutable tag changelog；
- `code.claude.com/docs` 的官方 Markdown 页面。

没有把搜索结果摘要、第三方文章或当前 qwen-code checkout 当作证据。网页 DOC 的
`version` 使用“snapshot 时间 + 内容 SHA-256”标识证据版本；这不是 Claude Code
产品版本。若页面没有 `min-version` 或 release 锚点，关系中会写
`qualifies: exact 2.1.212 applicability unproven`。

### 1.1 公共字段展开

为避免每行重复大段 `not-applicable`，以下默认值是每条 Evidence Record 的规范
组成：

- `product=Claude Code`。
- DOC / CHANGELOG / META / BINARY：
  `runtime_probe.applicability=not-applicable`；其
  `preconditions/procedure/stdout/stderr/side_effects/cleanup=[]`，
  `exit_code/started_at/finished_at=not-applicable`。
- DOC / CHANGELOG：
  `environment.platform=[not-applicable]`，
  `authentication=[]`，`entitlement=[]`，
  `region/provider/model=not-applicable`，
  `configuration=[]`，`feature_flags=[]`；单页涉及门禁时在该行补充。
- 本地 HELP / RUNTIME / BINARY：
  `environment.platform=[macOS 26.5.1 build 25F80, arm64, zsh 5.9, host]`，
  `authentication=[]`，`entitlement=[]`，
  `region/provider/model=not-applicable`，
  `configuration=[]`，`feature_flags=[]`。
- `Discovery links` 中 `supports` 表示直接支撑所述发行身份、Surface 或公开承诺；
  `qualifies` 表示只能限定版本/Surface/证据强度，不能单独确认 runtime。

## 2. 冻结发行物、Runtime、Help 与 Binary

| Evidence ID | type；version / channel / surface | source | captured_at；hash / bounded observation | 可证明范围 | Discovery links | limitations |
| --- | --- | --- | --- | --- | --- | --- |
| `EVD-claude-code-META-001` | `META`; `2.1.212`; `stable`; `cli` | [official native manifest](https://downloads.claude.ai/claude-code-releases/2.1.212/manifest.json) | `2026-07-25T14:28:33Z`; build commit `8b2783a8f907ce5c5ad1241ecdbab0ff3301c617`, build time `2026-07-16T16:50:33Z`; Darwin arm64 size `244530512`, SHA-256 `09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574` | 官方 manifest 对 stable native artifact 的身份、平台、size 和 digest | supports `FACT-claude-code-001`（发行身份） | manifest 与本地文件的相等性还需 `RUNTIME-001` 的本地 hash；不能证明 Agent 行为。 |
| `EVD-claude-code-RUNTIME-001` | `RUNTIME`; `2.1.212`; `stable`; `cli` | `/private/tmp/ccq-phase1b-claude-2.1.212/package/claude` | `2026-07-25T14:38:31Z`; local size `244530512`; SHA-256 `09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574`; stdout `2.1.212 (Claude Code)` | 指定 Darwin arm64 binary 可启动、报告精确版本，且 bytes 与 manifest digest 一致 | supports `FACT-claude-code-001`（本地复现） | 只执行 `--version`；没有认证、网络或 workspace tool 行为。 |
| `EVD-claude-code-HELP-001` | `HELP`; `2.1.212`; `stable`; `cli` | `/private/tmp/ccq-phase1b-claude-2.1.212/package/claude --help` | `2026-07-25T14:38:49Z`; binary SHA 同上；bounded excerpt：默认 interactive，`-p` non-interactive；列出 session、permission、model、stream-json、remote-control、worktree、debug 等 flags | 冻结 binary 的顶层用户可发现 CLI Surface 与 flag help 文案 | supports `FACT-claude-code-002`, `FACT-claude-code-003`, `FACT-claude-code-005`, `FACT-claude-code-006`, `FACT-claude-code-007`, `FACT-claude-code-008`, `FACT-claude-code-009`, `FACT-claude-code-010`, `FACT-claude-code-013`, `FACT-claude-code-014`, `FACT-claude-code-015`, `FACT-claude-code-016`, `FACT-claude-code-023`, `FACT-claude-code-025`, `FACT-claude-code-027`, `FACT-claude-code-031`, `FACT-claude-code-033`, `FACT-claude-code-036`, `FACT-claude-code-038`, `FACT-claude-code-039`, `FACT-claude-code-040`, `FACT-claude-code-041`, `FACT-claude-code-043`, `FACT-claude-code-044`, `FACT-claude-code-045`, `FACT-claude-code-046`, `FACT-claude-code-047`, `FACT-claude-code-048`, `FACT-claude-code-049`（公开 flag）；supports `ALIAS-claude-code-001`, `ALIAS-claude-code-003`, `ALIAS-claude-code-004`, `ALIAS-claude-code-005`, `ALIAS-claude-code-006`, `ALIAS-claude-code-007`, `ALIAS-claude-code-008`, `ALIAS-claude-code-009`, `ALIAS-claude-code-010`, `ALIAS-claude-code-011`, `ALIAS-claude-code-014`, `ALIAS-claude-code-016`, `ALIAS-claude-code-019`, `ALIAS-claude-code-020`, `ALIAS-claude-code-024`, `ALIAS-claude-code-027`, `ALIAS-claude-code-028`, `ALIAS-claude-code-029`, `ALIAS-claude-code-030`, `ALIAS-claude-code-031`, `ALIAS-claude-code-032`, `ALIAS-claude-code-033`, `ALIAS-claude-code-034`, `ALIAS-claude-code-035`（exact term）；qualifies all（help 不能证明正常路径） | 未执行 help 中有副作用或需认证的入口；help 文案不能证明后端 entitlement、runtime 成功或默认行为。 |
| `EVD-claude-code-HELP-002` | `HELP`; `2.1.212`; `stable`; `cli` | `/private/tmp/ccq-phase1b-claude-2.1.212/package/claude`；invocations `auth/install/mcp --help` | `2026-07-25T14:38:49Z`; bounded excerpt：auth 有 login/logout/status；install target 为 stable/latest/exact；MCP 有 add/get/list/login/logout/remove/serve，pending project server 不连接 | 冻结 auth、安装和 MCP 子命令面、transport/examples、pending-trust help 语义 | supports `FACT-claude-code-004`, `FACT-claude-code-029`（子命令面）；supports `ALIAS-claude-code-002`, `ALIAS-claude-code-022`（exact term）；qualifies all（未执行子命令） | 未登录、安装或变更 MCP 配置；OAuth、health check 和 scope 持久化未复现。 |
| `EVD-claude-code-HELP-003` | `HELP`; `2.1.212`; `stable`; `cli` | `/private/tmp/ccq-phase1b-claude-2.1.212/package/claude`；invocations `agents/plugin/doctor/ultrareview --help` | `2026-07-25T14:38:49Z`; bounded excerpt：agents 可 JSON 列出；plugin 有 marketplace/install/enable/disable/update/uninstall/eval/validate；doctor 声明 health check；ultrareview 声明 cloud-hosted multi-agent review | 冻结后台 agent、plugin、诊断和 cloud review 的命令面 | supports `FACT-claude-code-030`, `FACT-claude-code-031`, `FACT-claude-code-033`, `FACT-claude-code-037`, `FACT-claude-code-049`（子命令面）；supports `ALIAS-claude-code-023`, `ALIAS-claude-code-025`, `ALIAS-claude-code-026`, `ALIAS-claude-code-035`（exact term）；qualifies all（未执行正常路径） | 未写用户配置、未派发 agent、未上传代码、未运行 doctor。 |
| `EVD-claude-code-BINARY-001` | `BINARY`; `2.1.212`; `stable`; `cli` | `/private/tmp/ccq-phase1b-claude-2.1.212/claude-2.1.212.strings`（由冻结 binary 执行 `strings -a -n 6`） | `2026-07-25T14:28:33Z`; strings SHA-256 `9a6a544159a8edf5a9fd6fbbfacf5a652083c397ada22d0171b68d11aabfa2c9`; bounded anchors：`parent_tool_use_id`, Remote Control subscription error, `ClaudeCodeSandbox`, `CLAUDE_CODE_SAFE_MODE`, `OTEL_TRACES_EXPORTER`, `isPluginBlockedByPolicy`, `getStrictKnownMarketplaces` | 冻结发行物中存在这些稳定字符串/实现 Surface 锚点 | supports `FACT-claude-code-008`, `FACT-claude-code-024`, `FACT-claude-code-030`, `FACT-claude-code-041`, `FACT-claude-code-050`（implementation-surface only）；supports `ALIAS-claude-code-036`（config term）；qualifies all（不证明可用） | binary 是 minified/packed 实现；字符串可为错误、dead path 或兼容路径。没有以搜索未命中形成负向结论。 |

### 2.1 Runtime probe detail

```yaml
evidence_id: EVD-claude-code-RUNTIME-001
runtime_probe:
  applicability: applicable
  preconditions:
    - executable frozen Darwin arm64 binary at the recorded local path
  procedure:
    - /private/tmp/ccq-phase1b-claude-2.1.212/package/claude --version
    - shasum -a 256 /private/tmp/ccq-phase1b-claude-2.1.212/package/claude
    - stat the same explicit file
  stdout:
    - "2.1.212 (Claude Code)"
    - "09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574"
    - "244530512 bytes"
  stderr: []
  exit_code: 0
  side_effects: []
  cleanup: []
  started_at: 2026-07-25T14:38:31Z
  finished_at: 2026-07-25T14:38:32Z
```

### 2.2 Help probe detail

```yaml
evidence_ids:
  - EVD-claude-code-HELP-001
  - EVD-claude-code-HELP-002
  - EVD-claude-code-HELP-003
help_probe:
  applicability: applicable
  preconditions:
    - executable frozen Darwin arm64 binary at the recorded local path
  procedure:
    - claude --help
    - claude agents --help
    - claude auth --help
    - claude auto-mode --help
    - claude doctor --help
    - claude gateway --help
    - claude install --help
    - claude mcp --help
    - claude plugin --help
    - claude project --help
    - claude ultrareview --help
    - claude update --help
  stdout:
    - bounded excerpts are stored in the three ledger rows above
  stderr: []
  exit_code:
    claude --help: 0
    claude agents --help: 0
    claude auth --help: 0
    claude auto-mode --help: 0
    claude doctor --help: 0
    claude gateway --help: 0
    claude install --help: 0
    claude mcp --help: 0
    claude plugin --help: 0
    claude project --help: 0
    claude ultrareview --help: 0
    claude update --help: 0
  side_effects: []
  cleanup: []
  started_at: 2026-07-25T14:38:49Z
  finished_at: 2026-07-25T14:38:50Z
```

`doctor`、`update`、`project purge`、`auto-mode reset` 等正常入口均未调用；只请求
`--help`。因此没有安装、升级、配置、认证、workspace 或外部服务副作用。

## 3. Versioned changelog

| Evidence ID | type；version / channel / surface | source | captured_at；hash / bounded excerpt | 可证明范围 | Discovery links | limitations |
| --- | --- | --- | --- | --- | --- | --- |
| `EVD-claude-code-CHANGELOG-001` | `CHANGELOG`; `2.1.212`; `stable`; `cli` | [immutable v2.1.212 changelog](https://github.com/anthropics/claude-code/raw/refs/tags/v2.1.212/CHANGELOG.md) | `2026-07-25T14:41:14Z`; SHA-256 `c1cf71e2a07a269aff49902ba31b98a9d1246a5a1045d1d46db3207731c83f2e`; bounded excerpt topics：`/fork` background copy；200 search/spawn caps；MCP auto-background；plan/hook/SIGTERM fixes；OTel correlation；subagent permission inherit | 维护者对精确 `2.1.212` 新增、修改和修复的版本化声明 | supports `FACT-claude-code-009`, `FACT-claude-code-011`, `FACT-claude-code-012`, `FACT-claude-code-014`, `FACT-claude-code-016`, `FACT-claude-code-018`, `FACT-claude-code-020`, `FACT-claude-code-021`, `FACT-claude-code-022`, `FACT-claude-code-026`, `FACT-claude-code-028`, `FACT-claude-code-032`, `FACT-claude-code-033`, `FACT-claude-code-034`, `FACT-claude-code-037`, `FACT-claude-code-038`, `FACT-claude-code-041`, `FACT-claude-code-045`, `FACT-claude-code-047`, `FACT-claude-code-050`, `FACT-claude-code-051`, `FACT-claude-code-052`（versioned release statement）；supports `ALIAS-claude-code-014`, `ALIAS-claude-code-016`, `ALIAS-claude-code-017`, `ALIAS-claude-code-018`, `ALIAS-claude-code-021`（exact term）；qualifies all（release note 不复现完整边界） | release note 不足以证明所有平台、entitlement 或反例；未把未列出的项目视作缺失。 |
| `EVD-claude-code-CHANGELOG-002` | `CHANGELOG`; `2.1.220`; `latest`; `cli` | [immutable v2.1.220 changelog](https://github.com/anthropics/claude-code/raw/refs/tags/v2.1.220/CHANGELOG.md) | `2026-07-25T14:41:14Z`; SHA-256 `9e4ad11b0443ad9db409b030481e284eb819781d94ee9f1ad28844b7759d74f5`; bounded excerpt：2.1.220 仅写 reliability；其包含的 2.1.219 新增 strictAllowlist、DirectoryAdded、mcp_server_errors、nested depth 3 | latest `2.1.220` tag 所含的显式 delta；可把 2.1.219 引入项归到已包含它的 latest snapshot | supports `FACT-claude-code-053`, `FACT-claude-code-054`, `FACT-claude-code-055`, `FACT-claude-code-056`（latest delta）；supports `ALIAS-claude-code-037`, `ALIAS-claude-code-038`, `ALIAS-claude-code-039`, `ALIAS-claude-code-040`（exact term）；qualifies all（latest binary 未运行） | 未下载 2.1.220 artifact；不能回填 stable 2.1.212，也不能从 “reliability improvements” 推断未列行为。 |

## 4. Official documentation snapshots

每行 `source` 是本次实际 hash 的 Markdown representation；hash 仅锁定采集时页面
内容。所有摘录均为短片段或压缩转述。

| Evidence ID | type；version / channel / surface | source | captured_at；SHA-256 / bounded excerpt | 可证明范围 | Discovery links | limitations |
| --- | --- | --- | --- | --- | --- | --- |
| `EVD-claude-code-DOC-001` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [setup.md](https://code.claude.com/docs/en/setup.md) | `2026-07-25T14:42:21Z`; `cc4acc3af867749f1aa819a17dce2a606dcad8df70aaed1c7fe2869c46b045d6`; native recommended；Homebrew/WinGet/npm；stable/latest channel；signed manifest integrity；supported OS/arch | 官方安装、更新通道、平台前置、wrapper/native 和 integrity 的当前公开契约 | supports `FACT-claude-code-002`, `FACT-claude-code-003`, `FACT-claude-code-043`（current public contract）；qualifies `FACT-claude-code-002`, `FACT-claude-code-003`, `FACT-claude-code-043`（未整体标注 exact 2.1.212） | 可变网页；没有执行安装或 provider auth。 |
| `EVD-claude-code-DOC-002` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [platforms.md](https://code.claude.com/docs/en/platforms.md) | `2026-07-25T14:42:21Z`; `be30c00ee12f41c09ea9f31d21f11027be15cd46f8b6c27a7e3c1899cb0ebd35`; 平台表列 CLI、VS Code、JetBrains、Desktop、web/mobile 和 integrations | 官方公开的 Surface 分类及 CLI 与 IDE 集成语境 | supports `FACT-claude-code-007`; qualifies `FACT-claude-code-007`（各客户端版本独立且未冻结） | 不证明不同 Surface 共享完全相同版本、状态或能力。 |
| `EVD-claude-code-DOC-003` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [interactive-mode.md](https://code.claude.com/docs/en/interactive-mode.md) | `2026-07-25T14:42:21Z`; `282f0498c0dd2600fb538f616eae32f9c3d200e9edb8e7c734d66371586b01c0`; `Esc` interrupt and retain work；`Ctrl+B` background；`!` shell mode；Vim remap requires `>=2.1.208` | 官方 interactive entry、快捷键和 shell/background 公开语义；Vim remap 对 stable 有显式最低版本 | supports `FACT-claude-code-005`, `FACT-claude-code-006`, `FACT-claude-code-011`, `FACT-claude-code-021`（interactive contract）；qualifies exact-version-unmarked portions | 未进入 TUI；终端差异和 runtime event ordering 未复现。 |
| `EVD-claude-code-DOC-004` | `DOC`; `current-docs@2026-07-25`; `latest`; `cli` | [tools-reference.md](https://code.claude.com/docs/en/tools-reference.md) | `2026-07-25T14:42:21Z`; `23f40794c6328b20e4be4382a1f8d0b51b4152497a089ac695709a33a38884fa`; Read/Glob/Grep/Edit/Write/Bash/WebFetch/WebSearch；Bash 2m/10m；30,000-char spill file | 官方 built-in tool 输入/输出、timeout 和大输出的 current-docs 契约 | supports `FACT-claude-code-019`（current-docs tool contract）；supports `ALIAS-claude-code-015`（current-docs exact tool name）；qualifies `FACT-claude-code-010`, `FACT-claude-code-018`, `FACT-claude-code-020`, `FACT-claude-code-021`, `FACT-claude-code-022`（stable 事实的当前文档补充，不单独锚定版本）；qualifies `ALIAS-claude-code-014`, `ALIAS-claude-code-016`, `ALIAS-claude-code-017`, `ALIAS-claude-code-018`（stable exact term 由其他冻结证据锚定） | 工具均未执行；页面会演化，单页不能确认 stable 精确适用性、权限、sandbox 或 provider 行为。 |
| `EVD-claude-code-DOC-005` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [sessions.md](https://code.claude.com/docs/en/sessions.md) | `2026-07-25T14:42:21Z`; `1e233018d07944587f6609b9c9be35164334e1c1f0aff29c4fefb719ab1d0ce9`; continue/resume/from-pr；name；fork；local JSONL；retention controls | 官方 session selection、persistence、resume 和 naming 公开语义 | supports `FACT-claude-code-015`; qualifies `FACT-claude-code-015`（没有 runtime） | 未验证 project scoping、30-day cleanup、corrupt transcript 或 cross-device behavior。 |
| `EVD-claude-code-DOC-006` | `DOC`; `current-docs@2026-07-25`; `latest`; `cli` | [checkpointing.md](https://code.claude.com/docs/en/checkpointing.md) | `2026-07-25T14:42:21Z`; `58e57f783dde1e2fea704f80a1eac5b309c3bc089dc3eba8ed52d0131b9ccc43`; 100 recent checkpoints；file-edit snapshots；Bash/subagent/external edits not restored | 当前 checkpoint/rewind 公开契约及明确限制 | supports `FACT-claude-code-057`; supports `ALIAS-claude-code-012`; qualifies exact 2.1.212 restore implementation | 当前 hardlink/symlink safeguard 可能晚于 stable，因此未用于 stable 事实；未做 restore。 |
| `EVD-claude-code-DOC-007` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [memory.md](https://code.claude.com/docs/en/memory.md) | `2026-07-25T14:42:21Z`; `a7dd777240fd3f13fec00d5f9c5d3c4909e834963eceab97f01b7a74635d9ded`; CLAUDE.md scopes；auto memory per repository/shared across worktrees；loads first 200 lines or 25 KiB | 官方 persistent instructions 与 auto-memory 的当前公开语义 | supports `FACT-claude-code-013`, `FACT-claude-code-014`（memory contract）；supports `ALIAS-claude-code-007`, `ALIAS-claude-code-008`（exact term）；qualifies exact stable write/recall | 未触发 memory；页面中个别更晚 min-version 行未回填 2.1.212。 |
| `EVD-claude-code-DOC-008` | `DOC`; `current-docs@2026-07-25`; `latest`; `cli` | [context-window.md](https://code.claude.com/docs/en/context-window.md) | `2026-07-25T14:42:21Z`; `5c64e9d8f40b78f059a174ffe6402f5e4b313a8743eb8bd0cfea124a3bd4b445`; `/context`；auto/manual `/compact`；structured summary；startup context reload | 当前 context use 与 compaction 公开契约 | supports `FACT-claude-code-017`; supports `ALIAS-claude-code-013`; qualifies exact 2.1.212 applicability | 没有整体最低版本；未触发 compaction 或检查摘要保真。 |
| `EVD-claude-code-DOC-009` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [headless.md](https://code.claude.com/docs/en/headless.md) | `2026-07-25T14:42:21Z`; `881bce850c32a4a40a88269fe022d48c13d157fca72488f5c8d80e47e702a674`; `-p` uses same tools/loop/context；prompt/stdin；json/stream-json/schema/session options | 官方非交互 CLI 与 Agent loop、I/O 和结构化输出契约 | supports `FACT-claude-code-010`, `FACT-claude-code-039`, `FACT-claude-code-040`（headless contract）；qualifies runtime/error/exit behavior | 未执行 authenticated prompt；当前页面某些字段可能晚于 stable，冻结 help 用于版本锚定。 |
| `EVD-claude-code-DOC-010` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [permissions.md](https://code.claude.com/docs/en/permissions.md) | `2026-07-25T14:42:21Z`; `feb61445cd4ab2418f9ccb12ab198506705a93e5cddb1a7e2c9b1072a33e4b0e`; modes；deny→ask→allow；workspace trust；managed precedence；sandbox applies to Bash | 官方 permission modes/rules、trust、managed policy 与 sandbox 关系 | supports `FACT-claude-code-009`, `FACT-claude-code-023`, `FACT-claude-code-024`, `FACT-claude-code-025`（permission contract）；qualifies all（安全 enforcement 未 runtime） | 高影响安全边界只凭 DOC/HELP 最高 Medium；页面包含晚于 2.1.212 的标记，未回填这些行。 |
| `EVD-claude-code-DOC-011` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [sandboxing.md](https://code.claude.com/docs/en/sandboxing.md) | `2026-07-25T14:42:21Z`; `f53686eb82c0002693357b06074a102c0c463253d7e8cec024c32deff7b196a6`; OS-level Bash filesystem/network isolation；macOS Seatbelt/Linux bubblewrap | 官方 sandbox 架构和配置 Surface | supports `FACT-claude-code-024`; qualifies exact 2.1.212/default/enforcement | 未启用 sandbox；不能证明 escape resistance、fallback 或平台依赖。 |
| `EVD-claude-code-DOC-012` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [settings.md](https://code.claude.com/docs/en/settings.md) | `2026-07-25T14:42:21Z`; `72bd5d4c01128ec6e558eee97ed9bea813b2bd5af43a83ac0afb4c8a61939d81`; managed > CLI > local > project > user；managed cannot be overridden | 官方 settings scopes、delivery 和 precedence | supports `FACT-claude-code-025`; qualifies exact delivery/runtime | 未部署 managed settings；页面包含后续新增 keys，不把它们归给 stable。 |
| `EVD-claude-code-DOC-013` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [skills.md](https://code.claude.com/docs/en/skills.md) | `2026-07-25T14:42:21Z`; `868916e08681720a85c5643f1444dbb85b987772854e17d094775767939a30ad`; SKILL.md discovery；explicit/model invocation；body loads on use；scopes | 官方 Skills 发现、触发和 progressive loading 契约 | supports `FACT-claude-code-027`; supports `ALIAS-claude-code-020`; qualifies exact 2.1.212 for unmarked fields | 未创建 skill；后续新增 bundled skills/fields 未回填 stable。 |
| `EVD-claude-code-DOC-014` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [hooks.md](https://code.claude.com/docs/en/hooks.md) | `2026-07-25T14:42:21Z`; `038cad460d95b777f4a08dae02dbff2606aba557ed47faeb2a0d85aea3f53019`; lifecycle events；JSON stdin；exit 0/2；sync/async controls | 官方 Hook protocol 与 failure/decision 语义 | supports `FACT-claude-code-028`; supports `ALIAS-claude-code-021`; qualifies complete event set/exact version | 未运行 handler；事件列表会随版本扩展，stable 只由 changelog 锚定 core Surface。 |
| `EVD-claude-code-DOC-015` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [mcp.md](https://code.claude.com/docs/en/mcp.md) | `2026-07-25T14:42:21Z`; `8dc1f1ba7f4724cf90231f4d4ff54e2c09591b1eb4f427f534339581adc330c2`; scopes/transports/OAuth；tool/resource/prompt；2-minute auto-background marked `v2.1.212` | 官方 MCP 配置、认证、发现和 stable auto-background 契约 | supports `FACT-claude-code-029`; qualifies actual server/tool/reconnect behavior | 未连接服务器；文档当前动态能力未全归因 stable。 |
| `EVD-claude-code-DOC-016` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [plugins-reference.md](https://code.claude.com/docs/en/plugins-reference.md) | `2026-07-25T14:42:21Z`; `df544abbc48214a4ad46d6d2fa4e7a9a02a30cbcf941a13416483a588dfbc46b`; plugin components/scopes/marketplaces/install lifecycle/trust | 官方 plugin package structure、scope 和 lifecycle 契约 | supports `FACT-claude-code-030`; qualifies exact version/policy enforcement | 未安装插件；signature、dependency、rollback 和运行隔离未验证。 |
| `EVD-claude-code-DOC-017` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [sub-agents.md](https://code.claude.com/docs/en/sub-agents.md) | `2026-07-25T14:42:21Z`; `c477041c4bbab42de7ea48ce44ef4530b9765982292b2617a89c0939af9171a0`; separate context；prompt/tools/model/permission config；foreground/background | 官方 subagent role、context 和 override Surface | supports `FACT-claude-code-032`; qualifies isolation/default-depth/exact version | 未派发 child；当前 nested behavior 与 stable 不同，latest delta 单列。 |
| `EVD-claude-code-DOC-018` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [remote-control.md](https://code.claude.com/docs/en/remote-control.md) | `2026-07-25T14:42:21Z`; `5107fc0d9a241ed7c704662be6851208dd03ccecac825c13c44d5902af39787f`; local engine/files stay local；web/mobile client；subscription/org gate；reconnect described | 官方 Remote Control host ownership、gate 和 client contract | supports `FACT-claude-code-008`; qualifies cross-device runtime/reconnect | research preview；未登录或建立连接；当前客户端版本未冻结。 |
| `EVD-claude-code-DOC-019` | `DOC`; `current-docs@2026-07-25`; `latest`; `sdk-daemon` | [agent-sdk/overview.md](https://code.claude.com/docs/en/agent-sdk/overview.md) | `2026-07-25T14:42:21Z`; `72f434e264cd03bbad3d11ede2056ef909980c790568380027fd9b65014cc4b5`; Python/TypeScript SDK；query/messages/sessions；same engine concepts | 官方 Agent SDK embedding Surface | supports `FACT-claude-code-042`; qualifies SDK package version and CLI resolution | SDK package/tarball 未冻结或安装；不能把当前 SDK API 全部归给 CLI 2.1.212。 |
| `EVD-claude-code-DOC-020` | `DOC`; `action-v1-docs@2026-07-25`; `latest`; `ci` | [github-actions.md](https://code.claude.com/docs/en/github-actions.md) | `2026-07-25T14:42:21Z`; `b5b839f60ff45816372ac4cc13336b97c9d7abcf18571cbea7c18a49c6f51fe4`; `anthropics/claude-code-action@v1`；issue/PR mention trigger；secret/provider auth | GitHub Action v1 的官方 workflow/credential 契约 | supports `FACT-claude-code-035`; qualifies action commit and bundled/installed CLI version | 未读取 action source、未 pin commit、未运行 CI；Action v1 docs 与 CLI stable 是独立版本切片。 |
| `EVD-claude-code-DOC-021` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [model-config.md](https://code.claude.com/docs/en/model-config.md) | `2026-07-25T14:42:21Z`; `cbd3ba1917853d3d1c2f703d92cbf2a14d83419bb3969053024ad2397d940bc2`; model selection priority、aliases、provider/model constraints | 官方 model selection/configuration 公开语义 | supports `FACT-claude-code-043`, `FACT-claude-code-044`（model config contract）；qualifies current alias targets and provider availability | alias 指向会漂移；未发模型请求或枚举可用模型。 |
| `EVD-claude-code-DOC-022` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [costs.md](https://code.claude.com/docs/en/costs.md) | `2026-07-25T14:42:21Z`; `b1292713c4fafd342158d1a58cac028785ba4594bc82c20c2a62f329f59305d8`; `/usage` tokens/local USD estimate；`/clear` reset after `v2.1.211`；plan bars/cache | 官方 usage/cost display 与版本限定行为 | supports `FACT-claude-code-047`; qualifies billing accuracy/plan gates | 文档明确本地 USD estimate 非权威账单；未打开 `/usage`。 |
| `EVD-claude-code-DOC-023` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [monitoring-usage.md](https://code.claude.com/docs/en/monitoring-usage.md) | `2026-07-25T14:42:21Z`; `df45b53c15b5447ff4881cbf8c488b0cf1d1506f07c3ce04995c513a07198861`; explicit telemetry enable；OTLP metrics/logs/traces；content gates/redaction；session/prompt/tool/agent/security events | 官方 OTel configuration、signals、privacy defaults 和 correlation/audit fields | supports `FACT-claude-code-050`, `FACT-claude-code-051`（telemetry contract）；supports `ALIAS-claude-code-036`（exact config term）；qualifies runtime export/redaction | 未开启 telemetry；当前 docs 的 trace beta/新 event 可能晚于 stable，stable release 只锚定相关实现已存在。 |
| `EVD-claude-code-DOC-024` | `DOC`; `current-docs@2026-07-25`; `stable`; `cli` | [security.md](https://code.claude.com/docs/en/security.md) | `2026-07-25T14:42:21Z`; `15a3393a1af5d6e640beac172e0831058c4150ed29a0f2911e0137415980daaa`; network approval；separate WebFetch context；workspace/MCP trust；credential storage | 官方通用安全边界和 Web tool/trust qualifier | supports `FACT-claude-code-022`; qualifies all security behavior（未 runtime） | 当前安全文档不是 2.1.212 immutable spec；未验证 permission、credential 或 trust enforcement。 |

## 5. 证据覆盖与风险

| Evidence type | records | 已覆盖 | 仍不能证明 |
| --- | ---: | --- | --- |
| `META` | 1 | stable artifact manifest identity | 用户行为、runtime capability |
| `RUNTIME` | 1 | stable binary 版本、可启动、hash | 认证后 Agent/tool/session 行为 |
| `HELP` | 3 | stable CLI 与子命令公开 Surface | normal path、entitlement、持久化 |
| `BINARY` | 1 | implementation-surface 字符串锚点 | 可用、完整、默认开启 |
| `CHANGELOG` | 2 | stable 与 latest 的版本化声明 | 全平台边界、反例、runtime |
| `DOC` | 24 | 官方当前公开契约 | 未标版本页面对 2.1.212 的精确适用性、runtime |
| **合计** | **32** | 发行身份、12 个一级域的 breadth-first 证据 | 认证 runtime 与高影响安全/持久化/多 Agent 验证 |

### 5.1 Evidence conflicts / qualifications

- 没有观察到直接 `Docs-runtime` 或 `Release-runtime` 冲突，因为除 `--version` 外未做
  认证 runtime probe。
- 存在明确 `Cross-version` 限定：当前 checkpointing、subagent、permissions、
  settings 等页面包含晚于 `2.1.212` 的条目；事实画像只保留由 frozen help、
  stable changelog 或明确最低版本锚定的 stable 部分。
- `2.1.220` 只保留 immutable changelog 中明确出现的四条 delta；latest binary
  未下载、未运行。
- `Action v1`、Agent SDK package、IDE/web/mobile client 都是独立版本 Surface；
  没有把它们的当前文档版本当作 CLI `2.1.212` runtime。
- 所有未认证、写配置、安装扩展、连接 MCP、运行 cloud review、CI 或 telemetry 的
  路径保持 `Not tested`；没有由 search miss 得出 `Not supported`。
