# Codex / Claude Code / Qwen Code 对比：Phase 2B Aligned Runtime 方法

> 阶段：2B · E0 Aligned Runtime Evidence  
> 状态：Frozen  
> Frozen at：2026-07-26T09:57:00.687Z  
> Raw artifact SHA-256：`bdbc65635d4e2ec454bd4bed03d5e29c82f97a6154f57dc28ebba00d167a5393`  
> 上游 cohort：Phase 2A Frozen at `2026-07-26T08:24:57Z`  
> 本轮范围：headless core + local diagnostics/config

## 1. 本阶段回答什么

Phase 2B 不扩大 Phase 2A 的产品或 Atomic 范围，只为 E0 comparison backlog
采集对齐的 runtime Evidence：

- 三产品 non-TTY 的 argv、stdin、空 EOF 与 invalid output schema gate；
- Codex / Claude Code 的 standalone doctor；
- 三产品在隔离配置根中的 malformed / unknown config 行为；
- stdout、stderr、exit、超时、文件副作用和 containment boundary。

Phase 2B 是 additive delta。Phase 2A 的冻结 Comparison Record 和历史 Claim
保持字节不变；本阶段只有在至少两个产品于同一 legal Atomic contract leaf 下闭合
相同 observable outcome 后，才允许创建新的 runtime comparison relation。

## 2. Exact Runtime Cohort

| Product / runtime | Version            | Frozen path                                                                               | SHA-256                                                            |
| ----------------- | ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Codex CLI         | `0.145.0` / latest | `/private/tmp/codex-phase0.XNx1jk/unpacked/package/vendor/aarch64-apple-darwin/bin/codex` | `1da3f4e0e96028b8a771814293c3033dafd1971f943f6c7e79b0897fe705f590` |
| Claude Code       | `2.1.212` / stable | `/private/tmp/ccq-phase1b-claude-2.1.212/package/claude`                                  | `09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574` |
| Qwen Code entry   | `0.21.0` / stable  | `/private/tmp/ccq-phase1b-qwen-0.21.0/package/cli-entry.js`                               | `1db9709bf1753611ca2fec234cf5adf517376efeb1540fcf9e309da010f9ed38` |
| Qwen Code bundle  | `0.21.0` / stable  | `/private/tmp/ccq-phase1b-qwen-0.21.0/package/cli.js`                                     | `4c05bdb0c903b8b18672cffb6d544b8f6bd96598a55dc1881f478b2ed945e4d1` |
| Node              | `25.9.0`           | `/opt/homebrew/Cellar/node/25.9.0_2/bin/node`                                             | `32e234a5b6bec67d72a016f2baadf7fadf3afd328470b395b73af473fdee0d85` |

动态读取边界另外锁定：

| Tree / archive                                                       | SHA-256                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Codex Darwin arm64 artifact tree                                     | `892f8a81f38ec7e2784938ef12fa6ef6a7bfe1cf5f757984f8c4288835e5f551` |
| Claude package tree                                                  | `c2e8651cd407e418b0af7c1cb22314ff9dd36f4ecf1da3016a9ba62d00774e62` |
| Qwen package tree                                                    | `a106a1332b3266bef53839a74fb10c7fb961bec59dd791adbe92cd502eae500e` |
| Qwen npm tarball                                                     | `62fa5ea404a8d1f694edc54446bbd4ca6d3a69e090ec5975977ff51918d2aeca` |
| pinned Node support file + allowlisted Homebrew dylib roots manifest | `88c1d0e37fa0c4d2cc8cf6e6cb92b468cbcd57adae71b44a7e3f276cbc8dd636` |
| pinned OpenSSL runtime config                                        | `a65a2cb9f4ee8ffdc7ef4f0ac600c0bdafb95b7b1ab457188ac610a62f5ad6b3` |

tree hash 按排序后的 relative path、type、mode、symlink target 和完整 file bytes
计算，避免只锁 `cli.js` 却遗漏 Qwen 动态 import 的 `chunks/*.js`。`/private/tmp`
artifact 在每次执行前重新计算 hash；PATH 中的其他版本不进入 cohort。runner 还要求
自身由上表的 Node 启动，并拒绝非 Darwin arm64 平台。
Node runtime manifest 将 `libnode.141.dylib` 锁到单个 file，不允许读取 Node
Cellar 中的 global packages；其余第三方依赖按 Homebrew formula `lib` root
锁定 `opt` alias、`realpath` 和实际 Cellar root。每次 Qwen execution 前后都
重新计算，避免 Seatbelt 允许的实际 dylib 集合与证据清单分离。

