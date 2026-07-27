# Phase 1C.2 Secondary Surfaces：增量 Evidence Ledger

> 阶段：1C.2 · Secondary Surface Claim Normalization  
> 增量产品：Codex `0.145.0` / npm `latest`；Qwen Code `0.21.0` / stable  
> Captured boundary：`2026-07-26T04:42:46Z`  
> 调研平台：Darwin arm64

本文只记录 Phase 1C.2 新增的 Evidence Record。Qwen Code 的一般正式 Claim 继续
引用 [`evidence/qwen-code.md`](./qwen-code.md) 中固定到 `v0.21.0`
commit/package 的 Evidence；本账本另补 scoped negative 文档记录与 IM Bot
release-artifact 归因记录。Claude Code 本阶段没有新增 Evidence。

## 1. 环境与边界

| Env ID                     | Platform                                                                    | Authentication                             | Entitlement | Region         | Provider       | Model          | Configuration / flags                                                              |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------------------------ | ----------- | -------------- | -------------- | -------------- | ---------------------------------------------------------------------------------- |
| `ENV-codex-1C2-LOCAL-001`  | Darwin arm64；zsh 5.9；non-TTY；cwd=`/private/tmp`                          | 未登录；未读取或写入 credential            | 未检查      | not-applicable | not-applicable | not-applicable | frozen binary；Help 无配置；schema generator 只传 `--experimental` 与临时输出目录  |
| `ENV-codex-1C2-SCHEMA-001` | 同上；输出位于新建 `/private/tmp/ccq-phase1c2-codex-appserver.uEQFGJ`       | 未登录；schema generation 不要求认证       | 未检查      | not-applicable | not-applicable | not-applicable | binary SHA-256 `1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590`  |
| `ENV-codex-1C2-SCHEMA-002` | 同上；输出位于新建 `/private/tmp/ccq-phase1c2-codex-appserver-rerun.T1WcoM` | 未登录；schema generation 不要求认证       | 未检查      | not-applicable | not-applicable | not-applicable | 同一 frozen binary；复验单独记录精确 started/finished 与 canonical JSON hash       |
| `ENV-qwen-1C2-DOC-001`     | not-applicable；公开 GitHub 文件固定到 release commit                       | 公开只读请求；不依赖或读取 credential 内容 | 未检查      | not-applicable | not-applicable | not-applicable | commit `5610eb405212f807a482214ddd28a259da7855d3`；不读取当前 checkout             |
| `ENV-qwen-1C2-PKG-001`     | 本地已解包 npm artifact；静态读取；未执行 channel                           | 未登录；未读取 credential                  | 未检查      | not-applicable | not-applicable | not-applicable | tarball SHA-256 `62fa5ea404a8d1f694edc54446bbd4ca6d3a69e090ec5975977ff51918d2aeca` |

Codex 本地 probe 没有启动 app-server、MCP server 或 exec-server，没有建立
socket/stdio client 连接，也没有模型调用、网络请求、凭据读取、外部系统写入或仓库
源码修改。Qwen 增量 Evidence 通过公开 GitHub API 读取固定 commit 中的单个文档，
并静态读取已冻结到 `0.21.0` 的本地 npm artifact，没有启动 adapter、网络投递或外部
写入。Codex binary 每次启动仍尝试创建 PATH alias，环境以
`Operation not permitted (os error 1)` 拒绝。

## 2. Evidence Records

