# Phase 2B：Comparison Delta 与 Open Probes

> 状态：Frozen  
> Frozen at：2026-07-26T09:57:00.687Z  
> Scope：E0 headless core + local diagnostics/config  
> Raw artifact SHA-256：`bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393`  
> Phase 2A dependency：Frozen at `2026-07-26T08:24:57Z`

## 1. Result Summary

| Metric                                                   | Result                                                     |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| Scenarios / product executions                           | `8 / 23`                                                   |
| Exact identity preflight                                 | `3/3 Pass`                                                 |
| Integrity / side-effect boundary / original PGID cleanup | `23/23 Pass`                                               |
| Truncated output / spawn error / stream hard-stop        | `0 / 0 / 0`                                                |
| Execution timeout                                        | `2`；均为 Codex non-empty argv/stdin 的 deny-network retry |
| Model-success execution                                  | `0`                                                        |
| New `runtime-comparable` Comparison Record               | `0`                                                        |
| Phase 2A frozen file modified                            | `0`                                                        |

Phase 2B 补上了 parser、empty EOF、missing credential/transport gate、doctor 与 config
failure 的 direct runtime Evidence，但没有闭合相同的成功 task outcome。因此 Phase 2A
的 observed relation 继续为 `Not assessed`；本阶段不生成 parity、Gap、优先级或
roadmap。

## 2. Additive Comparison Deltas

| Comparison Record       | Phase 2A state | Phase 2B direct observation                                                                               | Why relation remains `Not assessed`                             |
| ----------------------- | -------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `CMP-P2A-CAP-10.01-A01` | `surface-only` | 三产品均运行 non-TTY 失败 path                                                                            | 无成功 single-task final                                        |
| `CMP-P2A-CAP-10.02-A01` | `surface-only` | argv prompt 到达 Codex network transport、Claude/Qwen local auth gate                                     | authentication/transport gate 不对齐                            |
| `CMP-P2A-CAP-10.02-A02` | `surface-only` | 三 child stream 接受相同 67 bytes；empty EOF 行为不同                                                     | stream write 不等于产品/provider consumption                    |
| `CMP-P2A-CAP-10.03-A02` | `surface-only` | Claude complete 三行 no-auth JSONL lifecycle；Qwen 单一 terminal JSON document；Codex partial retry JSONL | Qwen incremental stream 与相同成功 terminal lifecycle 均未闭合  |
| `CMP-P2A-CAP-10.03-A03` | `surface-only` | 三产品都拒绝 malformed JSON schema                                                                        | Registry contract 要求 legal schema success/unsatisfied failure |
| `CMP-P2A-CAP-10.05-A04` | `surface-only` | Qwen result 只有 correlation，缺 category/stage/retryability；Claude Claim 版本不匹配                     | error taxonomy 与 Slice gate 未闭合                             |
| `CMP-P2A-CAP-12.05-A02` | `surface-only` | Codex 18-check doctor；Claude empty route；Qwen 无 exact standalone route                                 | diagnostic entry/output materially asymmetric                   |
| `CMP-P2A-CAP-12.09-A02` | `surface-only` | Codex strict reject；Qwen malformed recovery + unknown-key preservation                                   | strictness/entry 不对齐；type/cross-field fixture 未跑          |

详细结果：

- [`comparisons/phase-2b-headless-runtime.md`](./comparisons/phase-2b-headless-runtime.md)
- [`comparisons/phase-2b-diagnostics-and-config-runtime.md`](./comparisons/phase-2b-diagnostics-and-config-runtime.md)
- [`evidence/phase-2b-aligned-runtime.md`](./evidence/phase-2b-aligned-runtime.md)

## 3. Attempt Ledger

