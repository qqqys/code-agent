# Codex：阶段 1B Evidence Ledger

> 产品：Codex  
> 冻结 CLI：`0.145.0` / npm `latest` / Darwin arm64  
> 未版本化一方资料：精确记录为 `unversioned-docs@2026-07-25`  
> 对应事实画像：[Codex Candidate Facts](../facts/codex.md)

## 1. 记录约定

本账本共 `34` 条 Evidence Record：

- `META`：1
- `SOURCE`：1
- `RUNTIME`：1
- `HELP`：5
- `DOC`：26

所有 `HELP` 与 `RUNTIME` 均直接调用冻结 Darwin arm64 binary。没有登录、模型请求、
网络访问、远端任务、外部系统写入、extension 安装或源代码修改。binary 在每次
help/version 启动时尝试创建 PATH alias，但环境返回
`Operation not permitted (os error 1)`；因此记录为“写入尝试被拒绝”，而不是笼统写
“无副作用”。

### 1.1 Environment records

| Env ID | platform | authentication | entitlement | region | provider | model | configuration / flags |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ENV-codex-LOCAL-001` | Darwin arm64；直接执行 npm platform artifact 中的 native binary；cwd 为研究 checkout | 未登录；未读取或写入 credential | 未检查 | not-applicable | not-applicable | not-applicable | 未传入用户配置覆盖；只运行 `--version` / `--help` |
| `ENV-codex-DOC-001` | not-applicable | 未登录；公开网页 | 未检查 | not-applicable | not-applicable | not-applicable | 官方网页在 `2026-07-25` 的可变快照 |
| `ENV-codex-CI-001` | not-applicable | 未运行 workflow | 未检查 | not-applicable | not-applicable | not-applicable | 仅官方 GitHub Action 文档 |

### 1.2 Runtime probe 默认值

非 `HELP` / `RUNTIME` 证据统一为：

```yaml
runtime_probe:
  applicability: not-applicable
  preconditions: []
  procedure: []
  stdout: not-applicable
  stderr: not-applicable
  exit_code: not-applicable
  side_effects: []
  cleanup: []
  started_at: not-applicable
  finished_at: not-applicable
```

## 2. Artifact、Source 与 Runtime

| Evidence ID | Type | 版本 / channel | Surface | source_url_or_path | captured_at | Env | artifact_hash_or_excerpt / observation | 可证明范围 | Discovery links | limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `EVD-codex-META-001` | `META` | `0.145.0` / latest | cli | `/private/tmp/codex-phase0.XNx1jk/` | `2026-07-25T14:36:57Z` | `ENV-codex-LOCAL-001` | wrapper tgz SHA-256 `416399796cac371d1a033b17f34b08ba9b25c8f298a5b9d00e10f72c3b128c8d`；Darwin arm64 tgz `53ff1055d35ca3dc964e8bedc2431e46c00608f7c8e145b222122648a7a4e3e8`；binary `1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590`；release commit `25af12f7e61572b0bc18ddb1008be543b91519b0` | 本次读取的 wrapper、platform artifact、binary、release tag/commit 和版本身份 | supports `FACT-codex-001`, `FACT-codex-003` | 本地 hash 不证明签名、provenance 或其他平台 artifact；release tag URL 由冻结范围文档保存。 |
| `EVD-codex-SOURCE-001` | `SOURCE` | `0.145.0` / latest | cli | `/private/tmp/codex-phase0.XNx1jk/codex-0.145.0.tgz`：`package/package.json`, `package/bin/codex.js`, `package/README.md` | `2026-07-25T14:36:57Z` | `ENV-codex-LOCAL-001` | package 声明 Node `>=16`、六个 OS/arch optional dependencies；launcher 映射 target triple，继承 stdio/env/cwd，转发三种 signal 并镜像退出原因；README 列 native/npm/Homebrew/release、IDE/app/cloud 入口。 | wrapper→payload 解析、代理数据流、发行 README 暴露的安装与一方 Surface | supports `FACT-codex-001`, `FACT-codex-002`, `FACT-codex-009` | wrapper 数据流未经异常平台、缺包、复杂 argv 和 signal runtime probe；README 属随包文档，不等于全部 Surface runtime。 |
| `EVD-codex-RUNTIME-001` | `RUNTIME` | `0.145.0` / latest | cli | `/private/tmp/codex-phase0.XNx1jk/unpacked/package/vendor/aarch64-apple-darwin/bin/codex` | `2026-07-25T14:50:57Z` | `ENV-codex-LOCAL-001` | stdout：`codex-cli 0.145.0`；stderr：`WARNING: proceeding, even though we could not create PATH aliases: Operation not permitted (os error 1)` | 该 binary 在此 Darwin arm64 环境可启动并报告 `0.145.0`，退出成功 | supports `FACT-codex-003` | 只验证 version 路径。PATH alias 写入尝试被拒绝；未观察到 repo/config/auth/network 变化。 |

### 2.1 `EVD-codex-RUNTIME-001` probe

```yaml
runtime_probe:
  applicability: applicable
  preconditions:
    - Darwin arm64
    - frozen binary SHA-256 1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590
  procedure:
    - /private/tmp/codex-phase0.XNx1jk/unpacked/package/vendor/aarch64-apple-darwin/bin/codex --version
  stdout: codex-cli 0.145.0
  stderr: "WARNING: proceeding, even though we could not create PATH aliases: Operation not permitted (os error 1)"
  exit_code: 0
  side_effects:
    - attempted PATH-alias creation was rejected by the environment
    - no repository, config, authentication, or network change was observed
  cleanup: []
  started_at: 2026-07-25T14:50:56Z
  finished_at: 2026-07-25T14:50:57Z