| Evidence ID                | Type      | Version / channel  | Surface    | Source / procedure                                                                                                                                      | Captured at            | Env                        | Bounded observation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Provable scope                                                                                                                | Discovery links                                                         | Limitations                                                                                                                                                                             |
| -------------------------- | --------- | ------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EVD-codex-HELP-006`       | `HELP`    | `0.145.0` / latest | sdk-daemon | frozen binary `mcp-server --help`；`app-server --help`；`app-server generate-json-schema --help`；`app-server generate-ts --help`；`exec-server --help` | `2026-07-26T04:12:29Z` | `ENV-codex-1C2-LOCAL-001`  | `mcp-server` 自述为 stdio MCP server；experimental `app-server` 公开 stdio/Unix socket/WebSocket transport 与 schema tooling；experimental `exec-server` 公开 WebSocket/stdio listen、remote registration、environment ID/name 与 agent identity auth flags。各命令退出 `0`。                                                                                                                                                                                                                                                                                                                                                                        | exact binary 在 `sdk-daemon` Surface 的入口、lifecycle label、transport 与参数发现；不证明 server 正常路径                    | qualifies `FACT-codex-031/047/048/050`                                  | 未启动服务、协商协议、列工具、提交任务、注册 remote environment 或验证认证。`exec-server` 只供 mapping review，不支持现有 cloud-task Atomics。                                          |
| `EVD-codex-RUNTIME-002`    | `RUNTIME` | `0.145.0` / latest | sdk-daemon | `codex app-server generate-json-schema --out /private/tmp/ccq-phase1c2-codex-appserver.uEQFGJ --experimental`                                           | `2026-07-26T04:06:35Z` | `ENV-codex-1C2-SCHEMA-001` | 命令退出 `0`，生成 `347` 个文件、约 `4.2M`。aggregate schema SHA-256：`codex_app_server_protocol.schemas.json=1f66700d1cc3de4a5004e5614a6098878b405c7e7c5f8c9be97fc900d0ad6c68`；`codex_app_server_protocol.v2.schemas.json=269604d34ee339f861c82ac504459b2ffcb90d1cfc71566074817ab502475458`。v2 aggregate 包含 `initialize`、`thread/start`、`turn/start`、`turn/interrupt`、`item/started`、`item/completed` 等 method/type anchors。                                                                                                                                                                                                             | exact binary 能在临时目录生成可校验的 app-server protocol schema；只能证明 schema surface，不能证明方法可成功执行             | supports bounded schema clauses of `FACT-codex-047`                     | 未启动 server、建立 transport、发送 request、认证、创建 thread、消费 event 或验证版本协商。输出目录仍保留在临时区供本轮复核，未作为长期 artifact 发布。                                 |
| `EVD-codex-RUNTIME-003`    | `RUNTIME` | `0.145.0` / latest | sdk-daemon | `codex app-server generate-json-schema --out /private/tmp/ccq-phase1c2-codex-appserver-rerun.T1WcoM --experimental`                                     | `2026-07-26T04:42:46Z` | `ENV-codex-1C2-SCHEMA-002` | `2026-07-26T04:42:45Z` 开始、`04:42:46Z` 结束，命令退出 `0`，生成 `347` 个文件、`4288 KiB`。raw aggregate SHA-256：主文件 `1f66700d1cc3de4a5004e5614a6098878b405c7e7c5f8c9be97fc900d0ad6c68`，v2 `80727df3cbf8988e82abc75c2a95d766be05c1bdba59910e4dd2b52094fe46f6`。与首跑对比发现 v2 definition order 非确定；`jq -S -c` canonical SHA-256 两次均分别为主文件 `320f6ff1040302e2e39514456dc07594c283d503233ced4ab90df4cb57746304`、v2 `33e163c58a7e9c276f18e109d7ac361f01f8c2394881fc8e3f3177efeaed7cf3`。v2 aggregate 包含 `initialize`、`thread/start`、`turn/start`、`turn/interrupt`、`item/started`、`item/completed` 等 method/type anchors。 | exact binary 的第二次独立 schema generation，带完整时间与 canonical hash；只能证明 schema surface，不证明方法可成功执行       | supports bounded schema clauses of `FACT-codex-047`                     | 未启动 server、建立 transport、发送 request、认证、创建 thread、消费 event 或验证版本协商。raw v2 文件顺序不稳定，完整性比较必须使用 canonical JSON；输出目录仍保留在临时区供本轮复核。 |
| `EVD-qwen-code-DOC-044`    | `DOC`     | `0.21.0` / stable  | sdk-daemon | [qwen serve at the release commit](https://github.com/QwenLM/qwen-code/blob/5610eb405212f807a482214ddd28a259da7855d3/docs/users/qwen-serve.md)          | `2026-07-26T04:32:18Z` | `ENV-qwen-1C2-DOC-001`     | Git blob `55c931727c45f5daa2cc579fc38132c14a91d266`。当前 `/capabilities` 示例返回版本、mode 与 feature inventory；同页 convergence roadmap 将真正的 feature negotiation 与 protocol version exchange 明列为后续工作，使客户端目前不能依此协商 drift。                                                                                                                                                                                                                                                                                                                                                                                               | exact `0.21.0` 文档直接界定 capability discovery 与双向 feature negotiation 的当前差异                                        | supports scoped negative clause of `FACT-qwen-code-042 / CAP-10.08-A01` | 文档是版本化一方承诺，不是 runtime probe；未请求 endpoint 或测试不兼容客户端。                                                                                                          |
| `EVD-qwen-code-SOURCE-009` | `SOURCE`  | `0.21.0` / stable  | im-bot     | `/private/tmp/ccq-phase1b-qwen-0.21.0/package/package.json`；`package/chunks/chunk-RWTEFFPU.js`；bundled channel overview                               | `2026-07-26T04:38:19Z` | `ENV-qwen-1C2-PKG-001`     | npm package `@qwen-code/qwen-code@0.21.0` 的 `files` 包含 `chunks` 与 `bundled`。channel-core chunk SHA-256 `ecc29064caa2bf14f7ead051d07e759f374ecac815a1dd1cdde9ff7aaaac248e`：`processInbound` 将已过 gate 的消息按 channel/sender/chat/thread 交给 `SessionRouter.resolve`，调用 agent bridge，并把 response/lifecycle 投递回 chat target；router 持久维护 route→session 与 session→target。包内 channel overview 的 Git blob 为 `f537af16f55beb744645030636e1d1b0c5bbc516`，与 `EVD-qwen-code-DOC-018` 相同。                                                                                                                                    | exact npm release artifact 确实交付 generic channel core 与对应版本文档；只支持 release attribution 和 implementation surface | qualifies `FACT-qwen-code-052 / CAP-10.11-A01..A03`                     | 只静态读取 artifact；未启动任何 adapter、创建真实 session、投递消息，因而不证明 delivery、retry、dedupe、identity gate 或恢复行为。                                                     |

## 3. `EVD-codex-HELP-006` 命令结果

| Command                                        | Exit | Key stdout                                                                                                                                     | Stderr / side effects                                                 |
| ---------------------------------------------- | ---: | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `codex mcp-server --help`                      |    0 | `Start Codex as an MCP server (stdio)`                                                                                                         | PATH-alias attempt 被环境拒绝；未观察到其他文件、配置、认证或网络变化 |
| `codex app-server --help`                      |    0 | `[experimental]`；`daemon`、`proxy`、`generate-ts`、`generate-json-schema`；`stdio://`、`unix://`、`ws://IP:PORT`、`off`；WebSocket auth flags | 同上                                                                  |
| `codex app-server generate-json-schema --help` |    0 | experimental schema generator；`--out <DIR>`；`--experimental`                                                                                 | 同上                                                                  |
| `codex app-server generate-ts --help`          |    0 | experimental TypeScript binding generator                                                                                                      | 同上                                                                  |
| `codex exec-server --help`                     |    0 | `[EXPERIMENTAL]` standalone service；WebSocket/stdio listen；`--remote`、`--environment-id`、`--name`、`--use-agent-identity-auth`             | 同上；未注册 remote environment                                       |

