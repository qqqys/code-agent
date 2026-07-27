# Claude Code：阶段 1B 事实画像

> 产品：Claude Code  
> 主基线：`2.1.212` / `stable`  
> 增量切片：`2.1.220` / `latest`  
> 冻结 Registry：Revision 1（548 records），`2026-07-25T14:08:12Z`  
> 最后检查：`2026-07-25T14:42:21Z`

## 1. 记录口径

本文是 breadth-first 的 **Candidate Fact** 集合，不是阶段 1C 的 Claim
Record。它只记录 Claude Code 单产品事实和候选 Atomic ID：

- 不填写 `support_state`，不创建 Comparison、Gap 或价值判断。
- 一条 Candidate Fact 可以发现阶段映射多个 Atomic ID；转 Claim 时必须按一个
  Atomic ID、一个版本、一个 channel、一个 surface、一个平台切片拆开。
- `Confirmed` 可以确认“冻结发行物公开了该 Surface”或“官方资料公开承诺了该
  行为”；只有 `runtime=Reproduced` 才表示在所列环境实际复现。
- 当前官方网页是可变证据。没有 release note、冻结 help/runtime 或明确
  `min-version` 锚点时，表内会写“精确 stable 适用性待证”，不会把当前网页静默
  回填到 `2.1.212`。
- 字符串存在只作为 implementation-surface 线索，不证明功能可用或默认开启。
- 搜索未命中不构成负向结论；未覆盖项统一标成 `unknown` 或 `not-checked`。

### 1.1 切片缩写

| 缩写 | 完整切片 |
| --- | --- |
| `S-CLI` | `Claude Code 2.1.212` / `stable` / `cli` / macOS 26.5.1 (25F80), arm64, zsh 5.9, host；TTY 依事实另记 |
| `S-CLI-DOC` | `Claude Code 2.1.212` / `stable` / `cli` / 文档覆盖的平台；精确版本适用性按每行限制 |
| `C-CLI` | `current-docs@2026-07-25` / `latest` / `cli` / 文档覆盖的平台；精确 `2.1.212` 适用性未证明 |
| `C-SDK` | `current-docs@2026-07-25` / `latest` / `sdk-daemon` / 文档覆盖的平台；Python/TypeScript SDK package version 未冻结 |
| `C-CI` | `action-v1-docs@2026-07-25` / `latest` / `ci` / GitHub Actions；Action commit 与其安装的 Claude Code CLI 版本均未冻结 |
| `L-CLI` | `Claude Code 2.1.220` / `latest` / `cli` / 平台 not-applicable（版本化 changelog 事实，未下载运行） |

### 1.2 行为契约投影

事实表的 `contract` 使用 Registry 中的 `ENTRY / INPUT / AVAIL / SIDEFX /
STATE / PERSIST / OUTPUT / MODES / CONC / FAIL / EXT / SEC / OBS`。每个出现的
字段均等价于对应叶的 `status=recorded` 和紧随其后的值；显式写 `unknown` 等价于
`status=unknown`。**每行未出现的所有行为契约叶统一展开为
`status=not-checked`、空值**，而不是空缺、否定或 `confirmed-none`。

## 2. Stable 主基线与 current-docs Candidate Facts

### `CAP-01` 发布与产品边界

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-001` | `CAP-01.01-A03`, `CAP-01.06-A01` | `S-CLI` | 冻结 Darwin arm64 native binary 可直接执行；`--version` 输出 `2.1.212 (Claude Code)`，本地 SHA-256 与官方 manifest 的 Darwin arm64 digest 一致。`ENTRY=binary --version`; `INPUT=none`; `AVAIL=Darwin arm64 artifact`; `SIDEFX=none observed`; `OUTPUT=version+digest`; `SEC=SHA-256 integrity`; `OBS=exit 0` | `EVD-claude-code-META-001`, `EVD-claude-code-RUNTIME-001`；epistemic `Confirmed`；docs `Documented`；runtime `Reproduced`；lifecycle `stable`；confidence `High` | 只复现发行身份和可启动性；未由此推断认证后 Agent 行为。 |
| `FACT-claude-code-002` | `CAP-01.01-A01`, `CAP-01.01-A02` | `S-CLI-DOC` | 官方 setup 资料列出 native installer，并列 Homebrew、WinGet 和 npm 安装路径；冻结 help 还公开 `claude install [target]` native installer。`ENTRY=official installer/package manager/claude install`; `INPUT=install target`; `AVAIL=platform matrix in docs`; `SIDEFX=installs launcher+version files`; `FAIL=documented troubleshooting`; `OBS=help surface` | `EVD-claude-code-DOC-001`, `EVD-claude-code-HELP-001`；`Confirmed`（公开承诺/命令面）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未在干净主机执行安装；各包管理器的解析、失败回滚和残留状态未复现。 |
| `FACT-claude-code-003` | `CAP-01.03-A01`, `CAP-01.03-A02`, `CAP-01.04-A01` | `S-CLI` | `claude install` 接受 `stable`、`latest` 或精确版本；官方资料把 stable 描述为延迟约一周并跳过重大回归的通道，也给出 native auto-update channel 配置。`ENTRY=claude install/update`; `INPUT=stable/latest/exact version`; `AVAIL=native install`; `STATE=selected channel`; `PERSIST=installed version/channel setting`; `OUTPUT=help/update result`; `FAIL=unknown` | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-001`；`Confirmed`（入口/承诺）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 没有执行安装、升级、自动更新或精确版本重复安装；回退语义未检查。 |
| `FACT-claude-code-004` | `CAP-01.11-A01` | `S-CLI` | 冻结 binary 公开 `claude auth login/logout/status`；login 入口面向 Anthropic account。`ENTRY=claude auth login,logout,status`; `INPUT=login options`; `AVAIL=account gate`; `STATE=active identity`; `PERSIST=credential store unknown`; `OUTPUT=status`; `FAIL=unknown`; `SEC=credential boundary` | `EVD-claude-code-HELP-002`；`Confirmed`（命令面）；docs `Documented`；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 为避免改变真实凭据，未登录、退出或检查用户身份；身份切换、组织选择和凭据清理未复现。 |

