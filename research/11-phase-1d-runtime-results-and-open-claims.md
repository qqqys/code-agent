# Codex / Claude Code / Qwen Code 对比：阶段 1D Coverage 与 Open Claims

> 阶段：1D · Secondary Surface Runtime Probe  
> 状态：Reviewing  
> Evidence boundary：2026-07-26T05:23:52Z

## 1. Coverage

| Metric                                         | Count |
| ---------------------------------------------- | ----: |
| Planned high-value probes attempted            |     3 |
| Runtime reproduced                             |     1 |
| Blocked by containment before protocol result  |     2 |
| Model/provider API calls                       |     0 |
| External-system writes / messages / installs   |     0 |
| Qwen mandatory assertions                      | 13/13 |
| New runtime Evidence Records                   |     4 |
| New exact-commit source Evidence Records       |     2 |
| Phase 1C.2 formal Claims changed               |     0 |
| Phase 1C.2 formal relations changed            |     0 |

“1 reproduced / 2 blocked” 不是产品得分。Qwen probe 使用了产品专用 root 与
test-only no-preheat gate；Codex probe 遵守不改 home/Codex Home 的更严格边界，
所以两者的 environment delta 不等价，不能据此断言 Qwen daemon 比 Codex daemon
更可用。

## 2. Closed Questions

### Qwen

- daemon 可以在 loopback ephemeral port 启动并进入 runtime route；
- `/health` 与 unknown route 的无/错 bearer 请求返回 `401`；status 等其余 route
  只完成正确 bearer 正向调用；
- shallow health、bootstrap readiness、runtime readiness 与 shutdown unavailable
  可区分；
- exact runtime 返回 Qwen `0.21.0`、protocol `v1` 与 99 feature tags；
- summary/full status、invalid detail 与 unknown route 具有不同结果；
- persistent daemon log 可定位并关联 run/PID/workspace/routes；
- graceful SIGTERM 回收 parent/listener，exit `0`；
- empty settings 会发生 version migration；
- full diagnostics 会尝试执行本机 dependency preflight。
- contained runtime 记录了 ambient runtime env 文件不可读 warning。

### Codex

- app-server 在首条协议 response 前报告 Codex Home SQLite state runtime
  初始化失败；
- MCP server 在 initialize response 前报告 Codex Home config 不可读；
- deny-default profile 下两者均明确失败并 exit `1`；harness 写入 stdin 不证明服务已
  读取或处理 request；
- app-server wire 没有 protocolVersion/server-capabilities negotiation；
- MCP 与 app-server 使用不同 JSON envelope；
- exact-commit MCP 只有两个静态工具入口，但 frozen runtime 尚未 tools/list。

## 3. Open Claim Register

| Priority | Product / Surface | Open question                                                                 | Required next evidence                                                                                  | Risk |
| -------- | ----------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---- |
| P0       | Codex app-server  | empty isolated Codex Home 下 initialize、repeat init、unknown method 与 EOF   | 独立 OS user/VM，或用户专项同意产品原生 disposable config root；no IP network；exact binary             | R1   |
| P0       | Codex MCP         | runtime tools/list、schema hash、unknown-tool canary 与 EOF                    | 同上；严格禁止合法 `codex`/`codex-reply` call                                                           | R1   |
| P0       | Registry          | `CAP-10.08-A01` 是否拆为 descriptor、client init、bilateral negotiation       | product-neutral Registry Revision 2 proposal；三产品 existing Claim migration map                       | R0   |
| P1       | Qwen daemon       | ACP preheat ready、session create/prompt/cancel 与 cleanup                     | 无真实 credential的 fake/test provider 如存在；否则测试身份、预算与 R2 approval                         | R1/R2 |
| P1       | Qwen daemon       | SSE ordering、cursor、replay gap、reconnect、two-client ownership             | fixture sessions；two clients；bounded ring；先完成 session identity probe                               | R1/R2 |
| P1       | Qwen daemon       | crash/legacy child/listener detection 与 failed-cleanup warning                | disposable process tree；kill/crash fixture；hard timeout；不得影响非-probe PID                          | R4   |
| P1       | Qwen daemon       | full-status preflight 的 process/network side-effect contract                  | allowlisted fake binaries or stub PATH；仍禁 remote network；分开 dependency check 与 provider check     | R1   |
| P1       | Codex SDK/CI/IDE  | package/action/client exact artifact identity                                  | registry package、immutable Action commit、extension/client build lock                                   | R0   |
| P1       | Qwen SDK/CI/IDE   | three SDK artifacts、Action commit 与 extension build identity                 | npm/PyPI/Maven metadata + integrity；Action SHA；per-client build                                         | R0   |
| P1       | Claude secondary | SDK/CI/remote client exact artifact identity                                   | Python/TS registry artifacts；Action SHA；web/mobile client build                                         | R0   |

## 4. Formal Claim Disposition

### Ready for a Phase 1D.1 generator revision

- Qwen health/readiness runtime leaves；
- Qwen daemon log path/persistence/observability leaves；
- Qwen listener/parent cleanup bounded leaves；
- Codex app/MCP startup failure leaves；
- Codex app initialize schema wording correction；
- Codex MCP source-level tool inventory qualifier。

### Not ready

- Qwen session、prompt、SSE、MCP、provider/model；
- Codex initialize response、tools/list 或 any tool-call runtime；
- any SDK language package behavior；
- any IDE/Desktop/Web client behavior；
- any CI/IM external side effect；
- cross-product support ranking 或 Qwen Gap priority。

## 5. Proposed Next Gate

在进入 topic-by-topic 横向 Comparison 前，建议先做一个很小的
`Phase 1D.1 Registry/Claim correction`：

1. 将 `CAP-10.08-A01` 拆解建议写成 product-neutral Revision 2 草案；
2. 让 generator 吸收 Qwen 两条 runtime Evidence 与 Codex 两条 failure Evidence；
3. 不改变 session/SSE/model 等未测试 Claim；
4. 独立 validator 检查 support-state delta 只发生在有 direct runtime relation 的
   Atomic。

Codex 正常 handshake 可与该修订并行等待隔离决策；不能用 source 预期值代替
runtime。

## 6. Review Gate

| Gate                                                     | Result |
| -------------------------------------------------------- | ------ |
| 3 个 planned probes 均有 terminal result                 | Pass   |
| Blocked 结果保留 exact stderr/exit/side-effect inventory | Pass   |
| 无 unknown runtime 被填为 Supported                      | Pass   |
| 下一步区分 R0/R1/R2/R4                                  | Pass   |
| 未进入 Comparison、Gap、Backlog 或 roadmap               | Pass   |