## 4. Schema Generation Evidence

### 4.1 `EVD-codex-RUNTIME-002` 首次采集

```yaml
runtime_probe:
  applicability: applicable
  preconditions:
    - Darwin arm64
    - frozen binary SHA-256 1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590
    - new temp output directory
  procedure:
    - /private/tmp/codex-phase0.XNx1jk/unpacked/package/vendor/aarch64-apple-darwin/bin/codex app-server generate-json-schema --out /private/tmp/ccq-phase1c2-codex-appserver.uEQFGJ --experimental
  stdout: empty
  stderr: 'PATH-alias warning: Operation not permitted (os error 1)'
  exit_code: 0
  side_effects:
    - created 347 schema files under the dedicated temp directory
    - no repository, config, authentication, model, network, or external-system change was observed
  cleanup:
    - temp output retained through the Phase 1C.2 review gate for hash verification
  started_at: not separately timed
  finished_at: captured no later than 2026-07-26T04:06:35Z
```

`captured_at` 与上述缺失时间边界保持首次采集原样，不用后续复验回填。

### 4.2 `EVD-codex-RUNTIME-003` 定时复验

```yaml
runtime_probe:
  applicability: applicable
  preconditions:
    - Darwin arm64
    - frozen binary SHA-256 1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590
    - new temp output directory /private/tmp/ccq-phase1c2-codex-appserver-rerun.T1WcoM
  procedure:
    - /private/tmp/codex-phase0.XNx1jk/unpacked/package/vendor/aarch64-apple-darwin/bin/codex app-server generate-json-schema --out /private/tmp/ccq-phase1c2-codex-appserver-rerun.T1WcoM --experimental
  stdout: empty
  stderr: 'PATH-alias warning: Operation not permitted (os error 1)'
  exit_code: 0
  side_effects:
    - created 347 schema files under the dedicated temp directory
    - no repository, config, authentication, model, network, or external-system change was observed
  cleanup:
    - temp output retained through the Phase 1C.2 review gate for hash verification
  started_at: 2026-07-26T04:42:45Z
  finished_at: 2026-07-26T04:42:46Z
```

