# Phase 2E：Diagnostic Fault Matrix 方法

> 阶段：3 · 场景验证  
> 状态：Executed / Frozen  
> Frozen at：2026-07-26T15:14:28.190Z  
> Cohort：Codex `0.145.0`、Claude Code `2.1.212`、Qwen Code `0.21.0`  
> Raw artifact：[`diagnostic-fault-matrix.json`](./artifacts/phase-2e/diagnostic-fault-matrix.json)  
> Raw SHA-256：`12d72a25792809ddfacff558bf74e9bd24277745d5af3933c3d4c7790d056915`

## 1. 研究问题

`R1-3` 不问“谁有 doctor 命令”，而问 selected diagnostic entry 在可安全注入的本地
故障下能否给出：

1. 可机器读取的故障定位；
2. 可归因于目标 fixture、而不是外层 containment 的结果；
3. 明确的降级状态或 remediation；
4. 可记录的副作用边界。

三方入口与故障目标不同，因此本轮不把 `doctor`、interactive install doctor 与
daemon status 写成同构能力。

## 2. 执行矩阵

| Cell | Product | Fault | Entry | 判定门槛 |
| --- | --- | --- | --- | --- |
| `P2E-CODEX-BASELINE` | Codex | none | `doctor --json` | exact version、schema 与 checks 可解析 |
| `P2E-CODEX-MISSING-EXECUTABLE` | Codex | empty `PATH` | `git.environment` | 必须有同 profile 的可用受控 Git 对照 |
| `P2E-CODEX-BAD-CA` | Codex | invalid readable PEM | network checks | 必须出现明确的 custom-CA / PEM 解析错误 |
| `P2E-CODEX-CORRUPT-CACHE` | Codex | `version.json` 为 `{` | `updates.status` | 必须出现 `version cache parse` |
| `P2E-QWEN-BASELINE` | Qwen | none | `/daemon/status?detail=full` | exact version、full envelope 与 daemon state 可解析 |
| `P2E-QWEN-MISSING-EXECUTABLE` | Qwen | empty `PATH` | full preflight | Git/npm 必须返回 PATH-specific warning，且无 `EPERM` |
| `P2E-QWEN-UNWRITABLE-LOG` | Qwen | runtime `debug/` 为 `0555` | full daemon status | stderr-only + degraded + `init_failed` + public issue |

共 `7` 次 runtime execution。

## 3. 为什么 Claude Code 不执行

既有 exact-binary 证据显示：

- non-TTY `claude --bare doctor` 退出 `0`，stdout/stderr 为空，只创建本地配置和备份；
- interactive doctor 才是相关安装诊断入口，但可能执行 macOS `security` 并触碰
  Keychain。

当前授权明确禁止读取凭据。为得到对称表格而执行 PTY doctor 会越过停止线，因此
Claude 的四个 fault cell 均为 `Not assessed`，不是 `Not supported`。

## 4. 归因规则

### Codex

- 整体 `exit 1` 不能证明某个故障，因为 isolated baseline 已因无凭据、终端与
  deny-network checks 失败。
- 缺 Git 必须有同 profile 的正向对照。当前 profile 只允许执行 Codex，本身看不到
  system Git，因此即使 repo=true 且输出 “not found”，也不能归因给 empty `PATH`。
- bad CA 只接受明确的 PEM / `CODEX_CA_CERTIFICATE` 解析错误；普通 connect、DNS
  或 `EPERM` 不接受。
- corrupt cache 只接受 `updates.status.details["version cache parse"]`；普通
  `latest version probe` 错误不接受。

### Qwen

- `git` 与 `npm` 是本轮 PATH-sensitive cells；`ripgrep` 默认走 bundled absolute
  binary，不用它判 empty `PATH`。
- Git/npm 的正常缺失信号是 `warning` 与精确 `not found on PATH.` hint；`EPERM`
  表示 Seatbelt 污染。
- 主动设置 `QWEN_DAEMON_LOG_FILE=off` 会得到健康的 stderr-only，不属于故障。
  本轮通过不可写目录触发 `init_failed`。
- 不断言 daemon 顶层 `status`，因为独立的 preflight containment error 可把状态
  提升为 `error`。

## 5. Containment

- 子进程 environment 由 allowlist 构造，不继承用户 HOME、credential、proxy、
  endpoint 或 provider 配置；
- Codex deny network；Qwen 只允许 loopback bind/connect；
- Qwen 使用固定非秘密 bearer，不创建 session、不发送 prompt；
- 所有配置和 state 都在独立 `/private/tmp/ccq-phase2e-r1-*` run root；
- stdout/stderr 有界捕获，process group 有界关闭并验证消失；
- fixture 记录执行前后 mode、size 与 SHA-256；
- provider/model call、credential read 与 model cost 均为 `0`。

Containment 仍不是完整 syscall trace；process-group proof 不覆盖主动创建新 session
的 descendant。

## 6. 非终态尝试

- `P9XGrl` 与 `yLIFM8`：外层 sandbox 拒绝应用 Qwen loopback Seatbelt；未产生可用
  Qwen 行为证据。
- `Kxpjdd`：七个 runtime 执行完成，但 bad-CA classifier 仅凭环境字段即可通过，归因
  过宽；收紧为必须命中 PEM 解析错误后完整重跑。
- `E4Xvn1`：最终 run root；所有 gate 通过。

## 7. 停止线

1. `CAP-12.05-A02` 的三方 pairwise relation 仍为 `Not assessed`。
2. “无同构入口”不改写成产品不支持。
3. “诊断能发现故障”不等于能自动修复故障。
4. R2 model/provider 行为仍未授权，不因 Phase 2E 通过而解锁。

冻结输出：

- [`probes/07-phase-2e-diagnostic-fault-probes.md`](./probes/07-phase-2e-diagnostic-fault-probes.md)
- [`evidence/phase-2e-diagnostic-faults.md`](./evidence/phase-2e-diagnostic-faults.md)
- [`comparisons/phase-2e-diagnostic-faults.md`](./comparisons/phase-2e-diagnostic-faults.md)
- [`27-phase-2e-diagnostic-fault-results.md`](./27-phase-2e-diagnostic-fault-results.md)
- [`scripts/validate-phase-2e.mjs`](./scripts/validate-phase-2e.mjs)