### `CAP-02` 交互与客户端形态

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-005` | `CAP-02.01-A01`, `CAP-02.02-A02`, `CAP-02.02-A03` | `S-CLI` | 顶层 help 声明默认启动 interactive session；官方 interactive-mode 资料记录 slash command 与以 `!` 开头的 shell mode，后者把命令输出加入 session。`ENTRY=claude,/command,! command`; `INPUT=multi-turn text/slash/shell`; `STATE=session`; `OUTPUT=interactive transcript`; `MODES=interactive TTY`; `FAIL=unknown` | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-003`；`Confirmed`（入口/文档语义）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未进入认证 TUI；多轮渲染、shell 副作用和 transcript 结果未复现。 |
| `FACT-claude-code-006` | `CAP-02.05-A01`, `CAP-02.05-A03`, `CAP-02.10-A06` | `S-CLI` | 官方快捷键表记录 `Ctrl+C`/`Esc` 控制、Vim mode；`vimInsertModeRemaps` 标注最低 `v2.1.208`。冻结 help 公开 `--ax-screen-reader`，描述为扁平文本且无装饰边框/动画。`ENTRY=keyboard shortcuts,--ax-screen-reader`; `INPUT=key events`; `AVAIL=TTY, vim remap >=2.1.208`; `OUTPUT=screen-reader rendering`; `MODES=interactive`; `OBS=help+docs` | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-003`；`Confirmed`（stable 版本锚定 Surface）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未使用 VoiceOver/终端组合复现；完整键位、焦点顺序和可访问性覆盖未知。 |
| `FACT-claude-code-007` | `CAP-02.06-A01` | `S-CLI` | 冻结 CLI 的 `--ide` 在启动时检测并连接唯一有效 IDE；官方平台资料分别列出 VS Code 与 JetBrains Surface。`ENTRY=claude --ide`; `INPUT=IDE discovery`; `AVAIL=exactly one valid IDE for auto-connect`; `STATE=local session connection`; `OUTPUT=connection result unknown`; `MODES=interactive`; `FAIL=unknown` | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-002`；`Confirmed`（CLI 入口）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未启动 IDE；选区/诊断同步、多个 IDE 时的选择和跨 Surface session 接续未复现。 |
| `FACT-claude-code-008` | `CAP-02.08-A06`, `CAP-02.09-A04` | `S-CLI` | `--remote-control [name]` 启动 Remote Control host；官方资料说明 Agent、文件和命令执行仍在本机，浏览器或移动端接入该 session；需要 claude.ai subscription，Team/Enterprise 还受组织开关。`ENTRY=claude --remote-control`; `INPUT=optional name+remote client`; `AVAIL=login+subscription+org gate`; `STATE=local session host`; `PERSIST=connection state unknown`; `MODES=interactive+remote`; `FAIL=login/entitlement error`; `SEC=local workspace remains host`; `OBS=CLI error strings/docs` | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-018`, `EVD-claude-code-BINARY-001`；`Confirmed`（入口/公开门禁）；runtime `Not tested`；lifecycle `research preview`；confidence `Medium` | 未登录或建立远端连接；重连、接管、权限提示同步及跨设备恢复是 unknown。 |

### `CAP-03` Agent 执行循环

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-009` | `CAP-03.02-A01`, `CAP-03.02-A03` | `S-CLI` | 冻结 CLI 接受 `--permission-mode plan`；官方权限资料把 Plan 描述为读取/探索而不编辑源文件，2.1.212 changelog 修复了 plan mode 对修改文件 Bash 的审批绕过。`ENTRY=--permission-mode plan`; `INPUT=user task`; `AVAIL=mode choice`; `STATE=session permission mode`; `OUTPUT=plan/read-only exploration`; `MODES=interactive/non-interactive surface`; `FAIL=modifying action requires gate`; `SEC=permission enforcement` | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-010`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（版本化入口/修复）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 高影响权限行为未做拒绝路径 runtime probe；不据此确认所有工具在 plan mode 的完整边界。 |
| `FACT-claude-code-010` | `CAP-03.03-A01`, `CAP-03.03-A02`, `CAP-03.03-A03` | `S-CLI-DOC` | headless 官方资料声明 `-p` 使用与交互式 Claude Code 相同的 tools、agent loop 和 context management；tools reference 列出结构化工具输入。`ENTRY=interactive or claude -p`; `INPUT=prompt+tool schemas`; `STATE=session/turn`; `OUTPUT=tool calls+results+next action`; `MODES=interactive/non-interactive`; `EXT=built-in/MCP tools`; `OBS=transcript/event stream` | `EVD-claude-code-DOC-009`, `EVD-claude-code-DOC-004`, `EVD-claude-code-HELP-001`；`Confirmed`（官方承诺/入口）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未认证执行真实 Agent turn；工具选择质量、结果反馈顺序和终止条件未复现。 |
| `FACT-claude-code-011` | `CAP-03.08-A01` | `S-CLI-DOC` | 官方快捷键契约中 `Esc` 会停止当前 response 或 tool call，并保留已完成工作供用户重定向；`Ctrl+B` 可把 Bash/agent 转入后台。`ENTRY=Esc/Ctrl+B`; `INPUT=active turn`; `STATE=session`; `PERSIST=completed work retained in session`; `OUTPUT=interrupted/background status`; `MODES=interactive TTY`; `CONC=foreground to background`; `FAIL=unknown`; `OBS=TUI status` | `EVD-claude-code-DOC-003`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（文档契约）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未实测工具处于不可中断系统调用、网络失败或后台转换竞态时的行为。 |
| `FACT-claude-code-012` | `CAP-03.12-A02` | `S-CLI` | 2.1.212 新增每 session WebSearch 200 次默认上限和 subagent spawn 200 次默认上限，均可由专用环境变量调节。`ENTRY=session launch/tool loop`; `INPUT=environment limits`; `AVAIL=stable 2.1.212`; `STATE=session`; `CONC.limits=200 searches,200 spawns`; `FAIL=limit-exhausted behavior unknown`; `OBS=release note` | `EVD-claude-code-CHANGELOG-001`；`Confirmed`（版本化配置面）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未触发任一上限；预警、错误结构、边界值和环境变量非法值行为未测试。费用预算另见 `FACT-claude-code-047`。 |

### `CAP-04` 上下文、会话与记忆

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-013` | `CAP-04.01-A01`, `CAP-04.01-A02` | `S-CLI-DOC` | 官方 memory 资料定义 managed、user、project 和目录层级的 `CLAUDE.md` 指令来源；启动时发现并组合适用指令。冻结 `--bare` 明确可关闭 `CLAUDE.md` auto-discovery。`ENTRY=session startup/CLAUDE.md`; `INPUT=markdown instructions`; `AVAIL=normal mode; bare disables discovery`; `STATE=organization/user/project/directory`; `PERSIST=local files`; `OUTPUT=effective context`; `SEC=scope/managed source`; `OBS=/memory or context` | `EVD-claude-code-DOC-007`, `EVD-claude-code-HELP-001`；`Confirmed`（公开契约/disable control）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未构造多层冲突 fixture；精确拼接顺序、动态路径切换和 managed source 强制效果未复现。 |
| `FACT-claude-code-014` | `CAP-04.11-A01`, `CAP-04.12-A01`, `CAP-04.12-A02`, `CAP-04.12-A03` | `S-CLI-DOC` | 官方资料描述 per-repository auto memory，跨该 repo 的 worktree 共享；每次 session 自动载入前 200 行或 25 KiB，并可经 `/memory` 审阅、编辑或删除 Markdown。`ENTRY=auto memory,/memory`; `INPUT=agent learnings/user edits`; `AVAIL=normal mode; --bare disables auto-memory`; `STATE=project/repository`; `PERSIST=local, across sessions/worktrees`; `OUTPUT=loaded memory excerpt`; `FAIL=over-limit warning`; `SEC=local project memory` | `EVD-claude-code-DOC-007`, `EVD-claude-code-HELP-001`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（当前文档；stable 的 limit measurement 由 2.1.211/212 notes 邻接限定）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未让 2.1.212 写入/召回/删除 memory；跨机器不同步、冲突/过期处理和隐私许可未验证。 |
| `FACT-claude-code-015` | `CAP-04.09-A01`, `CAP-04.09-A02`, `CAP-04.10-A01`, `CAP-04.10-A02` | `S-CLI` | 冻结 CLI 公开 `--name`、`--session-id`、`--resume` 与 `--continue`；`--no-session-persistence` 明示关闭落盘后不可 resume。官方 sessions 资料描述本地 JSONL transcript 和按项目范围的 picker。`ENTRY=--name/--resume/--continue`; `INPUT=name/session id/search`; `AVAIL=persistence enabled`; `STATE=session`; `PERSIST=local transcript`; `OUTPUT=picker/resumed history`; `FAIL=missing/malformed session unknown`; `OBS=session id/name` | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-005`；`Confirmed`（入口/公开语义）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未创建或恢复真实 session；30 天清理、跨 worktree 项目范围、损坏 transcript 和模型恢复例外未复现。 |
| `FACT-claude-code-016` | `CAP-04.10-A03` | `S-CLI` | `--fork-session` 在 resume/continue 时创建新 session ID；2.1.212 的 `/fork` 把会话复制为独立后台 session。`ENTRY=--fork-session,/fork`; `INPUT=source session`; `STATE=branched session`; `PERSIST=local`; `OUTPUT=new independent session`; `SIDEFX=source session unchanged`; `FAIL=unknown`; `SEC=workspace`; `OBS=agent row/session id` | `EVD-claude-code-HELP-001`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（fork 版本锚定）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未实际创建分支 session；复制的上下文、文件状态、后台生命周期和失败语义未复现。 |
| `FACT-claude-code-057` | `CAP-04.10-A04` | `C-CLI` | 当前官方 checkpointing 资料描述 `/rewind` 对对话与由文件编辑工具产生的代码快照恢复，并明确 Bash、一般 subagent、外部文件改动不被恢复。`ENTRY=/rewind`; `INPUT=checkpoint`; `STATE=session+file snapshots`; `PERSIST=local`; `OUTPUT=restore result`; `SIDEFX=may restore files`; `FAIL=untracked side effects remain`; `SEC=workspace`; `OBS=rewind menu` | `EVD-claude-code-DOC-006`；`Confirmed`（current-docs 公开契约）；runtime `Not tested`；lifecycle `not-checked`；confidence `Low` | 高影响 restore 未执行；精确 `2.1.212` 适用性未证明，hardlink/symlink safeguard 也未归因于 stable。 |
| `FACT-claude-code-017` | `CAP-04.06-A01`, `CAP-04.07-A01`, `CAP-04.07-A02`, `CAP-04.07-A03` | `C-CLI` | `/context` 展示 context 使用构成；接近窗口时自动 compaction，`/compact` 可手动触发；压缩用结构化 summary 替代历史，并重新载入 system prompt、project-root `CLAUDE.md`、memory 和 MCP tools。`ENTRY=/context,/compact,automatic threshold`; `INPUT=current transcript`; `STATE=session`; `PERSIST=compacted transcript`; `OUTPUT=usage view/summary`; `FAIL=overflow behavior partly documented`; `EXT=skills/MCP reload rules`; `OBS=context view+message` | `EVD-claude-code-DOC-008`；`Confirmed`（current-docs 公开契约）；runtime `Not tested`；lifecycle `not-checked`；confidence `Low` | 文档未为整套语义给出精确最低版本；精确 `2.1.212` 适用性未证明，阈值、摘要保真和缓存连续性待测。 |
| `FACT-claude-code-036` | `CAP-04.10-A01` | `S-CLI` | `--from-pr [value]` 接受 PR number/URL，或打开带可选搜索词的 interactive picker，由用户选择并恢复与 PR 关联的 session。`ENTRY=claude --from-pr`; `INPUT=PR number/URL/search+user selection`; `AVAIL=git/GitHub/session linkage`; `STATE=local session+external PR reference`; `OUTPUT=picker/resumed session`; `FAIL=unknown`; `SEC=GitHub auth boundary`; `OBS=help` | `EVD-claude-code-HELP-001`；`Confirmed`（冻结命令面）；runtime `Not tested`；lifecycle `stable`；confidence `Low` | 仅证明显式选择后的 session 恢复入口；没有访问 PR，不能确认 PR 元数据读取、认证、fork repo 或失败语义，也不表示自动选择最近 session。 |

### `CAP-05` 代码与环境工具

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-018` | `CAP-05.01-A02` | `S-CLI-DOC` | 官方 tools reference 的 `Read` 接受绝对文件路径以及 offset/limit，可读取文本、图像和 PDF，并对大文件分页。2.1.212 changelog 还修复了 offset/limit 读取后 resume 再 edit 的误报。`ENTRY=Read`; `INPUT=absolute path,offset,limit`; `AVAIL=workspace permissions`; `OUTPUT=file slice/media content`; `FAIL=permission/type/size errors`; `SEC=read rules`; `OBS=tool result` | `EVD-claude-code-DOC-004`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（文档+stable fix）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未对编码、二进制、PDF 页、图像大小或 permission deny 做 runtime probe。 |
| `FACT-claude-code-019` | `CAP-05.02-A01`, `CAP-05.02-A02` | `C-CLI` | 官方工具表列出 `Glob` 的路径模式发现和 `Grep` 的内容正则搜索，并返回可继续读取的匹配。`ENTRY=Glob/Grep`; `INPUT=path pattern/regex`; `AVAIL=workspace permissions`; `OUTPUT=paths/matches`; `FAIL=invalid pattern/denial unknown`; `SEC=read scope`; `OBS=tool result` | `EVD-claude-code-DOC-004`；`Confirmed`（current-docs 公开契约）；runtime `Not tested`；lifecycle `not-checked`；confidence `Low` | 没有冻结 help/schema 或 runtime 双证据；精确 `2.1.212` 适用性、ignore 规则、排序、分页和超大仓库性能未测试。 |
| `FACT-claude-code-020` | `CAP-05.03-A01`, `CAP-05.03-A02`, `CAP-05.03-A03` | `S-CLI-DOC` | 官方工具表列出 `Write` 创建/覆写文件和 `Edit` 做精确字符串替换；Agent 可在一轮任务中组合多次编辑。`ENTRY=Write/Edit`; `INPUT=path+content or old/new text`; `AVAIL=permission gate`; `SIDEFX=workspace file changes`; `STATE=workspace`; `OUTPUT=edit result/diff`; `FAIL=not-read/ambiguous match/denial`; `SEC=write permission`; `OBS=tool result` | `EVD-claude-code-DOC-004`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（公开工具/稳定修复语境）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未修改文件；原子性、多文件部分失败、换行/编码和删除语义未验证。 |
| `FACT-claude-code-021` | `CAP-05.05-A01`, `CAP-05.06-A02`, `CAP-05.06-A03`, `CAP-05.13-A02` | `S-CLI-DOC` | `Bash` 默认超时 2 分钟、单次可请求至 10 分钟；超时可转后台。默认 30,000 字符以上输出会把完整内容保存到 session 文件，并返回路径和预览；`Ctrl+B` 可主动后台化。`ENTRY=Bash/Ctrl+B`; `INPUT=command,timeout`; `AVAIL=permission+sandbox`; `SIDEFX=host process/files/network`; `STATE=process/session`; `PERSIST=output file`; `OUTPUT=stdout/stderr/exit or task id+path`; `CONC=foreground/background`; `FAIL=timeout moves background`; `SEC=Bash rules/sandbox`; `OBS=task status` | `EVD-claude-code-DOC-004`, `EVD-claude-code-DOC-003`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（文档；timeout message 有 `>=2.1.210` 锚点）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未执行 Bash；环境继承、进程树、回收、输出文件清理和禁用后台变量未验证。 |
| `FACT-claude-code-022` | `CAP-05.10-A01`, `CAP-05.10-A02` | `S-CLI-DOC` | 官方工具表列出 `WebFetch`（明确 URL）和 `WebSearch`（查询）；2.1.212 为 529/限流请求加入 bounded backoff，并把 WebSearch session 默认上限设为 200。`ENTRY=WebFetch/WebSearch`; `INPUT=URL/query`; `AVAIL=network+permission+provider`; `SIDEFX=external request`; `OUTPUT=page/search results`; `CONC.limits=WebSearch 200/session`; `FAIL=bounded retry on 529/rate limit`; `SEC=network permission/separate fetch context`; `OBS=tool result` | `EVD-claude-code-DOC-004`, `EVD-claude-code-CHANGELOG-001`, `EVD-claude-code-DOC-024`；`Confirmed`（版本化 release+docs）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未发起网络工具调用；认证 URL、域名规则、重试次数和数据外发内容未复现。 |

