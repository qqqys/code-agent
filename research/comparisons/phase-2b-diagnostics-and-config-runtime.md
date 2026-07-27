# Phase 2B：Diagnostics 与 Config Runtime 对比

> Cohort：Codex `0.145.0/latest`、Claude Code `2.1.212/stable`、Qwen Code `0.21.0/stable`  
> Evidence：[`phase-2b-aligned-runtime.md`](../evidence/phase-2b-aligned-runtime.md)  
> Raw artifact SHA-256：`bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393`

## 1. Diagnostic Entry Matrix

| Product     | Entry in this wave                                        | Empty isolated result                                       | Visible diagnostic contract                                                             | State side effects                                               |
| ----------- | --------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Codex       | `doctor --json`                                           | exit `1`；JSON `schemaVersion=1`；18 checks；overall `fail` | 13 `ok`、3 `fail`、2 `warning`；check 具 id/category/status/summary/details/remediation | 创建 isolated CODEX_HOME helper tmp、lock 与 self-target symlink |
| Claude Code | `--bare doctor`                                           | exit `0`；stdout/stderr empty                               | 本 route 无可见 check 或 remediation                                                    | 创建 `.claude.json` 与 backup                                    |
| Qwen Code   | frozen Help 无 exact standalone doctor；本轮不伪造 parity | not applicable                                              | config probes 通过 settings-loading 后的 `--list-extensions` 执行                       | 创建 extension store；system/default settings migration          |

Codex 的 18 checks 覆盖 app-server、auth、config、git、installation、MCP、network、
runtime、sandbox、state、system、terminal 与 updates。Auth、provider reachability 与
`TERM=dumb` 是 fail；其中 network 和 terminal 结果受本轮 containment/non-TTY
fixture 直接影响。

Claude 的 empty output 只能证明本 exact invocation 没有可见诊断，不能写成“环境
健康”“doctor 成功完成检查”或“没有诊断能力”。

## 2. Config Fixture Matrix

| Fixture               | Codex                                                                                                                      | Claude Code                                          | Qwen Code                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| malformed config      | doctor exit `1`；JSON `config.load=fail`；note `failed to load Codex config`；给出 rerun remediation，但不定位 parser line | explicit `--settings`；exit `0`；stdout/stderr empty | stderr warning；备份原文件为 `.corrupted`；reset + migrate 为 `$version:4`；exit `0` |
| unknown top-level key | `--strict-config exec` 在任务启动前 exit `1`；定位 file、`1:1` 和字段名                                                    | explicit `--settings`；exit `0`；stdout/stderr empty | `--list-extensions` exit `0`；stdout 正常；stderr empty；unknown user key 保留       |

三产品 entry 不完全对称：

- Codex unknown-key 路径显式启用 `--strict-config`；
- Claude 只有 explicit settings route 的可见结果；
- Qwen 选择 `--list-extensions`，因为它在 settings load 后、auth/model 前退出。

因此本矩阵可以描述 gate 差异，但不能直接判 schema-validation parity。

## 3. Side-effect Semantics

### Codex

- Empty/malformed doctor 和 strict startup 都创建 CODEX_HOME 下的 argument helper
  directory、empty lock 与指向 frozen binary 的 `apply_patch` / `applypatch` /
  `codex-execve-wrapper` symlink。
- Malformed doctor 继续执行一组无需完整 config 的检查；unknown strict startup 则在
  config error 后不进入 headless task。

### Claude Code

- 三个 doctor/config execution 都创建 isolated `.claude.json` 及 timestamped
  backup；
- malformed 与 unknown explicit settings 都没有 stdout/stderr diagnostic；
- side effect 证明 CLI startup 执行过，不证明 explicit settings 被接受、拒绝或
  用于 doctor 结果。

### Qwen Code

Malformed user settings：

- 原始 `{\n` 原样保存到 `settings.json.corrupted`；
- user、system settings 和 system defaults 最终为格式化的
  `{"$version":4}`；
- warning 明示 reset 和 backup path。

Unknown user settings：

- `{"$version":4,"phase2bUnknownKey":true}\n` 保持不变；
- 没有 visible warning/rejection；
- system settings/defaults 从 `{}` 迁移为 `$version:4`；
- 两个 fixture 都创建空 extension store 与 enablement state。

“无 visible warning”只绑定本版本、本 user scope 与 `--list-extensions` entry；
debug logger、其他 scope 或其他 consumer 仍是 unknown。

## 4. Atomic Comparison Delta

| Atomic          | Phase 2A state | Phase 2B bounded delta                                                                       | Current relation                                 |
| --------------- | -------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `CAP-12.05-A02` | `surface-only` | Codex itemized runtime doctor 已闭合；Claude route empty；Qwen 无 exact standalone route     | `Not assessed`；entry/output gate asymmetric     |
| `CAP-12.09-A02` | `surface-only` | Codex malformed/unknown rejection 与 Qwen malformed recovery/unknown preservation 已直接观察 | `Not assessed`；strictness/entry gate asymmetric |

本轮不把 `CAP-12.05-A02` 升为跨产品 relation：只有 Codex 闭合“逐项检查 + actionable
remediation”子句。也不把 Qwen unknown-key 结果写成产品级“不支持 schema
validation”；它只是选定 startup route 的 bounded negative。

## 5. Qwen Code 视角的已观察差异

这些结论不包含产品优先级：

- malformed JSON 采用“备份 → 重置 → schema version migration → 继续命令”的
  recoverable flow；
- unknown user key 在本 entry 中被保留且无 visible warning，与 Codex strict reject
  不同；
- `--list-extensions` 即使无 extension，也会创建 extension store，并可能迁移
  system/default settings；
- 当前 CLI 没有与 Codex `doctor --json` 同 command shape 的 standalone 输出；
  这不等同“没有诊断能力”。

## 6. Required Next Evidence

1. `CAP-12.09-A02`：统一 valid、type-error、unknown-key、cross-field-invalid fixture，
   并显式对齐 strictness gate；
2. `CAP-12.09-A01`：system/user/project 多层冲突，输出 effective value、source 与
   precedence；
3. `CAP-12.05-A02`：相同 missing executable、unwritable state、bad proxy/CA 与
   corrupted cache fixture；
4. 逐项区分“检测”“自动修复”“仅迁移”副作用；
5. 若要比较 Qwen 的诊断能力，应选择真实 Qwen diagnostic entry，而不是把
   `--list-extensions` 包装成 doctor。
