# Codex / Claude Code / Qwen Code 对比：Phase 2C 配置 Schema 方法

> 阶段：2C · R1-1 Config Schema Matrix  
> 状态：Frozen  
> Frozen at：2026-07-26T12:43:43.496Z  
> Atomic：`CAP-12.09-A02`  
> Raw artifact：[`config-schema-matrix.json`](./artifacts/phase-2c/config-schema-matrix.json)  
> Raw SHA-256：`37e6d06dd6ac34cf5dab1de179568f1d5495f669d77ebab365e76148f3dd36b8`

## 1. Scope

Phase 2C 只执行 Phase 2B backlog 的 `R1-1`：

- 对三产品分别构造 valid、known-field type error、unknown top-level field、
  cross-field invalid 四类配置；
- 在固定版本、固定 layer 和无模型入口中观察配置是接受、拒绝、忽略还是保留；
- 捕获精确 stdout、stderr、exit、配置文件前后 hash 和本地副作用；
- 判断 `CAP-12.09-A02` 的 exact-runtime overlap 与差异。

本阶段不覆盖 system/user/project precedence、effective source 的跨层冲突、
完整 schema coverage、schema identity/version、配置自动修复、provider/model 成功或
R2 费用路径。因此本轮完成四类 fixture matrix，但不宣称
`CAP-12.09-A02` 或 Phase 2B `R1-1` 已完全闭合。

## 2. Atomic Contract

`CAP-12.09-A02` 的中立用户任务是“按 schema 验证配置”，observable outcome 是：

> 给定配置，未知字段、类型错误和非法组合在运行前被精确定位。

Required dimensions：

```text
ENTRY, INPUT, AVAIL, STATE, OUTPUT, FAIL, SEC, OBS
```

四类 fixture 是 category-aligned，不是 byte-identical。三产品字段和条件约束不同，
因此每个 fixture 必须是该产品真实 schema/consumer 中的已知字段或真实非法组合。

## 3. Exact Cohort

| Product / runtime | Version            | Frozen object                                                                              | SHA-256                                                            |
| ----------------- | ------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Codex CLI         | `0.145.0` / latest | Darwin arm64 binary                                                                        | `1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590` |
| Claude Code       | `2.1.212` / stable | package binary                                                                             | `09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574` |
| Qwen Code entry   | `0.21.0` / stable  | `cli-entry.js`                                                                             | `1db9709bf1753611ca2fec234cf5adf517376efeb1540fcf9e309da010f9ed38` |
| Qwen Code bundle  | `0.21.0` / stable  | `cli.js`                                                                                   | `4c05bdb0c903b8b18672cffb6d544b8f6bd96598a55dc1881f478b2ed945e4d1` |
| Qwen Node runtime | `25.9.0`           | `/opt/homebrew/Cellar/node/25.9.0_2/bin/node`                                               | `32e234a5b6bec67d72a016f2baadf7fadf3afd328470b395b73af473fdee0d85` |
| Harness           | —                  | [`run-phase-2c-config-probes.mjs`](./scripts/run-phase-2c-config-probes.mjs)                | `fd19b1a4ce4ceb9944591e8c88d4ceb1c5435f59c32a6984dd969b637662062a` |
| Seatbelt profile  | —                  | [`phase-2c-cli.sb`](./scripts/phase-2c-cli.sb)                                              | `ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6` |

Runner 还锁定三产品完整发行 tree、Qwen npm tarball、Node runtime roots、
OpenSSL config、系统 sandbox profile 与 `sandbox-exec`。每次 execution 前后重算
对应 identity。

## 4. Product-local Entry

### Codex

```text
codex --strict-config exec
  --skip-git-repo-check
  --ephemeral
  --sandbox read-only
  --color never
  --json -
```

stdin 是 0 bytes 后 EOF。Valid 配置到达本地 `No prompt provided via stdin.`
gate；invalid 配置在该 gate 前失败。`--strict-config` 是 unknown-field rejection
的必要条件，不能外推到 non-strict startup。

### Claude Code

```text
claude
  --bare
  --settings <fixture>
  --setting-sources ""
  --print
  --input-format stream-json
  --output-format stream-json
  --verbose
  --permission-mode plan
  --tools ""
  --no-session-persistence
```

stdin 只发送一个 85-byte `get_settings` control request 后 EOF：

```json
{"type":"control_request","request_id":"cfg-1","request":{"subtype":"get_settings"}}
```