### `CAP-06` 权限、安全与治理

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-023` | `CAP-06.02-A01`, `CAP-06.02-A04`, `CAP-06.03-A03` | `S-CLI` | `--permission-mode` 接受 `acceptEdits/auto/bypassPermissions/manual/dontAsk/plan`；`--allowedTools`、`--disallowedTools` 和 `--tools` 控制工具集合。官方规则按 deny→ask→allow 判定，deny 优先。`ENTRY=flags,/permissions/settings`; `INPUT=mode+tool rules`; `AVAIL=admin policy may restrict`; `STATE=session/project/user/managed`; `PERSIST=settings-dependent`; `OUTPUT=prompt/deny/tool removal`; `FAIL=deny or ask`; `SEC=tool permission engine`; `OBS=permission UI` | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-010`；`Confirmed`（入口/公开规则）；runtime `Not tested`；lifecycle `stable`（auto 为 research preview）；confidence `Medium` | 高影响 enforcement 未执行；复杂 Bash wrapper、path/domain 匹配及所有 mode 默认行为未复现。 |
| `FACT-claude-code-024` | `CAP-06.05-A01`, `CAP-06.05-A02`, `CAP-06.05-A03` | `S-CLI-DOC` | 官方 sandbox 资料描述 Bash 及其 child process 的 OS-level filesystem/network 限制（macOS Seatbelt、Linux bubblewrap）；权限层与 sandbox 层分离。冻结 binary 包含 sandbox surface 锚点。`ENTRY=settings/sandboxed Bash`; `INPUT=filesystem/network allow/deny`; `AVAIL=platform dependencies+configuration`; `SIDEFX=restricted child process`; `STATE=session/process`; `FAIL=blocked or fallback per config unknown`; `SEC=host filesystem/network boundary`; `OBS=sandbox denial/debug` | `EVD-claude-code-DOC-011`, `EVD-claude-code-DOC-010`, `EVD-claude-code-BINARY-001`；`Confirmed`（官方承诺/实现面）；runtime `Not tested`；lifecycle `stable candidate`；confidence `Medium` | 高影响隔离未做 escape/deny probe；默认开关、平台依赖失败和完整 syscall 范围未确认。 |
| `FACT-claude-code-025` | `CAP-06.09-A01`, `CAP-06.09-A02` | `S-CLI-DOC` | managed settings 可通过 server、MDM/OS policy 或 system file 下发，优先级高于 CLI/local/project/user 且不能被下层覆盖；冻结 help 的 `--safe-mode` 明示 admin-managed policy 仍生效。`ENTRY=managed settings delivery`; `INPUT=policy JSON`; `AVAIL=organization/admin`; `STATE=organization/device`; `PERSIST=managed`; `OUTPUT=effective policy/source`; `FAIL=invalid/freshness behavior partly documented`; `SEC=non-overridable policy`; `OBS=/status/debug` | `EVD-claude-code-DOC-012`, `EVD-claude-code-DOC-010`, `EVD-claude-code-HELP-001`；`Confirmed`（文档/CLI qualifier）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 没有受管设备/组织；delivery precedence、fail-closed refresh 和用户绕过均未实测。 |
| `FACT-claude-code-026` | `CAP-06.08-A05` | `S-CLI` | 2.1.212 changelog 明示 Task tool 的 `mode` 参数被弃用且忽略，subagent 默认继承 parent session 的 permission mode。`ENTRY=subagent spawn`; `INPUT=parent permission mode`; `AVAIL=stable 2.1.212`; `STATE=parent/child sessions`; `OUTPUT=effective child mode`; `FAIL=unknown`; `EXT=subagent boundary`; `SEC=inherited permission posture`; `OBS=transcript/agent state` | `EVD-claude-code-CHANGELOG-001`；`Confirmed`（版本化声明）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 高影响继承未实际触发；agent definition 的局部覆盖、hooks/MCP/plugin 权限和拒绝反馈待测。 |