## 3. Fixed Fixture

| Input          | Exact value                                                                                                                      | SHA-256                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| argv prompt    | `CCQ_P2B_E0_ARGV_0001 Reply with exactly CCQ_OK. Do not use tools.`                                                              | `058abfaa80b848435a0b1127d7a5b5810065bcffd8f08fe008888b0811034efc` |
| stdin prompt   | `CCQ_P2B_E0_STDIN_0001\nReply with exactly CCQ_OK. Do not use tools.\n`                                                          | `c05f2c29798fcbbf49fab2d31c8b6c6dc5d95d72c7053b7e6feb0721f4cd373a` |
| invalid schema | `{"type":"object",`                                                                                                              | `80f67e7668b6730bba0e8221bcf48d90eb09e8cf528024b6560bd634757edfe4` |
| valid schema   | `{"type":"object","additionalProperties":false,"properties":{"probe":{"type":"string","enum":["CCQ_OK"]}},"required":["probe"]}` | `3fc2a34f2574158de4f0297dcbe7e4ecda10dde725e025027408939226b9047b` |

每个 execution 使用独立目录：

```text
/private/tmp/ccq-phase2b-safe-<run-id>/runs/<probe>/<product>/
├── repo/
│   ├── README.md
│   └── sentinel.txt
├── fixtures/
│   ├── invalid-schema.json
│   └── valid-schema.json
└── state/
    ├── home/
    ├── tmp/
    ├── config/
    └── product-specific-roots/
```

`repo/` 与 `fixtures/` 在 child 启动前设为只读；Seatbelt 只允许 `state/`
写入。runner 在 spawn 前逐文件验证 materialized hash/mode，并在结束后拒绝任何
位于 `state/` 之外的 inventory delta。runner 使用 argv array 和 `shell:false`，
不会让 shell 重解释输入。

## 4. Isolation 与 Safety Gate

- `/usr/bin/env -i` 等价的 allowlist environment；不继承 API key、OAuth、云凭据、
  proxy、provider、auth、telemetry 或用户产品配置；
- 独立 `HOME`、XDG roots、`TMPDIR` 与产品配置根；Claude 额外把
  `CLAUDE_CODE_TMPDIR` 指向该 execution 的 `state/tmp/claude`，不复用
  per-UID 全局临时目录；
- Claude Code 使用 `--bare`、关闭 updater/telemetry/非必要流量和 marketplace
  auto-install；Qwen Code 关闭 browser、preconnect、update、telemetry 和 Node
  compile cache；
- deny-default macOS Seatbelt；直接 network syscall 被拒绝；
- child 只能读取 frozen target tree、系统 runtime、精确 allowlist 的 pinned Node
  dylib roots、本次 probe root 与单个已锁 hash 的
  `/opt/homebrew/etc/openssl@3/openssl.cnf`；不开放其他
  `/opt/homebrew/etc` 内容或其他 Homebrew tree；
- persistent product writes 只允许本次 `state/`；`system.sb` 的 `/cores` create
  allowance 被显式 deny，标准 fd、`/dev/null` 等非持久 runtime I/O 不计入产品
  state；
- non-TTY；每例 15 秒 execution timeout；独立 process group 超时先收
  `SIGTERM`、再收 `SIGKILL`；17 秒时停止等待继承的 stdout/stderr pipe，
  18 秒内完成 original PGID 的 `kill(-pgid, 0)` bounded verification；
- stdout / stderr 按原始 byte 捕获并记录 base64、UTF-8 view、hash 与截断状态；
- 对整个 execution root 做前后 inventory；所有 regular file 不分大小均以 stream
  记录 SHA-256，symlink 记录 target，socket/FIFO/device 只记录类型、mode 与 size；
  保留 probe root 供复核。

inventory 只描述 persistent path/type/mode/size/content/symlink-target 前后差异，
不是 syscall trace，也不覆盖 xattr、ACL、mtime 或 inode。Node 第三方运行时边界是
18 个 pinned Homebrew formula `lib` roots（同时锁定 `opt` alias 与 Cellar
realpath），不是递归 `otool -L` 得到的 23-file minimal dylib closure。

profile 允许产品自身或 pinned Node 启动，不允许任意外部 command。自有 profile、
导入的 `system.sb` / `dyld-support.sb` 与 `SystemVersion.plist` 都在启动前校验
hash；runner 把 profile 复制为 probe-root 内的只读 frozen input，并在每个
execution 前后重算该 copy、目标产品 tree、相关 Node runtime、`sandbox-exec`
与系统 profile hash。任一 drift 都拒绝形成 artifact。pre/post hash 不能排除执行
期间“修改后恢复”的瞬时竞态，只用于非对抗性 drift 检测。