### 4.3 Aggregate schema anchors

| Contract area       | Exact v2 schema anchors                                                                                                     | What remains unproved                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Initialization      | `initialize`、`InitializeParams`、`InitializeResponse`                                                                      | 双方版本/能力交换、不兼容拒绝或显式降级                         |
| Thread/task input   | `thread/start`、`thread/read`、`thread/resume`、`thread/fork`、`turn/start`、`turn/steer`、`turn/interrupt`                 | request 成功、稳定身份、授权、拒绝、取消竞争与幽灵任务          |
| Streamed events     | `item/started`、`item/completed`、多种 delta notification、`turn/started`、`turn/completed`                                 | delivery、排序、backpressure、断线、重连、重复与终止语义        |
| Process/environment | `command/exec`、`command/exec/write`、`command/exec/terminate`、`environment/add`、`environment/info`、`environment/status` | 实际执行、environment ownership、remote registration 与安全边界 |

## 5. Evidence 使用约束

- `EVD-codex-HELP-006` 修复的是旧 Help Evidence 被登记为 `surface=cli` 的关系
  边界，不会把入口发现升级为 server 行为已复现。
- `EVD-codex-RUNTIME-002` 保留首次采集原样；因没有单独记录 started/finished，不作为
  本次完整 runtime-probe gate 的关系依据。
- `EVD-codex-RUNTIME-003` 的 `runtime_probe_status=Reproduced` 只描述带完整时间的
  schema generation。映射到 `CAP-10.07/10.08` 的 Claim 仍可是
  `support_state=Unknown`。
- `EVD-codex-DOC-024/025` 仍是
  `unversioned-docs@2026-07-25/latest/sdk-daemon`，只能 `qualifies` exact
  `0.145.0` Claim。
- `EVD-qwen-code-DOC-044` 只支持
  `0.21.0/sdk-daemon/CAP-10.08-A01` 的 scoped negative clause，不用于推断其他
  capability tags、客户端兼容或未来版本。
- `EVD-qwen-code-SOURCE-009` 只 `qualifies` 三条 generic `im-bot` Claim 的
  release attribution 与 implementation surface；`EVD-qwen-code-DOC-018` 继续
  `supports` 有界版本化文档陈述，两者都不升级 runtime support。
- 没有从 Help/schema 中未出现的项目生成 `Not supported`。
