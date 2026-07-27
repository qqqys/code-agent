# Codex / Claude Code / Qwen Code 对比：阶段 1D Runtime Probe 规范化

> 阶段：1D · Secondary Surface Runtime Probe  
> 状态：Reviewing  
> Evidence boundary：2026-07-26T05:23:52Z  
> Registry：Revision 1，共 548 个 Atomic Capability  
> 依赖：Phase 1C.2 frozen snapshot

## 1. 本阶段目标

Phase 1D 不扩展产品清单，也不做横向排名。它只回答三个 high-value runtime
问题：

1. Qwen `0.21.0` daemon 的 listener、auth、readiness、capability/status 与 cleanup
   是否能在无模型、无真实凭据条件下复现；
2. Codex `0.145.0` app-server 的 initialize 是否能在同等边界下执行；
3. Codex `0.145.0` MCP server 是否能在不调用模型的情况下完成 tools/list 与安全
   negative canary。

执行使用
[`probes/03-phase-1d-executed-runtime-probes.md`](./probes/03-phase-1d-executed-runtime-probes.md)，
新增 Evidence 定义在
[`evidence/phase-1d-runtime-probes.md`](./evidence/phase-1d-runtime-probes.md)。

## 2. Result Matrix

| Product / Slice                  | Entry reproduced | Protocol reproduced | Cleanup reproduced | Normalized result                                                                 |
| -------------------------------- | ---------------- | ------------------- | ------------------ | --------------------------------------------------------------------------------- |
| Qwen `0.21.0` daemon             | Yes              | discovery/status Yes | Yes               | Runtime-confirmed with bounded test escape；session/preheat/SSE/model remain open |
| Codex `0.145.0` app-server       | Process only     | No                  | Failed process gone | Blocked before first response by Codex Home SQLite state prerequisite             |
| Codex `0.145.0` MCP server       | Process only     | No                  | Failed process gone | Blocked before initialize response by Codex Home config prerequisite              |
| Claude Code secondary Surface    | Not in phase     | Not in phase        | Not in phase       | No new runtime evidence                                                           |

## 3. Qwen Behavior Model

### 3.1 Confirmed

- `qwen serve` bound an ephemeral loopback port and emitted the documented listening
  line.
- `/health` 与 unknown route 的无/错 bearer 请求返回 `401`；deep health、
  capability/status 只以正确 bearer 调用，因此未直接复现这些 route 的 negative auth。
- shallow health caused deferred runtime start to be scheduled；deep health
  distinguished bootstrap `503` from mounted runtime `200`.
- runtime capability response identified `0.21.0`、`http-bridge`、REST transport、
  protocol `v1` and 99 feature tags.
- summary status exposed security, configured limits, runtime counters and
  `preheat=not_scheduled`.
- full status located the persistent daemon log and evaluated broader preflight
  sections.
- invalid detail, unauthorized request and unknown authenticated route had distinct
  `400/401/404` results.
- SIGTERM produced drain/stopped log entries, exit `0`, dead PID and closed listener.

### 3.2 Confirmed side effects

- Initial empty settings files were rewritten to schema version 4.
- Daemon log、symlink、scratch/temp directories were created under controlled roots.
- `detail=full` attempted to spawn `rg`、`git`、`npm` for preflight. Containment
  denied all three; the response surfaced the failures instead of hiding them.
- daemon log 警告一个或多个 ambient runtime env 文件在 containment 中不可读；因此
  runtime-env 装载不是本轮已闭合能力。

这意味着“diagnostic GET”与“无本地 process side effect”不是同义合同。未来比较
daemon observability 时，应分别记录：

- 返回状态数据；
- 读取文件；
- 执行 dependency preflight；
- 进行 network/provider check。

### 3.3 Not proved

- ACP preheat child start/handshake；
- session create/prompt/cancel；
- SSE event order、replay、gap、reconnect；
- multi-client ownership 与 permission vote；
- MCP discovery/tool invocation；
- provider auth refresh、模型请求或成本；
- crash/kill -9 后遗留资源检测；
- channel adapter delivery。

## 4. Codex Protocol Corrections

### 4.1 App-server is initialization, not full version negotiation

exact `0.145.0` generated schema 与 immutable commit source 表明：

- wire 是 LF-delimited JSON，省略 `jsonrpc`;
- initialize request 必需 `clientInfo.name/version`;
- client capabilities 是 optional、client-declared；
- response 只要求 `codexHome`、platform family/OS、user agent；
- 没有 protocol version、server capability inventory 或 incompatibility
  negotiation field；
- `initialized` notification 在该 commit 是 no-op logging，不是 runtime gate。

2026-07-26 的 current official guide 确认省略 `jsonrpc` 的 JSONL framing 与
initialize 流程，但把 `initialized` 描述为 handshake gate。它是可变的当前文档，
不能覆盖 exact `0.145.0` commit 的不同 processor 行为。

因此原 probe catalog 的 `invalid-version` 不适用。更重要的是，
`CAP-10.08-A01` 当前把“建立连接时初始化客户端身份/能力”与“双方交换协议版本并对
不兼容组合降级/拒绝”合在一个 Atomic。Codex app-server 只从 schema 直接闭合前半段，
不能因为 method 名为 `initialize` 就判定完整 negotiation。