### `CAP-07` 扩展机制

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-027` | `CAP-07.02-A01`, `CAP-07.02-A02`, `CAP-07.02-A03` | `S-CLI-DOC` | Skills 由 `SKILL.md` 元数据发现，可由 `/skill-name` 显式调用或按描述由模型调用；启动上下文只保留描述，完整正文按使用加载。冻结 `--bare` 仍允许显式 `/skill-name`，`--disable-slash-commands` 可禁用 skills。`ENTRY=/skill-name or model invocation`; `INPUT=SKILL.md+arguments`; `AVAIL=scope/config`; `STATE=user/project/plugin`; `PERSIST=files`; `OUTPUT=skill instructions/actions`; `EXT=lazy-loaded skill`; `SEC=current permissions`; `OBS=skill listing/transcript` | `EVD-claude-code-DOC-013`, `EVD-claude-code-HELP-001`；`Confirmed`（公开语义/CLI controls）；runtime `Not tested`；lifecycle `stable candidate`；confidence `Medium` | 未加载自定义 skill；优先级冲突、资源引用、依赖和 live reload 未复现。 |
| `FACT-claude-code-028` | `CAP-07.03-A01`, `CAP-07.03-A02`, `CAP-07.03-A03`, `CAP-07.03-A05` | `S-CLI-DOC` | Hooks 可绑定生命周期事件，以 JSON stdin 接收上下文；exit 0 成功，exit 2 可阻断受支持事件。2.1.212 修复 `continue:false` halt 丢失和 infrastructure error 被误报为用户拒绝。`ENTRY=settings hook event`; `INPUT=event JSON stdin`; `AVAIL=normal mode/trusted config`; `SIDEFX=handler-defined`; `STATE=event/session`; `OUTPUT=stdout/stderr/exit/decision`; `MODES=sync/async per hook`; `FAIL=blocking exit or infrastructure error`; `EXT=hook process`; `SEC=current policy`; `OBS=hook events/debug` | `EVD-claude-code-DOC-014`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（stable fix+docs）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未安装 handler；完整事件集合、超时、并发、async 生命周期和权限隔离未实测。 |
| `FACT-claude-code-029` | `CAP-07.04-A05`, `CAP-07.04-A06` | `S-CLI` | `claude mcp` 公开 add/get/list/remove、login/logout 和 serve；add 支持 stdio、SSE、HTTP，配置具有 local/user/project scope；project `.mcp.json` server 未批准时显示 Pending 且不连接。`ENTRY=claude mcp`; `INPUT=name,transport,command/URL,scope`; `AVAIL=config+trust+auth`; `STATE=local/user/project/external service`; `PERSIST=config+OAuth credentials`; `OUTPUT=list/health/auth status`; `FAIL=pending/unhealthy/auth error`; `EXT=MCP`; `SEC=trust+permission`; `OBS=CLI status` | `EVD-claude-code-HELP-002`, `EVD-claude-code-DOC-015`；`Confirmed`（冻结命令面+文档）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未新增或连接 server；tool/resource/prompt 实际发现、OAuth、重连和错误隔离未复现。 |
| `FACT-claude-code-030` | `CAP-07.05-A01`, `CAP-07.05-A02`, `CAP-07.05-A03`, `CAP-07.05-A04`, `CAP-07.05-A05`, `CAP-07.05-A08` | `S-CLI` | plugin CLI 公开 marketplace、install、list/details、enable、disable、update、uninstall 和 validate；update help 说明重启后应用。`ENTRY=claude plugin`; `INPUT=plugin or plugin@marketplace`; `AVAIL=marketplace/policy/trust`; `SIDEFX=install/update/remove files`; `STATE=user/project/local/managed scope`; `PERSIST=plugin install/config`; `OUTPUT=inventory/status/validation`; `FAIL=policy/trust/validation errors`; `EXT=skills/agents/hooks/MCP/LSP`; `SEC=marketplace policy`; `OBS=plugin list/details` | `EVD-claude-code-HELP-003`, `EVD-claude-code-DOC-016`, `EVD-claude-code-BINARY-001`；`Confirmed`（冻结命令面+docs）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 为避免写入用户配置未安装插件；版本 pin/rollback、签名/provenance、依赖和 policy denial 未复现。 |

### `CAP-08` 多 Agent、任务与隔离

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-031` | `CAP-07.06-A01`, `CAP-08.01-A03`, `CAP-08.07-A02` | `S-CLI` | `--agent` 选择当前角色，`--agents <json>` 定义带 description/prompt 的自定义角色；`claude agents --json` 列出 active（可加 `--all`）background sessions。`ENTRY=--agent/--agents/claude agents`; `INPUT=agent name/JSON`; `AVAIL=config/policy`; `STATE=session`; `PERSIST=definition source dependent`; `OUTPUT=selected role/JSON roster`; `MODES=interactive/non-TTY list`; `OBS=help/JSON` | `EVD-claude-code-HELP-001`, `EVD-claude-code-HELP-003`；`Confirmed`（冻结命令面）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未定义/选择 agent；JSON schema、无效定义、可用角色枚举/约束查询和输出结构未实测。 |
| `FACT-claude-code-032` | `CAP-08.02-A01`, `CAP-08.02-A02`, `CAP-08.06-A01`, `CAP-08.06-A02`, `CAP-08.06-A04` | `S-CLI-DOC` | 官方 subagent 资料描述独立 context window，可配置 system prompt、tools、model 和 permission mode；2.1.212 默认继承 parent permission mode。`ENTRY=Agent tool/custom agent`; `INPUT=bounded task+agent definition`; `AVAIL=tool/policy`; `STATE=child execution context`; `PERSIST=transcript behavior partly documented`; `OUTPUT=result to parent`; `MODES=foreground/background`; `CONC=child execution`; `EXT=tools/model/instructions`; `SEC=permission inheritance`; `OBS=transcript/agent roster` | `EVD-claude-code-DOC-017`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（docs+versioned permission change）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 高影响隔离和继承未复现；memory visibility、filesystem/process isolation与失败传播未知。 |
| `FACT-claude-code-033` | `CAP-08.03-A01`, `CAP-08.07-A01`, `CAP-08.07-A02`, `CAP-08.07-A03`, `CAP-08.07-A04` | `S-CLI` | `--bg` 启动 background agent 并立即返回，`claude agents` 管理；2.1.212 `/fork` 创建独立后台 session，release 同时改进 cold attach 和 reopened stopped session 行为。`ENTRY=--bg,/fork,claude agents`; `INPUT=prompt/session`; `AVAIL=daemon/runtime`; `STATE=background session`; `PERSIST=local agent state`; `OUTPUT=roster/status/transcript`; `MODES=background`; `CONC=multiple sessions`; `FAIL=reopen reason exposed`; `OBS=agent view/JSON` | `EVD-claude-code-HELP-001`, `EVD-claude-code-HELP-003`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（冻结 Surface/release）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未启动 background agent；并发上限、公平调度、attach 控制、daemon 重启和清理未复现。 |
| `FACT-claude-code-034` | `CAP-08.03-A04` | `S-CLI` | 2.1.212 对每 session subagent spawn 设置默认 200 上限，可用 `CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION` 覆盖，`/clear` 重置预算。`ENTRY=subagent spawn`; `INPUT=environment cap`; `AVAIL=stable 2.1.212`; `STATE=session`; `CONC.limits=200 default`; `FAIL=exhaustion behavior not described`; `OBS=release note` | `EVD-claude-code-CHANGELOG-001`；`Confirmed`（版本化声明）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未触发上限；0/负值/非法值、预警、已运行 child 和 `/clear` 并发竞态未知。 |

