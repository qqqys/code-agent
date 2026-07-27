# Codex / Claude Code / Qwen Code 对比：阶段 1D.1 Coverage 与 Open Claims

> 阶段：1D.1 · Registry / Claim Correction  
> 状态：Frozen  
> Frozen at：2026-07-26T07:51:04Z  
> Registry：Revision 2，144 topics / 550 Atomic Capability Records  
> Evidence boundary：2026-07-26T05:23:52Z

## 1. Current Secondary-Surface Snapshot

| Product     | Claims | Supported | Partial | Not supported | Unknown |
| ----------- | -----: | --------: | ------: | ------------: | ------: |
| Codex       |     11 |         0 |       0 |             0 |      11 |
| Claude Code |      0 |         0 |       0 |             0 |       0 |
| Qwen Code   |     27 |         3 |       2 |             1 |      21 |
| **Total**   | **38** |     **3** |   **2** |         **1** |  **32** |

| Metric                                         | Count |
| ---------------------------------------------- | ----: |
| Phase 1C.2 historical Claims                   |    30 |
| Current Phase 1D.1 Claims                      |    38 |
| Stable Claim IDs carried forward               |    29 |
| Superseded historical Claim IDs                |     1 |
| New current Claim IDs                          |     9 |
| Historical Phase 1C.2 relations                |    62 |
| Current Phase 1D.1 relations                   |    75 |
| Current required contract leaves               |   499 |
| Phase 1D Evidence Records formalized           |     6 |
| New Phase 1D Evidence relations                |    12 |
| Existing Evidence relation newly added for A04 |     1 |

这些数字是当前 exact Slice 的证据覆盖，不是三产品得分。Claude Code 为 0 表示本阶段
没有锁定可准入的 secondary artifact/runtime Claim，不表示产品没有 secondary
Surface。

## 2. Runtime 与 Confidence

| Product     | Reproduced | Not reproduced | Not tested |  High | Medium |   Low |
| ----------- | ---------: | -------------: | ---------: | ----: | -----: | ----: |
| Codex       |          4 |              2 |          5 |     0 |     11 |     0 |
| Claude Code |          0 |              0 |          0 |     0 |      0 |     0 |
| Qwen Code   |          5 |              0 |         22 |     2 |     25 |     0 |
| **Total**   |      **9** |          **2** |     **27** | **2** | **36** | **0** |

`Reproduced` 只描述对应 Claim 的有界 runtime statement。Qwen A04 已复现成功
descriptor，但 route-specific failure/security contract 未覆盖；A12.07 只闭合
graceful parent/listener cleanup，所以两者保持 `Partial`。A10.07 没有 task/session
证据，即使 contained management-route statement 已复现，support state 仍是
`Unknown`。A12.02 的 current-run 日志定位和 A12.05 的 readiness 可直接闭合；
A12.02 因未覆盖 session/time-range/redaction 边界而保持 Medium confidence。

Codex host/schema Claim 与 contained startup Claim 同时保留：前者不因后者失败而改写
Slice。两个实际 startup 目标在 containment 下为 `Not reproduced`。App-server
A05-002 的 initialize 没有发送，保持 `Not tested`；MCP harness 已写入 initialize
line，但 server 是否读取未证明。这些结果都不构成 `Not supported`。

## 3. Corrected Conclusions

- `/capabilities` discovery 与 bilateral capability negotiation 是两个 Atomic；
  Qwen 可以同时满足 A04 的成功 descriptor outcome，并在 exact 0.21.0 文档切片下对
  A01 保持 scoped `Not supported`。
- Codex `initialize` schema 和 exact source 属于 A05 client initialization，不再
  被展示成 A01 negotiation。
- Codex app/MCP 在本轮只建立 startup prerequisite/failure leaves；没有
  initialize response、MCP tools/list 或正常 EOF runtime。
- Qwen runtime 直接支持 health/readiness 和 persistent log Claims；listener/drain
  只支持单独的 graceful-cleanup 子句，不证明 task service。