三产品 exact `--version` 是强制 preflight：任一 exit/signal/stdout/stderr 与冻结
identity 不一致时，runner 在其他 scenario 前整体中止。该 containment 只声明直接
filesystem、process-exec 和 network 边界；导入的
`system.sb` 仍保留平台 Mach/XPC allowance，因此不是完整 host isolation。独立
process group 也不能证明已 `setsid` 或另建 process group 的 descendant 被回收。
若 doctor 依赖 helper process，所得 `EPERM` 是 containment-induced gate，不能
写成普通 host 诊断结果。

## 5. Risk Split

| Wave       | Scope                                                                                           | Authorization                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Safe R0/R1 | identity、invalid schema、empty EOF、no-auth argv/stdin、empty doctor、malformed/unknown config | 本阶段执行；空凭据、禁网、无模型成功                                                         |
| R2 success | 成功 argv/stdin、final JSON、valid schema                                                       | Deferred；需要 disposable test account、provider/model/region、endpoint allowlist 与费用上限 |

“可以继续 Phase 2B”不被解释为允许读取现有凭据或消耗模型额度。R2 在专项授权前
保持 `Deferred`。

## 6. Projection Rules

1. no-auth probe 只证明 parser/input 入口到达哪个 authentication/provider/
   containment gate，不证明任务执行成功。
2. invalid schema rejection 只 qualifies schema parser/validation failure leaf，
   不证明 schema-constrained success。
3. empty EOF 只描述无输入时的 bounded exit/timeout 和通道，不证明非空 stdin
   已被 provider 消费。
4. Qwen `CAP-10.05-A04` 只有在 stdout 是完整可解析 JSON/JSONL，且错误对象同时
   给出 category、stage、retryability 和 run correlation 时，才允许形成 support
   statement；仅有终态 error label、category 或 session ID 都不够。
5. Claude Code `2.1.212/stable` 不投影 `CAP-10.05-A04`；该 Claim 当前绑定
   `2.1.220/latest`，不得跨版本回填。
6. Qwen 没有本 cohort 的 standalone doctor execution。这个 command-shape
   asymmetry 记录为 gate，不推断它没有诊断能力。
   malformed/unknown user settings 通过 `--list-extensions` 在
   authentication/model 前退出，避免用 headless prompt 代替配置诊断。
7. `P2B-E0-IDENTITY` 是 cohort preflight，不产生
   `CAP-01.03-A02` Evidence edge；单次 `--version` 不能证明重复安装确定性。
8. stderr text、exit code 或文件名关键字不能单独升级 Atomic support。
9. 未闭合相同成功 outcome 的 Phase 2A Record 保持 `Not assessed`。
10. runner 中的 Atomic ID 只是 `candidateAtomics`，并记录本 probe 可限定的
    `candidateDimensions`；实际 qualified dimensions 由后续 validator 按 raw
    outcome 判定，safe wave 自身不创建 support edge。

## 7. Frozen Outputs

- [`probes/04-phase-2b-aligned-runtime-probes.md`](./probes/04-phase-2b-aligned-runtime-probes.md)
- [`artifacts/phase-2b/safe-wave.json`](./artifacts/phase-2b/safe-wave.json)
- [`evidence/phase-2b-aligned-runtime.md`](./evidence/phase-2b-aligned-runtime.md)
- [`comparisons/phase-2b-headless-runtime.md`](./comparisons/phase-2b-headless-runtime.md)
- [`comparisons/phase-2b-diagnostics-and-config-runtime.md`](./comparisons/phase-2b-diagnostics-and-config-runtime.md)
- [`18-phase-2b-comparison-deltas-and-open-probes.md`](./18-phase-2b-comparison-deltas-and-open-probes.md)
- [`scripts/validate-phase-2b.mjs`](./scripts/validate-phase-2b.mjs)

freeze 锁定 runner
`ec8dcafc7c1b0f1b6e47a1f8cd2601af08b2ce5728471f1a1d524cd36bb8d175`、
profile
`ff5f599cad03d5c257827314c5a483e3cffaa2fef2d7b70a433e376ad1c700e6`
与 raw artifact hash。validator 重算冻结文件、raw stream 与 artifact hash，并核验
每个 execution 记录的 before/after identity、fixture、network policy、只读 fixture、
process cleanup 与 bounded projection 门禁。