### `CAP-09` 软件交付与协作系统

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-035` | `CAP-09.01-A01`, `CAP-10.09-A02`, `CAP-10.09-A03` | `C-CI` | 当前官方 GitHub Actions 资料描述 `anthropics/claude-code-action@v1`：workflow 可由 issue/PR 中的 `@claude` 触发，并通过 repository secret 或云 provider 凭据运行。`ENTRY=GitHub event+Action v1`; `INPUT=issue/PR context+prompt`; `AVAIL=workflow+credential+repository permission`; `SIDEFX=workflow-defined repository/API writes`; `STATE=GitHub run`; `PERSIST=GitHub logs/artifacts`; `OUTPUT=comment/code/workflow result`; `FAIL=Action/credential error`; `SEC=GitHub permissions+secret`; `OBS=Actions run` | `EVD-claude-code-DOC-020`；`Confirmed`（current Action v1 docs 契约）；runtime `Not tested`；lifecycle `not-checked`；confidence `Low` | 独立 CI surface，Action commit 和 bundled/installed CLI 版本均未冻结；不能归因于 CLI `2.1.212`，也未触发 GitHub 写操作。 |
| `FACT-claude-code-037` | `CAP-09.03-A01`, `CAP-09.03-A03` | `S-CLI` | `claude ultrareview [target]` 声明对当前 branch、PR number 或 base branch 运行 cloud-hosted multi-agent review；`--json` 输出 raw `bugs.json`，`--timeout` 控制等待时间。`ENTRY=claude ultrareview`; `INPUT=branch/PR/base`; `AVAIL=cloud service+auth+billing gate`; `SIDEFX=uploads review context/external job`; `STATE=external-service review`; `OUTPUT=findings or bugs.json`; `FAIL=timeout/auth/target error`; `SEC=cloud boundary`; `OBS=CLI output` | `EVD-claude-code-HELP-003`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（冻结命令面/release fixes）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未上传代码或运行 review；数据边界、grader、严重度 schema、取消及持久链接未知。 |
| `FACT-claude-code-038` | `CAP-09.08-A02`, `CAP-05.09-A04` | `S-CLI` | `--worktree [name]` 为 session 创建 git worktree；`--tmux` 可为该 worktree 创建 tmux/iTerm2 pane。2.1.212 修复 `.claude/worktrees` repository symlink 可把创建写到 repo 外的问题。`ENTRY=--worktree/--tmux`; `INPUT=optional name`; `AVAIL=git; tmux requires worktree`; `SIDEFX=worktree/ref/process`; `STATE=isolated checkout`; `PERSIST=git worktree`; `OUTPUT=session/worktree`; `FAIL=symlink path guarded`; `SEC=repository boundary`; `OBS=help/release` | `EVD-claude-code-HELP-001`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（版本化 Surface）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未创建 worktree/tmux；branch naming、concurrent collisions、cleanup 和 untrusted repo 边界未复现。 |

### `CAP-10` 自动化与编程接入

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-039` | `CAP-10.01-A01`, `CAP-10.02-A01`, `CAP-10.02-A02` | `S-CLI` | `-p/--print` 接收 prompt argument 或 stdin，在非交互模式打印结果后退出；`--no-session-persistence` 可禁止 transcript 落盘。`ENTRY=claude -p`; `INPUT=argument/stdin text`; `AVAIL=auth/provider/workspace trusted by caller`; `SIDEFX=Agent tools unless restricted`; `STATE=process/session`; `PERSIST=default session or explicitly none`; `OUTPUT=stdout`; `MODES=non-interactive/non-TTY`; `FAIL=exit/error stream not exercised`; `SEC=trust dialog skipped`; `OBS=process output` | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-009`；`Confirmed`（冻结 flags/官方语义）；runtime `Not tested`（仅 help/version）；lifecycle `stable`；confidence `Medium` | 未认证执行 prompt；workspace trust 跳过使调用方需自担可信目录，工具副作用和退出码矩阵待测。 |
| `FACT-claude-code-040` | `CAP-10.03-A01`, `CAP-10.03-A02`, `CAP-10.03-A03` | `S-CLI` | print 模式公开 `text`、单结果 `json` 和实时 `stream-json`；`--input-format stream-json` 支持实时输入，`--json-schema` 约束结构化最终输出。`ENTRY=--output-format/--input-format/--json-schema`; `INPUT=text or stream-json+schema`; `AVAIL=--print constraints`; `OUTPUT=text/json/event stream/schema result`; `MODES=non-interactive`; `FAIL=invalid schema/stream error unknown`; `OBS=stdout protocol` | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-009`；`Confirmed`（冻结协议面）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未采集真实事件；schema violation、stderr 分离、backpressure、partial result 和退出状态未复现。 |
| `FACT-claude-code-041` | `CAP-10.04-A01`, `CAP-10.04-A02` | `S-CLI` | `--include-hook-events` 和 `--include-partial-messages` 扩展 stream-json；`--forward-subagent-text`（2.1.211 引入）以带 `parent_tool_use_id` 的 assistant/user messages 转发 child 文本。`ENTRY=stream-json flags`; `INPUT=agent run`; `AVAIL=--print + stream-json`; `STATE=run/session`; `OUTPUT=typed lifecycle/partial/hook/subagent events`; `MODES=non-interactive`; `CONC=parent-child correlation`; `FAIL=unreadable stream error surface`; `OBS=event fields` | `EVD-claude-code-HELP-001`, `EVD-claude-code-CHANGELOG-001`, `EVD-claude-code-BINARY-001`；`Confirmed`（冻结 flags/字段）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未确认完整 event taxonomy、排序、协议版本、嵌套 depth、断流恢复或 stderr/exit 协议。 |
| `FACT-claude-code-042` | `CAP-10.06-A01`, `CAP-10.06-A02`, `CAP-10.06-A03`, `CAP-10.06-A04` | `C-SDK` | 当前官方 Agent SDK 资料为 Python/TypeScript 提供 `query()` 等嵌入接口，沿用 Claude Code tools/agent loop/context，并可创建/继续会话和消费 messages。`ENTRY=SDK query()`; `INPUT=prompt+options`; `AVAIL=SDK package+auth`; `STATE=program-owned session`; `PERSIST=resume option dependent`; `OUTPUT=async messages`; `MODES=embedded/non-interactive`; `FAIL=SDK exceptions unknown`; `EXT=callbacks/MCP/hooks`; `OBS=message stream` | `EVD-claude-code-DOC-019`；`Confirmed`（current SDK docs 契约）；runtime `Not tested`；lifecycle `not-checked`；confidence `Low` | Python/TypeScript package 精确版本未冻结，未安装 SDK；不能把当前 SDK API 整体归因于 CLI `2.1.212`，取消、类型兼容、backpressure 和 binary resolution 未验证。 |