- 同一 Claim ID 不再从 host 改绑到 contained Slice；不同 gate 的 runtime 事实使用
  独立 Claim。
- Phase 1D 没有验证任何真实 session、prompt、model/provider、MCP call、channel
  delivery 或外部写入。

## 4. Open Claim Register

这里的 `Evidence order` 只表示下一轮证据采集先后，不是 Gap、产品投资或 roadmap
优先级。

| Evidence order | Product / Surface         | Open question                                                                       | Required next evidence                                                                    | Risk  |
| -------------- | ------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----- |
| E0             | Codex app-server          | 正常 isolated Codex Home 下 initialize、missing/repeat init、unknown method 与 EOF  | 独立 OS user/VM，或专项允许的产品原生 disposable config root；no IP network；exact binary | R1    |
| E0             | Codex MCP                 | runtime initialize、tools/list、unknown-tool canary 与 EOF                          | 同上；严格禁止合法 `codex` / `codex-reply` call                                           | R1    |
| E1             | Qwen daemon               | `/capabilities` 自身的无/错 bearer、malformed request 与 unavailable failure matrix | 同一 frozen harness 的 route-specific negative assertions                                 | R1    |
| E1             | Qwen daemon               | ACP preheat ready、session create/prompt/cancel 与 cleanup                          | 无真实 credential 的 fake/test provider；否则需测试身份、预算与 R2 approval               | R1/R2 |
| E1             | Qwen daemon               | SSE ordering、cursor/replay gap、reconnect 与 two-client ownership                  | fixture session、two clients、bounded ring；先闭合 session identity                       | R1/R2 |
| E1             | Qwen daemon               | crash、legacy child/listener 与 failed-cleanup warning                              | disposable process tree、exact PID allowlist、hard timeout                                | R4    |
| E1             | Codex / Qwen SDK、CI、IDE | 独立 package、Action、extension/client build identity 与 runtime                    | registry artifact integrity、immutable Action SHA、per-client build lock                  | R0/R1 |
| E1             | Claude secondary          | SDK、CI、remote client exact artifact identity                                      | frozen Python/TS packages、Action SHA、client build；随后再设计 runtime probe             | R0/R1 |

## 5. Deferred, Not Negative

以下项目继续是 `Unknown` 或无 Claim，不得被矩阵渲染为“不支持”：

- Codex 正常 app-server/MCP handshake 和可用工具；
- Qwen daemon 的 session、SSE、ownership、reconnect、task cancellation；
- 三产品独立 SDK/IDE/Desktop/Web/CI artifact 的未锁定切片；
- Claude Code secondary Surface 的 current docs-only 候选；
- 任一产品未执行的套餐、登录、region、provider/model 组合。

## 6. Review Gate

| Gate                                                                    | Result |
| ----------------------------------------------------------------------- | ------ |
| Registry 拆分不使用产品专有名词定义用户任务                             | Pass   |
| Phase 1C.2 历史快照未被 current projection 覆盖                         | Pass   |
| 38 Claims / 75 relations / 499 required leaves 可由生成文件重新计算     | Pass   |
| Support delta 只来自 direct runtime relation 或 exact scoped negative   | Pass   |
| Codex containment block 未被写成产品不支持                              | Pass   |
| Qwen test escape 未外推到 session/task/model 能力                       | Pass   |
| host 与 contained Slice 不复用同一 Claim ID                             | Pass   |
| 历史 Qwen recorded channel 保持 `stable`，current effective 为 `latest` | Pass   |
| formatter、generator idempotency、link 与 hash gate                     | Pass   |

## 7. Proposed Next Gate

Phase 1D.1 冻结后，再进入 topic-by-topic 横向 Comparison。第一批建议从
`CAP-10`（headless/daemon/SDK/CI）与 `CAP-12`（diagnostics/reliability）开始，因为
它们已有较高密度的 exact runtime Evidence；仍然先写行为差异，不直接生成 Qwen Gap
或 roadmap。