| Attempt | Artifact SHA-256                                                   | Disposition                   | Reason                                                                                                                 |
| ------- | ------------------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1       | `bd6afbb369ef6c71955d4ba3627a042a39cb487051923065cb1e9ae806af9d80` | Retained / invalid for freeze | functionally useful，但 profile 对 `/opt/homebrew` 与 temp metadata 读取过宽                                           |
| 2       | `7f72ac0930c8efcc810ed3739b89b16e51e3f26c6c77ab1e39787d084c7badb9` | Retained / invalid            | profile 过窄：Qwen dyld abort、Codex path ancestor failure、Claude global per-UID temp collision                       |
| 3       | `89b60df3adb719216761ff449e84dee6cf3aa1c08b77949aea1068145d3812ac` | Retained / invalid            | 7/7 Qwen execution 在 `llhttp` symlink metadata gate 前 SIGABRT                                                        |
| 4       | `77fcc71965704621fd8e91f4e24f0bcc3b2157b1717a388fe952b98d8c0d135e` | Retained / superseded         | 产品行为已跑通，但早于 identity preflight、materialized fixture、side-effect、stdin EPIPE 与 bounded cleanup hardening |
| Final   | `bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393` | Frozen                        | hardened runner/profile 完整重跑 23 executions；独立 gate Pass                                                         |

失败 attempt 只用于说明 harness 演进，不支持产品行为结论。

## 4. Frozen Harness Identity

| Object                 | SHA-256                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| runner                 | `ec8dcafc7c1b0f1b6e47a1f8cd2601af08b2ce5728471f1a1d524cd36bb8d175` |
| Seatbelt profile       | `ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6` |
| Node runtime manifest  | `88c1d0e37fa0c4d2cc8cf6e6cb92b468cbcd57adae71b44a7e3f276cbc8dd636` |
| OpenSSL runtime config | `a65a2cb9f4ee8ffdc7ef4f0ac600c0bdafb95b7b1ab457188ac610a62f5ad6b3` |

Containment proof 的边界：

- cleanup 只证明 original PGID；`setsid` / 新 PGID descendant 不在证明内；
- pre/post hash 不排除 execution 期间 modify-and-restore；
- inventory 是 persistent path/type/mode/size/content/symlink-target delta，不是 syscall
  trace，也不覆盖 xattr、ACL、mtime 或 inode；
- imported system profile 保留 Mach/XPC allowance，不是完整 host isolation；
- Node 第三方运行时按 18 个 pinned Homebrew formula `lib` roots allow/hash，不是
  23-file minimal dylib closure；递归 `otool -L` 未发现 manifest 外第三方 root。

## 5. Open Probe Backlog

这是 Evidence 顺序，不是产品 roadmap。

| Order | Probe family             | Required evidence                                                                | Risk / authorization                               |
| ----- | ------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| R2-1  | argv/stdin success       | 相同 provider/model/region、final `CCQ_OK`、usage、exit、side effects            | disposable account、endpoint allowlist、费用上限   |
| R2-2  | event/final JSON success | complete event lifecycle、terminal event、single final document                  | same                                               |
| R2-3  | legal output schema      | valid schema success + unsatisfiable legal schema failure；independent validator | same                                               |
| R1-1  | config schema matrix     | valid/type-error/unknown/cross-field-invalid；对齐 strictness gate               | 无凭据、无模型                                     |
| R1-2  | layered config source    | system/user/project 冲突与 effective source explanation                          | 无凭据、无模型                                     |
| R1-3  | diagnostic fault matrix  | 相同 missing executable、unwritable state、bad proxy/CA、corrupted cache         | containment-sensitive                              |
| R2-4  | machine error taxonomy   | 同一 transient/permanent error，验证 category/stage/retryability/correlation     | disposable provider or deterministic fake endpoint |

普通“可以继续”不被解释为读取现有凭据或消耗模型额度。所有 R2 probe 在专项授权前
保持 `Deferred`。

## 6. Review Gate

| Gate                                                                 | Result |
| -------------------------------------------------------------------- | ------ |
| Final artifact 绑定 exact runner/profile/product/runtime identity    | Pass   |
| 23 executions raw capture、integrity、boundary 与 cleanup 可独立校验 | Pass   |
| 6 条 Evidence Record 满足 frozen Methodology 完整 schema             | Pass   |
| Candidate Atomic 未自动形成 support edge                             | Pass   |
| Codex deny-network timeout 未写成 missing-auth terminal              | Pass   |
| Qwen empty EOF 未写成 empty-input consumption                        | Pass   |
| Phase 2A frozen Comparison Record 未被原地覆盖                       | Pass   |
| 未创建 parity、Gap、优先级、总分或 roadmap                           | Pass   |