### `CAP-11` 模型、Provider 与运行经济性

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-043` | `CAP-11.01-A01`, `CAP-11.01-A02`, `CAP-11.02-A01` | `S-CLI-DOC` | 官方 setup/model 资料描述 Anthropic account/API 以及 Bedrock、Vertex 等第三方 provider 路径；冻结 `--bare` 说明 Anthropic auth 只读 `ANTHROPIC_API_KEY` 或显式 settings 的 `apiKeyHelper`，第三方 provider 使用各自凭据。`ENTRY=auth/settings/environment`; `INPUT=endpoint/provider credentials`; `AVAIL=provider/account/region`; `STATE=user/process`; `PERSIST=keychain/helper/provider store`; `FAIL=auth/config incompatibility`; `SEC=credential store/injection`; `OBS=auth status` | `EVD-claude-code-DOC-001`, `EVD-claude-code-DOC-021`, `EVD-claude-code-HELP-001`；`Confirmed`（公开配置面）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未提供任何凭据；endpoint dialect、region/model availability、renewal 和 fail-fast 分类未复现。 |
| `FACT-claude-code-044` | `CAP-11.03-A02`, `CAP-11.03-A03` | `S-CLI` | `--model` 接受稳定 alias（help 示例 `fable/opus/sonnet`）或完整 model name；session 可通过 flag/设置选择模型。`ENTRY=--model,/model/settings`; `INPUT=alias/full model id`; `AVAIL=credential/provider allowlist`; `STATE=session`; `PERSIST=settings/session resume rules`; `OUTPUT=selected model`; `FAIL=unavailable/disallowed model unknown`; `OBS=status/transcript` | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-021`；`Confirmed`（冻结 flag）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未解析 alias 或发请求；文档中的当前 alias 目标会随时间变化，不能作为 2.1.212 固定 model ID。 |
| `FACT-claude-code-045` | `CAP-11.04-A01` | `S-CLI` | `--effort` 为当前 session 接受 `low/medium/high/xhigh/max`。2.1.212 transcript 还开始逐 assistant message 记录 reasoning effort。`ENTRY=--effort`; `INPUT=controlled enum`; `AVAIL=model/provider may gate actual levels`; `STATE=session/message`; `PERSIST=transcript`; `OUTPUT=effective effort metadata`; `FAIL=invalid value rejected by parser`; `OBS=help/transcript field` | `EVD-claude-code-HELP-001`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（冻结 flag/release）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未发模型请求；各级 token/latency 语义、默认值和 provider/model gate 未确认。 |
| `FACT-claude-code-046` | `CAP-11.03-A04`, `CAP-11.12-A02` | `S-CLI` | `--fallback-model` 在 `--print` 中接受逗号分隔有序列表；主模型 overloaded/unavailable 时依序尝试，且每个新 user turn 重新尝试 primary。`ENTRY=--fallback-model with --print`; `INPUT=ordered model list`; `AVAIL=print mode+models`; `STATE=turn/session`; `OUTPUT=route result not explicitly surfaced in help`; `MODES=non-interactive`; `FAIL=fallback on overload/unavailable`; `OBS=debug/event unknown` | `EVD-claude-code-HELP-001`；`Confirmed`（冻结 help 契约）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未制造 overload；错误分类、部分响应、成本、最大链长及实际模型披露未验证。 |
| `FACT-claude-code-047` | `CAP-11.09-A01`, `CAP-11.09-A02`, `CAP-11.09-A05` | `S-CLI-DOC` | `/usage` 展示 session token 与本地估算成本；2.1.212 中 `/clear` 后统计应重置。print 模式 `--max-budget-usd` 声明 API 调用最大美元花费。`ENTRY=/usage,--max-budget-usd`; `INPUT=session/budget`; `AVAIL=plan/API mode differences`; `STATE=session`; `PERSIST=local usage snapshot`; `OUTPUT=tokens,estimated USD,plan bars`; `FAIL=usage endpoint may show recent cache`; `OBS=usage UI/CLI termination unknown` | `EVD-claude-code-DOC-022`, `EVD-claude-code-HELP-001`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（stable min-version/release+flag）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 官方说明美元值是本地估算且非权威账单；预算阻断点、超额错误、订阅计划差异未复现。 |