```

## 3. Frozen binary Help evidence

| Evidence ID | Type | 版本 / channel | Surface | source_url_or_path | captured_at | Env | exact observation | 可证明范围 | Discovery links | limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `EVD-codex-HELP-001` | `HELP` | `0.145.0` / latest | cli | frozen binary `codex --help` | `2026-07-25T14:50:57Z` | `ENV-codex-LOCAL-001` | 顶层 command inventory；global model/profile/config/sandbox/approval/image/search/workdir/add-dir/remote/no-alt-screen flags；experimental 标签 | 精确 CLI 公开入口、参数名和 help 生命周期标签 | supports `FACT-codex-004`, `FACT-codex-006`, `FACT-codex-007`, `FACT-codex-009`, `FACT-codex-011`, `FACT-codex-016`, `FACT-codex-021`, `FACT-codex-025`, `FACT-codex-028`, `FACT-codex-029`, `FACT-codex-052`, `FACT-codex-057`, `FACT-codex-059`; supports `ALIAS-codex-001`, `ALIAS-codex-004`, `ALIAS-codex-005` | 公开入口存在不证明登录、entitlement、默认状态或正常路径成功。 |
| `EVD-codex-HELP-002` | `HELP` | `0.145.0` / latest | cli | frozen binary `exec/review/session/apply/sandbox --help` | `2026-07-25T14:36:57Z` | `ENV-codex-LOCAL-001` | `exec` 的 stdin/JSONL/schema/ephemeral/config flags；review scope；resume/fork/archive/delete/unarchive；apply；sandbox helper | headless、review、session、cloud diff handoff 和 sandbox helper 的公开命令/参数面 | supports `FACT-codex-011`, `FACT-codex-014`, `FACT-codex-016`, `FACT-codex-017`, `FACT-codex-022`, `FACT-codex-023`, `FACT-codex-024`, `FACT-codex-042`, `FACT-codex-045`; supports `ALIAS-codex-002`, `ALIAS-codex-003`, `ALIAS-codex-007`, `ALIAS-codex-008` | 未创建 session、运行 review、应用 diff、执行 sandbox command 或发起模型请求。 |
| `EVD-codex-HELP-003` | `HELP` | `0.145.0` / latest | cli | frozen binary `login/mcp/plugin/mcp-server --help` | `2026-07-25T14:36:57Z` | `ENV-codex-LOCAL-001` | login methods/status；MCP lifecycle/auth/transports；plugin/marketplace lifecycle/source flags；MCP stdio server | 认证与扩展 CLI 的公开命令和参数面 | supports `FACT-codex-005`, `FACT-codex-030`, `FACT-codex-031`, `FACT-codex-032`, `FACT-codex-048`; supports `ALIAS-codex-009`, `ALIAS-codex-010`, `ALIAS-codex-011`, `ALIAS-codex-013` | 未认证、安装、写配置、建立 MCP 连接或启动 server。 |
| `EVD-codex-HELP-004` | `HELP` | `0.145.0` / latest | cli | frozen binary `app-server/remote-control/cloud/exec-server --help` | `2026-07-25T14:36:57Z` | `ENV-codex-LOCAL-001` | app-server transports/schema/daemon/proxy；remote-control lifecycle；cloud exec/status/list/apply/diff；exec-server transport | experimental daemon、remote-control、cloud 和 exec-server 的公开命令/参数面 | supports `FACT-codex-010`, `FACT-codex-023`, `FACT-codex-041`, `FACT-codex-047`, `FACT-codex-050`; supports `ALIAS-codex-012`, `ALIAS-codex-014`, `ALIAS-codex-015` | 未启动 daemon/server、连接 transport、登录 cloud、提交任务、查询 task 或应用 diff。 |
| `EVD-codex-HELP-005` | `HELP` | `0.145.0` / latest | cli | frozen binary `doctor/debug/features --help` | `2026-07-25T14:36:57Z` | `ENV-codex-LOCAL-001` | doctor JSON/summary/all/redacted report；debug models/prompt-input/app-server；features list/enable/disable | 诊断、debug 和 feature control 的公开命令/参数面 | supports `FACT-codex-056`, `FACT-codex-059`; supports `ALIAS-codex-024`, `ALIAS-codex-025` | 未读取完整诊断、model catalog 或 feature list；未持久修改 feature。 |

### 3.1 Help probe commands and outcomes

所有下列命令使用同一 frozen binary，逐条退出 `0` 并输出对应 usage/help。每次 stderr
均出现同一条 PATH-alias warning。除被拒绝的 alias 创建尝试外，未观察到
repository/config/auth/network 改变；无需 cleanup。

| Evidence ID | Exact commands | Exit | Key output |
| --- | --- | ---: | --- |
| `EVD-codex-HELP-001` | `codex --help` | `0` | `exec`, `review`, `login`, `mcp`, `plugin`, `mcp-server`, `app-server [experimental]`, `remote-control [experimental]`, `app`, `doctor`, `sandbox`, session commands, `cloud [EXPERIMENTAL]`, `exec-server [EXPERIMENTAL]`, `features`; global flags listed above |
| `EVD-codex-HELP-002` | `codex exec --help`; `codex exec resume --help`; `codex exec review --help`; `codex review --help`; `codex apply --help`; `codex resume --help`; `codex archive --help`; `codex delete --help`; `codex unarchive --help`; `codex fork --help`; `codex sandbox --help`; `codex sandbox macos --help`; `codex sandbox linux --help` | all `0` | `exec` prompt-or-stdin, JSONL/schema/ephemeral; review revision scopes; picker/last/ID session controls; local diff apply; platform sandbox helpers |
| `EVD-codex-HELP-003` | `codex login --help`; `codex login status --help`; `codex mcp --help`; `codex mcp list --help`; `codex mcp get --help`; `codex mcp add --help`; `codex mcp remove --help`; `codex mcp login --help`; `codex mcp logout --help`; `codex plugin --help`; `codex plugin add --help`; `codex plugin list --help`; `codex plugin remove --help`; `codex plugin marketplace --help`; `codex plugin marketplace add --help`; `codex plugin marketplace list --help`; `codex plugin marketplace upgrade --help`; `codex plugin marketplace remove --help`; `codex mcp-server --help` | all `0` | ChatGPT/device/key/token auth surface; stdio/HTTP MCP config and OAuth; local/Git plugin source and marketplace lifecycle; stdio MCP server |
| `EVD-codex-HELP-004` | `codex app-server --help`; `codex app-server generate-json-schema --help`; `codex app-server generate-ts --help`; `codex app-server daemon --help`; daemon `bootstrap/start/restart/enable-remote-control/disable-remote-control/stop/version --help`; `codex app-server proxy --help`; `codex remote-control --help`; remote-control `start/stop/pair --help`; `codex cloud --help`; cloud `exec/status/list/apply/diff --help`; `codex exec-server --help` | all `0` | stdio/socket/WebSocket app-server, schema and daemon controls; remote pairing; cloud task/attempt operations; standalone exec-server |
| `EVD-codex-HELP-005` | `codex doctor --help`; `codex debug --help`; `codex debug models --help`; `codex debug prompt-input --help`; `codex debug app-server --help`; `codex debug app-server send-message-v2 --help`; `codex features --help`; `codex features list --help`; `codex features enable --help`; `codex features disable --help` | all `0` | diagnosis/report options, bundled-model and app-server debug surfaces, persistent feature controls |

## 4. Official document evidence

所有 `DOC` 记录均为一方网页，但网页持续更新、没有把 desktop/IDE/cloud build 或每项
行为绑定到 CLI `0.145.0`。因此：

- 可以确认“采集时官方公开了该 Surface/配置/承诺”。
- 不能单独确认 frozen CLI runtime 已实现、默认启用或满足完整行为契约。
- 每条以稳定的 `developers.openai.com` URL 记录；采集时页面重定向到
  `learn.chatgpt.com`。

| Evidence ID | Type | 版本 / channel | Surface | source_url_or_path | captured_at | Env | bounded observation | 可证明范围 | Discovery links | limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `EVD-codex-DOC-001` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [CLI](https://developers.openai.com/codex/cli) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | 官方描述 CLI 在本地仓库中检查、编辑、运行代码，并给出 native/npm/Homebrew 安装与 interactive/headless 入口。 | 当前 CLI 产品承诺和安装入口 | supports `FACT-codex-001`, `FACT-codex-006`, `FACT-codex-020` | 页面未绑定 `0.145.0`；具体工具行为未复现。 |
| `EVD-codex-DOC-002` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Authentication](https://developers.openai.com/codex/auth) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | 本地 desktop/CLI/IDE 可使用 ChatGPT 或 API key；cloud 要求 ChatGPT；CLI API key 通过 stdin。 | 当前官方跨 Surface 认证规则 | supports `FACT-codex-005` | 未登录；workspace/RBAC/data policy 与 credential storage 未测。 |
| `EVD-codex-DOC-003` | `DOC` | `unversioned-docs@2026-07-25` / latest | ide | [IDE](https://developers.openai.com/codex/ide) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | IDE 可从 editor 发起任务、共享打开文件/选区上下文并审阅 edits。 | 当前 IDE 入口与 context/review 承诺 | supports `FACT-codex-008` | IDE build、同步时机和错误未固定。 |
| `EVD-codex-DOC-004` | `DOC` | `unversioned-docs@2026-07-25` / latest | web-cloud | [Codex cloud](https://developers.openai.com/codex/cloud) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | cloud task 在隔离环境运行，可配置 repo/environment/tools/env/secrets，支持 parallel/background，完成后查看 summary/diff、follow-up 和 PR。 | 当前 cloud task、环境、并发、结果和 PR handoff 承诺 | supports `FACT-codex-010`, `FACT-codex-041`, `FACT-codex-044` | entitlement、region、task lifecycle、隔离和 GitHub 写入未测。 |
| `EVD-codex-DOC-006` | `DOC` | `unversioned-docs@2026-07-25` / latest | desktop | [Slash commands](https://developers.openai.com/codex/reference/slash-commands) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | command table 包含 `/compact`, `/goal`, `/plan`, `/status`, `/memories`, `/review`, `/worktree` 等；goal 有 desktop pause/resume/edit/clear 控件。 | 当前 desktop composer command/UI 承诺 | supports `FACT-codex-012`, `FACT-codex-013`, `FACT-codex-018`, `FACT-codex-055`; supports `ALIAS-codex-016`, `ALIAS-codex-017`, `ALIAS-codex-018` | 文档明确 command 随 environment/access 变化；未绑定 build。 |
| `EVD-codex-DOC-007` | `DOC` | `unversioned-docs@2026-07-25` / latest | desktop | [Long-running work](https://developers.openai.com/codex/long-running-work) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | `/goal` 用 outcome/constraints/verification 作为完成条件；同一 desktop/CLI/IDE chat 可 steering 或状态询问，desktop 可 pause/resume。 | 当前 Goal mode 的计划、连续性与控制承诺 | supports `FACT-codex-012`, `FACT-codex-013`; supports `ALIAS-codex-017` | 未测试状态持久、暂停语义或 CLI/IDE UI 差异。 |
| `EVD-codex-DOC-008` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Memories](https://developers.openai.com/codex/customization/memories) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | local memories 默认关闭，位于 `~/.codex/memories/`；chat 可独立控制 use/generate，IDE 复用 host store。 | 当前 local memory storage/config/control 承诺 | supports `FACT-codex-019`; supports `ALIAS-codex-019` | 生成、召回、redaction、删除和持久性未测。 |
| `EVD-codex-DOC-009` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [AGENTS.md](https://developers.openai.com/codex/agent-configuration/agents-md) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | 每 run 读取一次；global override/fallback；project root→cwd 逐层发现并由浅到深拼接；默认 32 KiB 上限。 | 当前指令文件发现与优先级规则 | supports `FACT-codex-015`; supports `ALIAS-codex-006` | 未以 `0.145.0` runtime 构造目录树验证。 |
| `EVD-codex-DOC-010` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Non-interactive mode](https://developers.openai.com/codex/noninteractive) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | `codex exec` 面向 scripts/CI；支持 stdin/ephemeral；进度 stderr、最终结果 stdout；默认 read-only 并建议最小权限。 | 当前 headless I/O、session 和安全承诺 | supports `FACT-codex-014`, `FACT-codex-045` | 未执行任务；结构化错误和退出码未复现。 |
| `EVD-codex-DOC-011` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Permission profiles](https://developers.openai.com/codex/permissions) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | filesystem read/write/deny 和 network enable/allow/deny 可配置；deny 优先；workspace roots 可作特殊路径。 | 当前 permission profile schema 与冲突规则 | supports `FACT-codex-025`, `FACT-codex-026` | 未验证 runtime enforcement、路径规范化或重定向。 |
| `EVD-codex-DOC-012` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Sandboxing](https://developers.openai.com/codex/sandboxing) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | 描述 read-only/workspace-write/danger-full-access 与 untrusted/on-request/never approval 的组合和风险边界。 | 当前 sandbox/approval 模式承诺 | supports `FACT-codex-025` | 未做越界或 bypass probe。 |
| `EVD-codex-DOC-013` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Rules](https://developers.openai.com/codex/agent-configuration/rules) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | experimental prefix rules 控制 sandbox 外 command；project rule 需 trust，user approval 可持久化，managed rule 可更严格。 | 当前 command-rule Surface 与 scope | supports `FACT-codex-027` | 未执行 matcher、冲突和拒绝。 |
| `EVD-codex-DOC-014` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Hooks](https://developers.openai.com/codex/hooks) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | 列出 tool/permission/compact/prompt/subagent/session/stop events；当前只有 command handler；project hook 需 trust；多个 command hook 可并行。 | 当前 hook event、handler、trust 与并发合同 | supports `FACT-codex-028`, `FACT-codex-034` | async 配置尚不支持；顺序、阻断、timeout 和失败隔离未测。 |
| `EVD-codex-DOC-015` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [MCP](https://developers.openai.com/codex/extend/mcp) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | local clients 共享 MCP config；支持 stdio、streamable HTTP、bearer/OAuth，以及 user/project trusted 配置。 | 当前 MCP client transport/auth/config 承诺 | supports `FACT-codex-030` | 未连接 server 或验证 config sharing。 |
| `EVD-codex-DOC-016` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Plugins](https://developers.openai.com/codex/build-plugins) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | plugin 是 skills、MCP servers 或两者的 installable package，并可经 universal directory/local marketplace 分发。 | 当前 plugin packaging/discovery 承诺 | supports `FACT-codex-032` | 生命周期 enforcement、版本和供应链未测。 |
| `EVD-codex-DOC-017` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Skills](https://developers.openai.com/codex/build-skills) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | skill 可包含 task instructions、resources、scripts，采用 open skills 结构并可由 plugin 分发。 | 当前 skill package 构成与分发方式 | supports `FACT-codex-033` | 发现、触发、资源读取和 dependency 行为未测。 |
| `EVD-codex-DOC-018` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Subagents](https://developers.openai.com/codex/agent-configuration/subagents) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | specialized agents 可并行并由 main 汇总；current releases 默认启用；local custom agents 可设 instructions/model/tools；CLI `/agent` 查看 thread；继承 sandbox。 | 当前 subagent availability、角色、delegation、UI、inheritance 与 aggregation 承诺 | supports `FACT-codex-035`, `FACT-codex-036`, `FACT-codex-037`, `FACT-codex-038`, `FACT-codex-040`; supports `ALIAS-codex-020`, `ALIAS-codex-021` | 未绑定 `0.145.0`；并发、继承、控制和失败未运行。 |
| `EVD-codex-DOC-019` | `DOC` | `unversioned-docs@2026-07-25` / latest | desktop | [Worktrees](https://developers.openai.com/codex/environments/git-worktrees) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | desktop-only worktrees 位于 Codex home、使用 detached HEAD，支持 `.worktreeinclude`、snapshot cleanup 和 Local/Worktree handoff。 | 当前 desktop worktree lifecycle/隔离承诺 | supports `FACT-codex-039`; supports `ALIAS-codex-022` | 未创建、切换、清理或恢复 worktree。 |
| `EVD-codex-DOC-020` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Code review](https://developers.openai.com/codex/code-review) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | `/review`/review mode 使用 dedicated reviewer，可审未提交或 base diff，返回 prioritized actionable findings 而不改工作树。 | 当前 local review 合同 | supports `FACT-codex-022`, `FACT-codex-042` | 未运行 review；finding 正确性与只读性未复现。 |
| `EVD-codex-DOC-021` | `DOC` | `unversioned-docs@2026-07-25` / latest | web-cloud | [GitHub review integration](https://developers.openai.com/codex/integrations/github) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | PR comment `@codex review` 可触发 review，也可开启 automatic reviews；读取 diff/AGENTS guidance 并发布 GitHub review。 | 当前 GitHub PR review trigger/output 承诺 | supports `FACT-codex-043` | 未认证或写 GitHub；自动触发、幂等和 revision 未测。 |
| `EVD-codex-DOC-022` | `DOC` | `unversioned-docs@2026-07-25` / latest | ci | [GitHub Action](https://developers.openai.com/codex/github-action) | `2026-07-25T14:36:57Z` | `ENV-codex-CI-001` | `openai/codex-action@v1` 在 workflow 安装 CLI、可用 API proxy，并通过 `codex exec` 执行 patch/review。 | 当前一方 CI integration contract | supports `FACT-codex-049` | 未运行 workflow；凭据、权限、状态和 failure 未测。 |
| `EVD-codex-DOC-023` | `DOC` | `unversioned-docs@2026-07-25` / latest | sdk-daemon | [Codex SDK](https://developers.openai.com/codex/codex-sdk) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | TypeScript SDK 提供 thread start/run/resume；Python 3.10+ SDK 控制本地 app-server JSON-RPC 并使用 pinned CLI runtime。 | 当前 SDK 语言、thread 与 runtime 关系 | supports `FACT-codex-046` | 未安装；准确 package version、事件、取消和异常未测。 |
| `EVD-codex-DOC-024` | `DOC` | `unversioned-docs@2026-07-25` / latest | sdk-daemon | [App Server](https://developers.openai.com/codex/app-server) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | rich-client JSON-RPC；stdio JSONL stable/default，WebSocket experimental；schema generation、auth/history/approvals/events、health endpoints 与有界 ingress `-32001`。 | 当前 app-server protocol、transport、health 和 overload contract | supports `FACT-codex-047`, `FACT-codex-060` | 未启动 server；协议、schema、auth、health 和 overload 未复现。 |
| `EVD-codex-DOC-025` | `DOC` | `unversioned-docs@2026-07-25` / latest | sdk-daemon | [MCP Server](https://developers.openai.com/codex/mcp-server) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | `codex mcp-server` 通过 stdio 暴露 `codex` 和 `codex-reply`，用于新建和继续 session，可用于 Agents SDK orchestration。 | 当前 MCP server tool contract | supports `FACT-codex-031`, `FACT-codex-048` | 未启动、列举或调用工具。 |
| `EVD-codex-DOC-026` | `DOC` | `unversioned-docs@2026-07-25` / latest | desktop | [Scheduled tasks](https://developers.openai.com/codex/automations) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | recurring/background tasks 有 active/paused/completed/recent runs；可新建 chat 或复用既有 chat；本地 Git 项目可选 local/worktree。 | 当前 schedule、monitor 和 execution destination 承诺 | supports `FACT-codex-051`; supports `ALIAS-codex-023` | 未创建 task；触发可靠性、权限、离线和 cleanup 未测。 |
| `EVD-codex-DOC-027` | `DOC` | `unversioned-docs@2026-07-25` / latest | cli | [Advanced config](https://developers.openai.com/codex/config-advanced) | `2026-07-25T14:36:57Z` | `ENV-codex-DOC-001` | custom providers/Bedrock/OSS/Azure；model effort；profile/CLI overrides；trusted project layers；OTel opt-in、exporter 和 prompt redaction。 | 当前 provider/model/profile/config/telemetry schema 与公开语义 | supports `FACT-codex-052`, `FACT-codex-053`, `FACT-codex-054`, `FACT-codex-057`, `FACT-codex-058`; supports `ALIAS-codex-026` | 可变网页未绑定 `0.145.0`；未验证任何请求、layer conflict 或 telemetry export。 |

## 5. Evidence limits and unresolved probes

### 5.1 已明确的证据边界

- `HELP` 是 frozen binary 的命令发现证据，不证明成功路径。
- `DOC` 是 `2026-07-25` 的官方承诺快照，不自动等于 CLI `0.145.0` runtime。
- `SOURCE` 只分析 npm launcher；不能把 wrapper 当作 native agent 实现。
- `RUNTIME` 只复现 `--version`，没有认证或模型调用。
- 没有用文档/源码搜索无结果生成负向 Candidate Fact。

### 5.2 需要阶段 1C 的最小 runtime probes

| Probe area | 安全前置 | 最小可证伪结果 |
| --- | --- | --- |
| Headless I/O | 临时空仓库；无外部写；测试账号/预算 | stdin/argv、JSONL、schema、stdout/stderr、exit status 与取消可逐项核对 |
| Permission enforcement | 临时 workspace；测试文件、loopback 与 deny domain | allow/deny/ask、路径规范化、网络和副作用是否与有效配置一致 |
| Session/context | 临时 `CODEX_HOME`；无真实历史 | resume/last/fork/ephemeral/compact 的 ID、持久文件与上下文变化可核对 |
| Extensions | 本地 fixture MCP/plugin/skill/hook；无真实 credential | discovery、调用、trust、权限、错误、timeout 和 cleanup 可区分 |
| Multi-agent | read-heavy fixture；独立 worktrees | 并发时间线、角色/工具/权限继承、结果聚合、steering/cancel/failure 可核对 |
| App/MCP server | Unix socket/stdio fixture；bounded client | initialize/schema/events/health/reconnect/backpressure/exit 可复现 |
| Cloud/GitHub/CI | 专用测试 repo、最小权限 credential、明确 cleanup | task/attempt/revision/PR/comment/check 的身份、幂等、拒绝和清理可核对 |
| Provider/telemetry | mock endpoint 与本地 OTel collector | model/effort/provider route、错误、usage 和脱敏 export 可核对 |