它不发送 user message，不产生 model turn；结果是单条 `control_response`。
`--setting-sources ""` 隔离普通 user/project/local source，explicit flag source 仍
参与；managed policy 不是由该 flag 禁用，最终 Seatbelt/read boundary 继续隔离宿主
policy 文件。

### Qwen Code

```text
node <frozen-cli-entry> --list-extensions
```

该入口在 settings load 后、provider/model 前退出。它不会初始化 HookRegistry，
因此 cross-field fixture 的结果只证明 startup/load route 是否拒绝，不能代表所有
consumer。

## 5. Fixture Design

| Category            | Codex                                                                                   | Claude Code                                                                                             | Qwen Code                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| valid               | boolean `check_for_update_on_startup` + `sandbox_mode="read-only"`                      | string `model`                                                                                          | boolean `general.vimMode`                                                                  |
| type error          | boolean field receives string                                                           | string field receives number                                                                            | boolean field receives string                                                              |
| unknown             | `phase2c_unknown_key`                                                                   | `phase2cUnknownKey`                                                                                      | `phase2cUnknownKey`                                                                         |
| cross-field invalid | MCP stdio `command` combined with HTTP-only `url`                                       | settings-sourced marketplace record key `alpha` conflicts with nested source name `beta`                | command hook has `type:"command"` but omits the conditionally required `command`            |

所有 primary fixture 都以 exact bytes、SHA-256 和 mode `0444` 物化。Qwen 的
system、system-defaults、trusted-folders、MCP-approvals 四个辅助配置也分别锁 hash、
设为 `0444`，避免 layer 输入未被冻结或 migration 干扰结果。

## 6. Safety and Capture

- child environment 从空对象构造，不继承 credential、proxy、endpoint 或用户配置；
- 不复制 API key、OAuth、keychain 或 provider credential；
- deny-default Seatbelt，`network*` 全拒绝；
- 每个 execution 使用独立只读 repo 与独立 `state/`；
- persistent write 只允许本 execution 的 `state/`；
- non-TTY，15 秒 timeout，原 process group 以 `SIGTERM` / `SIGKILL` 有界清理；
- stdout/stderr 保存 raw base64、UTF-8、byte count、SHA-256 和 truncated flag；
- 配置 fixture 在执行前后按 type、mode、SHA-256 精确复核；
- runner output 固定为本阶段 artifact；拒绝 symlink/hardlink output 与 protected input
  overlap。

该 containment 不是完整 host isolation：导入的系统 profile 仍有 Mach/XPC
allowance；inventory 不是 syscall trace；pre/post hash 不能排除瞬时
modify-and-restore；PGID 检查不覆盖另建 session/process-group 的 descendant。

## 7. Projection Rules

1. Valid 只证明 selected loader/entry 接受并到达下一个本地 gate。
2. Codex unknown rejection 只绑定 `--strict-config`。
3. Claude unknown passthrough 只绑定 normal explicit flag loader，不覆盖 strict 或
   managed-policy validation path。
4. Qwen type/cross acceptance 是 bounded negative：证明 `--list-extensions` 的
   startup loader 没有递归执行内部 settings schema；不证明后续 consumer 接受。
5. Qwen unknown 只证明 command 正常完成且 fixture 在磁盘上保持不变，不把它写成
   effective in-memory preservation。
6. Valid acceptance 与 unknown non-rejection 都不是
   `CAP-12.09-A02`“精确定位 invalid config”的正向 observable criterion；未观察到
   Qwen consumer-level validation 时，含 Qwen 的 pairwise alignment 保持
   `Unknown`。
7. Runner 的 `candidateAtomics` 不自动创建 support edge；结论由 raw artifact 和独立
   validator 决定。
8. R1-1b schema identity/version、R1-2 layering 与所有 R2 success/cost probe
   保持 Deferred。

## 8. Frozen Outputs

- [`probes/05-phase-2c-config-schema-probes.md`](./probes/05-phase-2c-config-schema-probes.md)
- [`artifacts/phase-2c/config-schema-matrix.json`](./artifacts/phase-2c/config-schema-matrix.json)
- [`evidence/phase-2c-config-schema.md`](./evidence/phase-2c-config-schema.md)
- [`comparisons/phase-2c-config-schema-runtime.md`](./comparisons/phase-2c-config-schema-runtime.md)
- [`20-phase-2c-config-schema-results-and-open-probes.md`](./20-phase-2c-config-schema-results-and-open-probes.md)
- [`scripts/validate-phase-2c.mjs`](./scripts/validate-phase-2c.mjs)