### 4.2 MCP uses a different envelope

Codex MCP server 使用标准 `jsonrpc:"2.0"` JSONL。exact commit 静态构造两个工具：

- `codex`
- `codex-reply`

MCP initialize 的 `protocolVersion` 被原样 echo，不是严格 compatibility
negotiation。planned negative canary 改为不存在的 tool name；source dispatch
保证它在 model/session path 前返回 error result。

本轮 runtime 在 config bootstrap 阶段失败，所以以上仍是
`Confirmed-at-commit + frozen-binary-consistent`，不是 runtime response。

## 5. Candidate Claim Deltas

Phase 1C.2 frozen Claim 不在本阶段原地改写。以下是下一次 generator revision 的
candidate delta：

| Existing Claim / Atomic                         | Phase 1C.2 | Phase 1D candidate        | Reason                                                                                                         |
| ----------------------------------------------- | ---------- | ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Qwen `CAP-10.07-A01` long-running service       | `Unknown`  | `Partial`                 | listener 处理 bootstrap/runtime/error 多请求并 clean shutdown；ACP preheat 被关闭，未证明可接受和执行 task 的 ready child       |
| Qwen `CAP-12.05-A01` health/readiness           | `Unknown`  | `Supported`               | 直接区分 shallow liveness、bootstrap degraded、runtime ready 与 post-shutdown unavailable                      |
| Qwen `CAP-12.02-A02` persistent diagnostic log  | `Unknown`  | `Supported`               | stdout/full-status 给出 log path，文件关联 PID/run/workspace、route error 与 shutdown                           |
| Qwen `CAP-12.07-A03` resource recovery          | `Unknown`  | `Partial`                 | 只证明 graceful parent/listener cleanup；未证明 child、crash、legacy detection 或 cleanup failure warning      |
| Qwen `CAP-10.08-A01` bilateral negotiation      | `Not supported` | unchanged           | runtime 证明单向 inventory；没有 client version/capability input 或 incompatible handling                      |
| Codex app `CAP-10.07-A01` startup               | `Unknown`  | unchanged + failure leaf  | safe runtime 被 pre-protocol state bootstrap 阻断                                                              |
| Codex app `CAP-10.08-A01` negotiation           | `Unknown`  | mapping review            | exhaustive schema 没有 bilateral version/server-capability exchange；初始化与 negotiation 应拆开               |
| Codex MCP `CAP-07.04-A01/A02`                   | `Unknown`  | unchanged                 | source tool inventory 可确认，但 runtime tools/list/canary 未执行                                              |

`CAP-10.07-A01` 的 Registry 合同明确是可复用的 long-running task service。ACP child
未 ready，故本轮 candidate 上限固定为 `Partial`，不能在该 Evidence 上升级为
`Supported`。

## 6. Cross-product Findings

### 6.1 Bootstrap state is part of the daemon contract

两款产品都不是“只启动一个无状态协议进程”：

- Qwen 在 controlled roots 中执行 settings migration、建立日志与 workspace runtime；
- Codex app-server 在 protocol 前初始化 Codex Home state runtime；
- Codex MCP 在 protocol 前加载 Codex Home config。

因此后续 daemon/SDK 比较必须增加可观察字段：

- config/state root 能否显式隔离；
- 首条协议消息前会读取/写入什么；
- 启动是否触发 background catalog/plugin/telemetry work；
- 空配置与损坏/拒绝 config 的失败语义；
- 是否有真正的 `--ignore-user-config` 或 disposable mode。

### 6.2 Same endpoint name does not imply same contract

- Qwen `/capabilities` 是 HTTP discovery descriptor；
- Codex app `initialize` 是 client identity/capability input；
- Codex MCP `initialize` 使用 MCP protocolVersion，但 source 只是 echo。

三者不能统一打勾为“协议协商”。应分别比较：

1. server descriptor discovery；
2. client metadata initialization；
3. bilateral version/capability negotiation；
4. incompatibility rejection/downgrade。

## 7. Formal Boundary

本阶段允许进入正式 relation 的只有直接 runtime observation：

- `EVD-qwen-code-RUNTIME-001/002`
- `EVD-codex-RUNTIME-004/005`

exact-commit source `EVD-codex-SOURCE-002/003` 必须保持独立 epistemic type。冻结
Phase 1C.2 的 30 Claims、62 relations 与 generated Markdown 本轮未修改。

## 8. Review Gate

| Gate                                                                 | Result |
| -------------------------------------------------------------------- | ------ |
| Frozen artifacts 与 binary/tarball hash 未漂移                       | Pass   |
| Qwen effective run 的 mandatory HTTP/cleanup assertions 13/13       | Pass   |
| Qwen invalid intermediate run 未进入 Evidence                        | Pass   |
| Qwen test escape 与 full-status spawn attempts 已披露                 | Pass   |
| Codex block 未伪装为 initialize/tools-list success                    | Pass   |
| Codex app/MCP envelope 未混用                                         | Pass   |
| Fact、runtime、exact-commit source 与 mapping inference 分离          | Pass   |
| 无模型、无真实 credential、无 external write                         | Pass   |
| profile 文件声明 deny remote IP network，且 hash 未漂移               | Policy-confirmed；未做 active remote canary |
| 当前产品源码与用户 dirty worktree 未修改                              | Pass   |