### `CAP-12` 可观测性、可靠性与运维

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-048` | `CAP-12.02-A01`, `CAP-12.02-A02` | `S-CLI` | `--debug [filter]` 启用类别过滤诊断，`--debug-file <path>` 把 debug log 写到指定文件，`--verbose` 覆盖配置。`ENTRY=--debug/--debug-file/--verbose`; `INPUT=filter/path`; `AVAIL=all startup modes`; `SIDEFX=debug file when requested`; `STATE=process/session`; `PERSIST=local log`; `OUTPUT=diagnostic records`; `FAIL=invalid/unwritable path unknown`; `SEC=log sensitivity unknown`; `OBS=stderr/file` | `EVD-claude-code-HELP-001`；`Confirmed`（冻结命令面）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未创建日志；字段、轮转、redaction、filter grammar 和错误路径未检查。 |
| `FACT-claude-code-049` | `CAP-12.05-A02`, `CAP-12.05-A03` | `S-CLI` | `claude doctor` 是只读 installation health 检查，可读取当前目录 settings 而不弹 trust prompt；交互式 `/doctor` 才是可修复的完整 checkup。`ENTRY=claude doctor`; `INPUT=installation+settings`; `AVAIL=local CLI`; `SIDEFX=none promised for CLI doctor`; `OUTPUT=health diagnostics`; `MODES=non-interactive command`; `FAIL=diagnostic result/exit unknown`; `SEC=reads settings without trust prompt`; `OBS=stdout` | `EVD-claude-code-HELP-001`, `EVD-claude-code-HELP-003`；`Confirmed`（冻结 help）；runtime `Not tested`（只调用 `--help`）；lifecycle `stable`；confidence `Medium` | 未运行 bare `claude doctor`，避免把潜在实现行为误当纯 help；检查项、exit code 和隐私边界待测。 |
| `FACT-claude-code-050` | `CAP-12.03-A01`, `CAP-12.03-A02`, `CAP-12.03-A04`, `CAP-12.03-A06`, `CAP-12.03-A07` | `S-CLI-DOC` | OpenTelemetry export 由 `CLAUDE_CODE_ENABLE_TELEMETRY=1` 显式启用，支持 metrics、logs/events，trace 另有 beta gate；OTLP endpoint/protocol/headers 可配。prompt/tool 内容默认不采集或 redact，需独立开关。2.1.212 修复 OTLP HTTP chunking 与 SDK/headless trace/span correlation。`ENTRY=environment/managed settings`; `INPUT=OTel config`; `AVAIL=opt-in; tracing beta gate`; `SIDEFX=telemetry export`; `STATE=process/organization`; `PERSIST=external backend`; `OUTPUT=metrics/events/spans`; `FAIL=debug exporter errors`; `SEC=content gates/redaction`; `OBS=OTel` | `EVD-claude-code-DOC-023`, `EVD-claude-code-CHANGELOG-001`, `EVD-claude-code-BINARY-001`；`Confirmed`（versioned implementation+docs）；runtime `Not tested`；lifecycle `stable`（traces beta）；confidence `Medium` | 高影响数据外发未启用；默认字段、headers secret handling、sampling、redaction 和 backend delivery 未复现。 |
| `FACT-claude-code-051` | `CAP-12.04-A01`, `CAP-12.04-A02`, `CAP-06.10-A01` | `S-CLI-DOC` | telemetry 资料记录 `session.id`、`prompt.id`、agent/tool/hook 关联属性与 permission/auth/MCP/plugin 等 security event；2.1.212 修复在 `TRACEPARENT` 下 OTLP event 缺 `trace_id/span_id`。`ENTRY=OTel events`; `INPUT=run lifecycle`; `AVAIL=telemetry configured`; `STATE=session/prompt/tool/agent`; `PERSIST=external backend`; `OUTPUT=correlated event attributes`; `FAIL=missing correlation fixed in 2.1.212`; `SEC=audit data source`; `OBS=OTLP` | `EVD-claude-code-DOC-023`, `EVD-claude-code-CHANGELOG-001`；`Confirmed`（docs+stable fix）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未导出 event；事件完备性、ID 稳定性、跨进程关联、审计保留和 SIEM 查询不在本次复现范围。 |
| `FACT-claude-code-052` | `CAP-12.07-A03` | `S-CLI` | 2.1.212 在 print/SDK mode 收到 SIGTERM 且 Bash 正运行时，会中止 turn、杀死 command process tree 并以 143 退出。`ENTRY=SIGTERM`; `INPUT=running Bash`; `AVAIL=print/SDK`; `SIDEFX=process-tree termination`; `STATE=process/turn`; `OUTPUT=exit 143`; `FAIL=defined termination`; `SEC=resource cleanup`; `OBS=exit/status` | `EVD-claude-code-CHANGELOG-001`；`Confirmed`（版本化声明）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未发送 SIGTERM；process descendants、partial output、already-exited child 和 non-print mode 行为未复现。 |

## 3. Latest `2.1.220` 显式增量

本节只记录 `latest 2.1.220` 相对 stable 主画像新增的、由 immutable changelog
明确锚定的条目。它们不回填到 `2.1.212`。

| Fact ID | Atomic ID | 切片 | 可观察事实与 contract | 证据与状态 | 限制 |
| --- | --- | --- | --- | --- | --- |
| `FACT-claude-code-053` | `CAP-06.05-A03` | `L-CLI` | 2.1.219（包含于 2.1.220）新增 `sandbox.network.strictAllowlist`，让 sandboxed command 对未在 allowlist 的 host 直接 deny 而不询问。`ENTRY=settings+sandboxed command`; `INPUT=strictAllowlist+host`; `AVAIL=latest 2.1.220`; `FAIL=deny without prompt`; `SEC=network sandbox`; `OBS=denial` | `EVD-claude-code-CHANGELOG-002`；`Confirmed`（release statement）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未下载 latest binary 或执行网络 deny；配置 schema、默认值和所有协议边界未复现。 |
| `FACT-claude-code-054` | `CAP-07.03-A01` | `L-CLI` | 2.1.219（包含于 2.1.220）新增 `DirectoryAdded` hook，在 `/add-dir` 或 SDK `register_repo_root` 于 session 中注册新工作目录后触发。`ENTRY=/add-dir or register_repo_root`; `INPUT=new directory`; `STATE=session roots`; `OUTPUT=DirectoryAdded event`; `EXT=hook`; `OBS=hook event` | `EVD-claude-code-CHANGELOG-002`；`Confirmed`（release statement）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未下载/运行 latest；payload schema、失败阻断性、信任顺序和异步语义未知。 |
| `FACT-claude-code-055` | `CAP-08.09-A01`, `CAP-08.09-A02`, `CAP-08.09-A03` | `L-CLI` | 2.1.219（包含于 2.1.220）把 subagent 默认嵌套深度从 1 改为 3，可用 `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` 禁止 nesting；`--forward-subagent-text` 也开始转发 depth 2+ child，并以 spawning Agent tool-use id 关联。`ENTRY=nested subagent spawn/stream-json`; `INPUT=depth env+forward flag`; `STATE=agent hierarchy`; `OUTPUT=nested events`; `CONC.limits=depth 3 default`; `FAIL=depth cap behavior unknown`; `EXT=subagent`; `OBS=parent tool id` | `EVD-claude-code-CHANGELOG-002`；`Confirmed`（release statement）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未运行 latest；ancestry loop、防爆量上限、nested permission/memory 和 child failure propagation 未复现。 |
| `FACT-claude-code-056` | `CAP-10.04-A01`, `CAP-10.05-A04` | `L-CLI` | 2.1.219（包含于 2.1.220）给 headless stream-json init event 增加 `mcp_server_errors`，列出因 config validation 被跳过的 `--mcp-config` 项；terminal mode 同时打印 startup warning。`ENTRY=--print --output-format stream-json --mcp-config`; `INPUT=invalid MCP config`; `OUTPUT=typed init errors/warning`; `MODES=headless vs terminal`; `FAIL=machine-readable validation error`; `OBS=mcp_server_errors` | `EVD-claude-code-CHANGELOG-002`；`Confirmed`（release statement）；runtime `Not tested`；lifecycle `stable`；confidence `Medium` | 未运行 latest；字段 schema、部分有效配置、exit code 和 stderr/stdout 分离未复现。 |

## 4. Product Alias Records

Alias 只映射产品术语到冻结 Atomic ID；一条 alias 对应一个 Atomic ID。表中
`C` 表示 `epistemic_status=Confirmed`，所有记录
`last_checked=2026-07-25T14:42:21Z`。

| Alias ID | Atomic ID | 版本 / channel / surface | exact alias | kind | status | Evidence | 限制 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ALIAS-claude-code-001` | `CAP-01.03-A01` | `2.1.212/stable/cli` | `claude install stable` | command | C | `EVD-claude-code-HELP-001` | 未执行安装。 |
| `ALIAS-claude-code-002` | `CAP-01.11-A01` | `2.1.212/stable/cli` | `claude auth status` | command | C | `EVD-claude-code-HELP-002` | 未读取真实身份。 |
| `ALIAS-claude-code-003` | `CAP-02.10-A06` | `2.1.212/stable/cli` | `--ax-screen-reader` | command | C | `EVD-claude-code-HELP-001` | 未做辅助技术 runtime probe。 |
| `ALIAS-claude-code-004` | `CAP-02.06-A01` | `2.1.212/stable/cli` | `--ide` | command | C | `EVD-claude-code-HELP-001` | 未连接 IDE。 |
| `ALIAS-claude-code-005` | `CAP-02.08-A06` | `2.1.212/stable/cli` | `--remote-control` | command | C | `EVD-claude-code-HELP-001` | 需登录/订阅，未连接。 |
| `ALIAS-claude-code-006` | `CAP-03.02-A01` | `2.1.212/stable/cli` | `plan` | ui-label | C | `EVD-claude-code-HELP-001` | 仅 mode 名称/入口。 |
| `ALIAS-claude-code-007` | `CAP-04.01-A01` | `2.1.212/stable/cli` | `CLAUDE.md` | doc-term | C | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-007` | 层级行为未复现。 |
| `ALIAS-claude-code-008` | `CAP-04.11-A01` | `2.1.212/stable/cli` | `auto memory` | doc-term | C | `EVD-claude-code-DOC-007`, `EVD-claude-code-HELP-001` | 写入/召回未复现。 |
| `ALIAS-claude-code-009` | `CAP-04.10-A01` | `2.1.212/stable/cli` | `--resume` | command | C | `EVD-claude-code-HELP-001` | 未恢复 session。 |
| `ALIAS-claude-code-010` | `CAP-04.10-A02` | `2.1.212/stable/cli` | `--continue` | command | C | `EVD-claude-code-HELP-001` | 未继续 session。 |
| `ALIAS-claude-code-011` | `CAP-04.10-A03` | `2.1.212/stable/cli` | `--fork-session` | command | C | `EVD-claude-code-HELP-001` | 未创建分支 session。 |
| `ALIAS-claude-code-012` | `CAP-04.10-A04` | `current-docs@2026-07-25/latest/cli` | `/rewind` | command | C | `EVD-claude-code-DOC-006` | current-docs term；精确 `2.1.212` 适用性未证明。 |
| `ALIAS-claude-code-013` | `CAP-04.07-A02` | `current-docs@2026-07-25/latest/cli` | `/compact` | command | C | `EVD-claude-code-DOC-008` | current-docs term；精确 `2.1.212` 适用性未证明。 |
| `ALIAS-claude-code-014` | `CAP-05.01-A02` | `2.1.212/stable/cli` | `Read` | api-symbol | C | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-004`, `EVD-claude-code-CHANGELOG-001` | Help 只限定公开工具参数面；工具未执行。 |
| `ALIAS-claude-code-015` | `CAP-05.02-A02` | `current-docs@2026-07-25/latest/cli` | `Grep` | api-symbol | C | `EVD-claude-code-DOC-004` | current-docs term；精确 `2.1.212` 适用性未证明，工具未执行。 |
| `ALIAS-claude-code-016` | `CAP-05.03-A02` | `2.1.212/stable/cli` | `Edit` | api-symbol | C | `EVD-claude-code-HELP-001`, `EVD-claude-code-DOC-004`, `EVD-claude-code-CHANGELOG-001` | Help 只限定公开工具参数面；工具未执行。 |
| `ALIAS-claude-code-017` | `CAP-05.05-A01` | `2.1.212/stable/cli` | `Bash` | api-symbol | C | `EVD-claude-code-DOC-004`, `EVD-claude-code-CHANGELOG-001` | 工具未执行。 |
| `ALIAS-claude-code-018` | `CAP-05.10-A02` | `2.1.212/stable/cli` | `WebSearch` | api-symbol | C | `EVD-claude-code-CHANGELOG-001`, `EVD-claude-code-DOC-004` | 工具未执行。 |
| `ALIAS-claude-code-019` | `CAP-06.02-A01` | `2.1.212/stable/cli` | `--permission-mode` | command | C | `EVD-claude-code-HELP-001` | enforcement 未复现。 |
| `ALIAS-claude-code-020` | `CAP-07.02-A02` | `2.1.212/stable/cli` | `/skill-name` | command | C | `EVD-claude-code-DOC-013`, `EVD-claude-code-HELP-001` | 自定义 skill 未调用。 |
| `ALIAS-claude-code-021` | `CAP-07.03-A01` | `2.1.212/stable/cli` | `PreToolUse` | api-symbol | C | `EVD-claude-code-DOC-014`, `EVD-claude-code-CHANGELOG-001` | hook 未触发。 |
| `ALIAS-claude-code-022` | `CAP-07.04-A06` | `2.1.212/stable/cli` | `claude mcp` | command | C | `EVD-claude-code-HELP-002` | MCP server 未连接。 |
| `ALIAS-claude-code-023` | `CAP-07.05-A01` | `2.1.212/stable/cli` | `claude plugin install` | command | C | `EVD-claude-code-HELP-003` | 未安装插件。 |
| `ALIAS-claude-code-024` | `CAP-08.01-A03` | `2.1.212/stable/cli` | `--agent` | command | C | `EVD-claude-code-HELP-001` | 未选择角色。 |
| `ALIAS-claude-code-025` | `CAP-08.07-A02` | `2.1.212/stable/cli` | `claude agents` | command | C | `EVD-claude-code-HELP-003` | 未创建后台 agent。 |
| `ALIAS-claude-code-026` | `CAP-09.03-A01` | `2.1.212/stable/cli` | `claude ultrareview` | command | C | `EVD-claude-code-HELP-003` | 云 review 未运行。 |
| `ALIAS-claude-code-027` | `CAP-09.08-A02` | `2.1.212/stable/cli` | `--worktree` | command | C | `EVD-claude-code-HELP-001` | 未创建 worktree。 |
| `ALIAS-claude-code-028` | `CAP-10.01-A01` | `2.1.212/stable/cli` | `--print` | command | C | `EVD-claude-code-HELP-001` | 未执行认证 prompt。 |
| `ALIAS-claude-code-029` | `CAP-10.03-A02` | `2.1.212/stable/cli` | `stream-json` | doc-term | C | `EVD-claude-code-HELP-001` | 未采集事件流。 |
| `ALIAS-claude-code-030` | `CAP-10.03-A03` | `2.1.212/stable/cli` | `--json-schema` | command | C | `EVD-claude-code-HELP-001` | 未验证 schema。 |
| `ALIAS-claude-code-031` | `CAP-11.03-A02` | `2.1.212/stable/cli` | `--model` | command | C | `EVD-claude-code-HELP-001` | 未解析/调用模型。 |
| `ALIAS-claude-code-032` | `CAP-11.04-A01` | `2.1.212/stable/cli` | `--effort` | command | C | `EVD-claude-code-HELP-001` | 未发模型请求。 |
| `ALIAS-claude-code-033` | `CAP-11.12-A02` | `2.1.212/stable/cli` | `--fallback-model` | command | C | `EVD-claude-code-HELP-001` | fallback 未触发。 |
| `ALIAS-claude-code-034` | `CAP-12.02-A02` | `2.1.212/stable/cli` | `--debug-file` | command | C | `EVD-claude-code-HELP-001` | 未写日志。 |
| `ALIAS-claude-code-035` | `CAP-12.05-A02` | `2.1.212/stable/cli` | `claude doctor` | command | C | `EVD-claude-code-HELP-001`, `EVD-claude-code-HELP-003` | 只调用 help。 |
| `ALIAS-claude-code-036` | `CAP-12.03-A07` | `2.1.212/stable/cli` | `CLAUDE_CODE_ENABLE_TELEMETRY` | config-key | C | `EVD-claude-code-DOC-023`, `EVD-claude-code-BINARY-001` | opt-in/export 未启用，实际 opt-out 未复现。 |
| `ALIAS-claude-code-037` | `CAP-06.05-A03` | `2.1.220/latest/cli` | `sandbox.network.strictAllowlist` | config-key | C | `EVD-claude-code-CHANGELOG-002` | latest runtime 未下载。 |
| `ALIAS-claude-code-038` | `CAP-07.03-A01` | `2.1.220/latest/cli` | `DirectoryAdded` | api-symbol | C | `EVD-claude-code-CHANGELOG-002` | latest runtime 未下载。 |
| `ALIAS-claude-code-039` | `CAP-08.09-A02` | `2.1.220/latest/cli` | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` | config-key | C | `EVD-claude-code-CHANGELOG-002` | latest runtime 未下载。 |
| `ALIAS-claude-code-040` | `CAP-10.05-A04` | `2.1.220/latest/cli` | `mcp_server_errors` | api-symbol | C | `EVD-claude-code-CHANGELOG-002` | latest runtime 未下载。 |

## 5. 显式 unknown / unreviewed

下表是本轮 breadth-first 边界，不是缺失能力清单，也不产生
`Not supported`：

| 能力域 | `unknown` / `not-checked` |
| --- | --- |
| `CAP-01` | 安装失败回滚、版本回退、SBOM、publisher signature/provenance、region/role entitlement、公开源码与 native binary 的覆盖边界。 |
| `CAP-02` | 真实 TUI 多轮、鼠标、历史搜索、主题/布局/localization、完整 screen-reader、IDE/Chrome/Desktop/Web/Mobile 各 Surface 的精确版本和跨 Surface state ownership。 |
| `CAP-03` | steering 排队、不可中断动作、turn/timeout 重试、崩溃恢复、blocked/final terminal states、预算耗尽前预警。 |
| `CAP-04` | 2.1.212 的真实 transcript/compact/checkpoint/memory 持久化；跨设备同步；memory 冲突/隐私；transcript 内容搜索；其他 Agent 数据导入。 |
| `CAP-05` | PTY stdin、LSP/diagnostics/debugger、browser/desktop control、Git 写操作、notebook/结构化文档、media playback、工具超大结果随机访问。 |
| `CAP-06` | permission/sandbox/workspace-trust 的拒绝和 bypass runtime；secret redaction/storage；data retention/deletion；managed policy fail-closed；审计查询/导出。 |
| `CAP-07` | MCP tool/resource/prompt runtime、OAuth/reconnect；hook timeout/isolation；plugin pin/rollback/signature/provenance/dependency；extension live reload 与远端 Surface 一致性。 |
| `CAP-08` | peer/team collaboration、workspace/process 隔离、steering/cancel/failure propagation、队列公平性、daemon 重启恢复、超前台 session 存活。 |
| `CAP-09` | 所有 GitHub/CI/cloud review 外部读写 runtime、预览/授权/idempotency、评论线程、merge/deploy/release/change-management 和持久审计链接。 |
| `CAP-10` | Agent SDK package 精确版本、typed event 完整 schema/ordering/backpressure/cancel、长驻服务协议、CI runtime、schedule/channel/webhook/remote managed task。 |
| `CAP-11` | 真实 provider credential/region/model discovery、alias 实际解析、cache TTL/计费、rate limit、budget enforcement、actual routed model disclosure。 |
| `CAP-12` | debug/doctor/OTel runtime、export/retry/redaction/sampling、诊断包、自动更新失败恢复、daemon 运维、运行重放和 benchmark。 |

## 6. 本文件覆盖摘要

| 能力域 | stable facts | current-docs facts | latest-only delta | 合计 |
| --- | ---: | ---: | ---: | ---: |
| `CAP-01` | 4 | 0 | 0 | 4 |
| `CAP-02` | 4 | 0 | 0 | 4 |
| `CAP-03` | 4 | 0 | 0 | 4 |
| `CAP-04` | 5 | 2 | 0 | 7 |
| `CAP-05` | 4 | 1 | 0 | 5 |
| `CAP-06` | 4 | 0 | 1 | 5 |
| `CAP-07` | 4 | 0 | 1 | 5 |
| `CAP-08` | 4 | 0 | 1 | 5 |
| `CAP-09` | 2 | 1 | 0 | 3 |
| `CAP-10` | 3 | 1 | 1 | 5 |
| `CAP-11` | 5 | 0 | 0 | 5 |
| `CAP-12` | 5 | 0 | 0 | 5 |
| **总计** | **48** | **5** | **4** | **57** |

另有 `40` 条 Product Alias Record。这里的数量只表示 discovery 覆盖，不表示
Registry 支持率。
