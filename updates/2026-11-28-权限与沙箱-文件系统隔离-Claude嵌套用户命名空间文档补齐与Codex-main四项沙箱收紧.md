# 文件系统隔离：Claude Code `sandbox.allowNestedUserNamespaces` 官方双页补齐（四项未确认全部落地）；Codex main 四个未发布提交收紧 Linux 与 Windows 沙箱文件边界；同轮把 Qwen／Kimi／Qoder 的沙箱证据坐标前移

日期：2026-11-28
能力字段：`security-filesystem`（权限与沙箱 · 文件系统隔离）

## 本次改动

每日研究在核对五个产品 2026-11-28 前后的官方文档、更新日志、Release 与仓库提交时，发现两条直接改变 `security-filesystem` 既有结论的一手材料，都落在同一个子话题「OS 级文件系统边界的强度与削弱开关」上：

- Claude Code 的 `sandbox.allowNestedUserNamespaces` 此前只有 v2.1.305 更新日志一处来源，本字段旧条件项逐字写「核对日期的官方 Sandboxing 页全文没有该词、Settings 参考索引表也没有该行」，因此取值集合、默认值、可写作用域与最低版本四项都记为未确认。2026-11-28 复核时官方 Sandboxing 页（`.md` 111,994 字节）命中该词 5 处，Settings reference（`.md` 463,611 字节）新增独立小节与索引行，四项全部有官方原文，未确认状态据此解除。
- Codex 在 main 分支上于 2026-11-27T23:24:41Z 至 2026-11-28T05:03:13Z 之间合入四个提交（#64398、#64415、#64416、#64422），分别收紧 Linux 只读合成挂载、可写符号链接别名下的限制、Windows 声明式文件系统权限与 `bwrap` 候选筛选。经 GitHub compare 确认四个提交都落在最新预发布 `rust-v0.174.0-alpha.9` 之后，尚未进入任何 Release；官方 Sandboxing 页同日复核（514,274 字节）对 symlink、junction、remount 与 deny mask 的命中数仍为 0，属「源码已改、官方文档未同步」。

本单元只处理这一个字段：改写 Claude 与 Codex 的记录、纠正 Kimi 一条已不成立的否定证据、把 Qwen 与 Qoder 的沙箱证据坐标前移到当前标签与更新日志站。矩阵单元格、详情页 `facts`/`behavior`/`boundary`/`rules`/`conditions` 与 `docs/09` 坐标同步更新。

## 1. Claude Code：`sandbox.allowNestedUserNamespaces` 由「只有更新日志」变为官方双页记录

### 证据坐标

| 材料 | 2026-11-28 | 本仓库此前记录 |
| --- | --- | --- |
| Sandboxing 页 `.md` | 111,994 字节，`allowNestedUserNamespaces` 命中 5 处 | 110,894 字节（2026-11-16 坐标），本字段条件项写「全文没有该词」 |
| Settings reference `.md` | 463,611 字节，有独立小节与索引行 | 457,744 字节（2026-11-16 坐标），索引表无该行 |
| 更新日志 | main 提交 `102fafb0953d90cff472b438e443485e7d131d36`，1,423,161 字节 | v2.1.305（2026-10-20T20:46:50Z，提交 `49b8c35f8c57493c2f0eba1429ccaa9638ab8712`） |
| 最新 Release | v2.1.332（2026-11-25T01:32:14Z） | v2.1.306（2026-10-21T03:16:31Z） |

### Settings reference 小节原文（四项未确认逐条落地）

正文逐字为：

> Let sandboxed commands on Linux and WSL2 create user namespaces, which Chromium's and Electron's own sandbox, a nested bubblewrap, and `unshare` need. If you set this key to `true`, you turn off a security boundary: code from a sandboxed command can end up running outside the sandbox. For rootless Podman or Buildah, use `excludedCommands` instead, because the sandbox stops them in other ways too. Requires Claude Code v2.1.305 or later.

- **取值集合**：Boolean。`true` 逐字为 “sandboxed commands can create user namespaces”，`false` 逐字为 “this key allows nothing extra, and the sandbox's default applies”。
- **默认值**：**Default** 逐字为 `false`。
- **可写作用域**：索引表 Scope 列逐字为 “User or managed”。正文逐字为 “A `true` counts from `~/.claude/settings.json`, JSON passed with `--settings`, or managed settings. Claude Code ignores a `true` in a project's `.claude/settings.json` or `.claude/settings.local.json`. In a session with `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` set to `1`, Claude Code ignores a `true` from every source. A `false` counts from any file, by settings precedence.”
- **最低版本**：正文与小节内两处都写 “Requires Claude Code v2.1.305 or later.”，与 v2.1.305 更新日志一致。

`sandbox` 对象的 Type 行也已把该键与 `enabled`、`failIfUnavailable`、`autoAllowBashIfSandboxed`、`excludedCommands`、`allowUnsandboxedCommands`、`enableWeakerNestedSandbox`、`enableWeakerNetworkIsolation`、`allowAppleEvents`、`bwrapPath`、`socatPath`、`ignoreViolations`、`ripgrep` 以及 `filesystem`/`network`/`credentials` 三个对象并列。

开启后的代价由官方两处告警固定，小节末尾逐字为：

> With this key on, don't rely on any of the sandbox's restrictions, including protected paths and `credentials.files` entries, to stop a malicious command. In auto-allow mode, that command can run without a permission prompt. If your organization has a security team, check with them before you turn the key on.

Protected paths 一节另有一条 WARNING，逐字为：

> If you set `allowNestedUserNamespaces` to `true` on Linux or WSL2, don't rely on protected paths: code from a sandboxed command can end up running outside the sandbox.

### 与 `enableWeakerNestedSandbox` 的分工现已明确

旧记录写「它同 `enableWeakerNestedSandbox` 的关系官方也没有说明」。2026-11-28 复核时两个键分别挂在 Sandboxing 页两个不同的故障小节下：

- `enableWeakerNestedSandbox` → “Bubblewrap fails to start inside a container”，改挂容器已有的 `/proc`。
- `allowNestedUserNamespaces` → “Chromium or rootless Podman fails inside the sandbox on Linux”，是该节三种修法里的第三种，前两种是给浏览器加 `--no-sandbox` 与给 `sandbox.excludedCommands` 加 `podman *` 一类模式。

该节症状列表逐字为 “Chromium exits with `No usable sandbox!`”、“`unshare -U true` prints `unshare: unshare failed: Operation not permitted`. With `allowAllUnixSockets` on, it can print `No space left on device` instead” 与 “Rootless Podman prints `cannot clone: Operation not permitted`, or stops earlier with `read-only file system` on one of its own folders”，并有前置句 “Each fix works for the tools it names and gives up some isolation:”。

第三种修法的完整原文为：

> To keep Chromium's or Electron's own sandbox, or to run a nested bubblewrap or `unshare`, set `sandbox.allowNestedUserNamespaces` to `true` in `~/.claude/settings.json`, not the project's `.claude/settings.json`. Requires Claude Code v2.1.305 or later. A command that begins with `unshare` stays sandboxed whatever `excludedCommands` pattern you list, because `unshare` can start any other program. This setting alone isn't enough for rootless Podman or Buildah, which the sandbox stops in other ways too.

其中两句是本次新补录的边界：以 `unshare` 开头的命令无论列什么 `excludedCommands` 模式都仍在沙箱内（因为 `unshare` 可以启动任何其他程序），而这个键本身不足以放行 rootless Podman 或 Buildah。

`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` 设为 `1` 的会话里，官方给的修法只剩给 Chromium 或 Electron 加 `--no-sandbox`，逐字为 “In that session, every command runs sandboxed, and the settings that the other fixes below name have no effect.”

### 组织侧口径

Sandboxing 页「放宽即削弱」的键列表已从五项增至六项，`allowNestedUserNamespaces` 与 `allowAppleEvents` 一样在后面标注 “which a repository can't turn on”。沙箱被 managed settings 变成 admin-required 时，仓库设置里 `true` 被忽略而 “A `false` still applies” 的那一行仍是四个键（`enableWeakerNestedSandbox`、`enableWeakerNetworkIsolation`、`network.allowAllUnixSockets`、`network.allowLocalBinding`），不含本次的两个键。Security limitations 一节另逐字为 “**User namespaces on Linux and WSL2**: by default, sandboxed commands can't create user namespaces.”

### 版本坐标与仍未确认的一项

main 更新日志（1,423,161 字节）的 `## 2.1.332` 与 `## 2.1.331` 两段合计 40,612 字节、291 行，对 sandbox、bwrap、bubblewrap、seatbelt、namespace 的命中只有 1 行，属 v2.1.331 的修复条目，逐字为 “Fixed sandboxed Bash commands sometimes failing to start on a full temp disk, for sandboxes whose file rules keep commands out of the temp directory”。核对日期最新 Release 为 v2.1.332（2026-11-25T01:32:14Z），其 Added 条目是 MCP Server 提供的 Skills 公测、`PreSkillShellCommand` Hook 事件、跨会话被扣留消息的 “Always deliver”、模型被标记时的 footer 行、OpenTelemetry `assistant_response` 事件与 VS Code／桌面端 Code 页签的两条提示，没有任何文件系统沙箱键的新增或默认值变化。

仍记为未确认的只剩一项：该键与 `enableWeakerNestedSandbox` 同时为 `true` 时的合成语义，官方两页都没有说明。

## 2. Codex：main 分支四个提交收紧文件系统边界（均未进入 Release）

### 未发布判定

- `/releases/latest` 返回最新稳定 Release 为 `rust-v0.172.0`（2026-11-24T00:03:55Z）。
- 最新 Release 为预发布 `rust-v0.174.0-alpha.9`（2026-11-27T16:56:00Z，`prerelease: true`）。
- main HEAD 为 `065e18b04021008e2e7d504db8dc50275f589f73`（2026-11-28T06:13:28Z）。
- compare `rust-v0.174.0-alpha.9...065e18b04021008e2e7d504db8dc50275f589f73` 返回 `status: diverged`、`ahead_by: 19`、`behind_by: 1`、`total_commits: 19`，四个提交都在这 19 个提交里。

因此下列四项都按「只在 main、尚未发布」记录，与本仓库既有的 `windows.allow_mxc`（提交 `e95abcdf4939`）同类处理。

### 2.1 #64398 `d96685f508b5fa1c2ce53373790b268d4d3846dd`：把只读合成挂载封死

提交时间 2026-11-27T23:24:41Z（作者）／2026-11-27T23:53:27Z（提交），标题 “Seal synthetic mounts in read-restricted Linux sandboxes”，改动 `codex-rs/linux-sandbox/src/bwrap.rs` +42/−19 与 `codex-rs/linux-sandbox/tests/suite/sandbox.rs` +24/−5。

Why 段逐字为：

> Read-restricted sandboxes build a synthetic filesystem around paths granted by policy. Leaving the backing mounts writable lets commands modify synthetic directories outside explicitly writable paths.

What changed 段逐字为：

> Remount the synthetic root, minimal `/dev`, and applicable WSL masks read-only after bubblewrap finishes setting up mounts. The remounts are nonrecursive, so explicitly writable child mounts stay writable.

Testing 段逐字为：

> Extend the sandbox regression test to check that commands can read an approved file through a symlink, write to `/dev/null`, and write to an allowed subdirectory under a denied parent. The test also checks that commands cannot rename the synthetic directory containing the approved file or create an ungranted directory under `/dev`.

main 上的实现（`codex-rs/linux-sandbox/src/bwrap.rs`，55,756 字节、1,436 行）里 `create_filesystem_args` 的封挂循环上方注释逐字为：

```rust
// Bubblewrap must finish creating mount points before sealing their backing
// directories. --remount-ro is nonrecursive, so writable child mounts survive.
for path in synthetic_roots {
    bwrap_args.args.push("--remount-ro".to_string());
    bwrap_args.args.push(path_to_string(path));
}
```

同一文件里 `append_empty_directory_args` 依次推入 `--perms 555`、`--tmpfs <path>`、`--remount-ro <path>`，`append_existing_unreadable_path_args` 与 `append_daemon_socket_masks`（`--perms 000`）同样在 tmpfs 之后补 `--remount-ro`，WSLg 遮蔽分支的注释逐字为 “Use the expanded masks, including symlink targets from deny globs. An already hidden ancestor cannot accommodate a new child mount. Otherwise apply this after every grant to exclude the duplicate view.”

### 2.2 #64415 `df8dd9a56bf389b6067e5f9cb05d3595981647c3`：保住可写符号链接别名下的限制

提交时间 2026-11-28T01:54:51Z，标题 “Preserve Linux sandbox restrictions across writable symlink aliases”，改动 `codex-rs/linux-sandbox/src/bwrap.rs` +143/−137 与 `codex-rs/linux-sandbox/tests/suite/sandbox.rs` +119/−0。

Why 段逐字为：

> Ordering writable binds by the spelled paths can put a parent mount after a child mount when symlinks are involved. The later bind can cover deny masks and read-only mounts that the sandbox already applied.

What changed 段逐字为：

> Group writable roots by their resolved mount destinations and bind each destination once, with parents before descendants. Map deny rules under writable aliases to their physical paths and apply them after read-only mounts. Reapply read-only mounts below each writable bind while preserving explicit write grants for narrower paths.

Testing 段逐字为：

> Add `bwrap` regression cases for a symlink to `/` paired with a project alias and for aliases to nested project directories. The cases check that denied files stay unreadable, read-only files resist writes, and explicitly writable children remain usable under restricted parents.

main 上的实现要点：

- 可写根归入 `let mut writable_mounts = BTreeMap::<PathBuf, Vec<&WritableRoot>>::new();`，键是每个 root 经 `canonical_target_if_symlinked_path(root)` 解析后的挂载点；该函数的注释逐字为 “Return the fully resolved target only when some path component is a symlink. Callers use this to bind/mask the real filesystem location while leaving ordinary paths in their logical form.”
- 绑定顺序的注释逐字为 “Path ordering visits parents before descendants. Bind each physical root once and apply its deny masks after every alias's read-only carveouts.”，另有 `read_only_mounts.sort_by_key(|path| path_depth(path));` 与 `deferred_by_path.sort_by_key(|path, _| path_depth(path));` 两处按路径深度排序。
- 别名下的 deny 映射进 `alias_denials`，注释逐字为 “A later bind may cover a denial spelled through this alias. Record its physical destination before emitting any of the writable grants.”，随后 `unreadable_roots.extend(alias_denials); unreadable_roots.sort(); unreadable_roots.dedup();`。
- deny 掩码分支的注释逐字为 “The outer tmpfs hides its descendants until a later writable bind reopens them. A denied directory on a route to a writable child still needs its own execute-only mask to prevent directory listing.”
- `validate_unreadable_root` 在受保护路径穿过对沙箱内进程仍可写的符号链接时失败关闭，注释逐字为 “Deny-read masks must fail closed when the protected path crosses a symlink that remains writable to the sandboxed process. Resolving and masking the symlink's current target is a TOCTTOU snapshot: bwrap would protect the old target while the logical path could later point somewhere else.”，错误为 `CodexErr::Fatal(format!("cannot enforce sandbox deny-read path {} because it crosses writable symlink {}", …))`。

`--unshare-user` 在该文件仍出现 2 次（`create_bwrap_flags_full_filesystem` 与 `create_bwrap_flags`），与本仓库既有记录一致；文件行数由 `rust-v0.164.0-alpha.9` 坐标的 1,522 行变为 1,436 行。

### 2.3 #64422 `965ee845b1f11e32fd9e7e359bb8cfe13002234b`：探测 `bwrap` 前先要求已解析的文件系统策略

作者时间 2026-11-28T04:48:46Z、提交时间 2026-11-28T05:03:13Z，标题 “Require a resolved filesystem policy before probing Bubblewrap”，改动 `codex-rs/sandboxing/src/bwrap.rs` +10/−3、`codex-rs/protocol/src/permissions/enforcement.rs` +29/−1、`codex-rs/protocol/src/permissions.rs` +18/−19、`codex-rs/linux-sandbox/tests/suite/bwrap_path.rs` +39/−2 与 `codex-rs/protocol/src/permissions/target_approved_materialization_tests.rs` +12/−3。

Why 与 What changed 段逐字为：

> Codex checks candidate Bubblewrap executables before sandbox confinement. At that point, the metadata protections applied by the sandbox are not yet in effect.

> Evaluate candidate paths against configured filesystem restrictions without counting sandbox-applied metadata protections or discovered Git metadata carveouts. Skip executable lookup when permission resolution fails.

Testing 段逐字为：

> Extend the managed-network regression test to verify that writable Bubblewrap candidates are skipped with a legacy Git metadata carveout or a metadata resolution error.

注意 `codex-rs/sandboxing/src/bwrap.rs`（14,656 字节，负责定位 `bwrap` 可执行文件）与 `codex-rs/linux-sandbox/src/bwrap.rs`（55,756 字节，负责构造 bwrap 参数）是两个不同文件，本仓库此前只记录了后者。

前者的 `find_pre_sandbox_executable_in_path(program, file_system_policy, sandbox_policy_cwd)` doc comment 逐字为：

> Finds the first canonical PATH executable for use before sandbox construction. Skips candidates under a non-root process cwd and candidates the current user can modify or replace through writes allowed by the filesystem policy.

筛选条件逐字为 `if (!cwd_is_root && path.starts_with(&cwd)) || file_is_writable(&path) || path_is_replaceable(&path) { None } else { Some(path) }`。`path_is_replaceable` 一路检查祖先目录，注释逐字为 “Preserve read-only carveouts, but also check ancestors: a protected file can still be replaced by renaming a writable parent directory. Host-protected installations remain usable even with full-disk writes.”，其中只读 carveout 的处理逐字为 “Read-only carveouts are bind mounts and cannot themselves be renamed/unlinked. Continue checking above them, since a mutable ancestor could still redirect the installation path.” 与 “Match policy through parent aliases without resolving the child symlink.”

可写性判定用 `SYS_faccessat2` 加 `AT_EACCESS`，注释逐字为 “Ask the kernel to check effective credentials, including POSIX ACLs. Older libc faccessat emulation ignores ACLs, which could misclassify a writable path.”，未知错误一律当作可写，注释逐字为 “Unknown errors must not turn an unverified candidate into a trusted one.”（只有 `EACCES` 与 `EROFS` 判为不可写）；`current_user_can_replace_child` 另按 `S_ISVTX` 粘滞位与父目录 uid 判断。

策略解析侧 `codex-rs/protocol/src/permissions/enforcement.rs`（5,034 字节、119 行）的 `FileSystemPolicyProjection` doc comment 逐字为 “How a sandbox binds filesystem roots after access and precedence are resolved.”，四个变体注释分别为 `Native` “Resolve roots and carveouts to their effective native paths.”、`PreserveMutableRoots` “Normalize trusted system aliases, leaving mutable components for the sandbox to bind.”、`LinuxMounts` “Inherit root metadata writes from the root mount and retain literal paths for read denials.”、`PreSandboxExecutable` “Only configured restrictions can make a host executable eligible to run before confinement.”。`resolve_for_enforcement` 内注释逐字为 “Legacy workspace policies encode discovered gitdirs as optional read entries. A repository cannot use one of those carveouts to authorize its own host-side helper.”，判据为 `entry.access == FileSystemAccessMode::Read && entry.skips_missing_path()`，命中时以 `retain` 剔除；调用侧是 `.ok()?`，即权限解析失败直接跳过整段可执行文件查找。`resolve_for_enforcement_impl` 末尾另有 fail-closed 注释，写明匹配器准备失败时不发授权、只保留显式拒绝。

同文件的 `MISSING_BWRAP_WARNING` 逐字为：

> Codex could not find bubblewrap on PATH. Install bubblewrap with your OS package manager. See the sandbox prerequisites: https://developers.openai.com/codex/concepts/sandboxing#prerequisites. Codex will use the bundled bubblewrap in the meantime.

**官方文档缺口**：官方 Sandboxing 页在 2026-11-28（514,274 字节，比 2026-10-21 的 492,064 字节增加 22,210 字节）仍逐字写 “Codex uses the first `bwrap` executable it finds on `PATH`. If no `bwrap` executable is available, Codex falls back to a bundled helper, but that helper requires support for unprivileged user namespace creation.”，没有描述这层策略筛选，因此「第一个」只在候选都通过筛选时成立。同页对 symlink、junction、remount 与 deny mask 的命中数为 0，`writable roots` 只出现在两句里且都不涉及绑定顺序；本次新增的只有 `danger-full-access` 之后多出的 “This removes the filesystem and network boundaries and should be used only when you want the agent to act with full access.” 与一条 Ubuntu 25.04 的 AppArmor 提示（写该版本从 Ubuntu 软件源安装 `bubblewrap` 应无需额外配置，`bwrap-userns-restrict` profile 随 `apparmor` 包提供在 `/etc/apparmor.d/bwrap-userns-restrict`），Ubuntu 24.04 的四条命令与 sysctl 退路逐字未变。

### 2.4 #64416 `8cae463a69aced7705440acaaa9c9cba2d36e056`：Windows 沙箱遵从声明的文件系统权限

提交时间 2026-11-28T03:05:11Z，标题 “Honor declared filesystem permissions in Windows sandboxes”，改动 `codex-rs/mxc-sandbox/src/policy.rs` +166/−31、`codex-rs/mxc-sandbox/src/policy_tests.rs` +121/−0、`codex-rs/mxc-sandbox/src/windows.rs` +73/−0、`codex-rs/mxc-sandbox/README.md` +19/−9、`codex-rs/sandboxing/src/windows.rs` +15/−7、`codex-rs/sandboxing/src/manager_tests.rs` +50/−0 与 `codex-rs/mxc-sandbox/Cargo.toml` +1/−0。

Why 段逐字为：

> MXC volume expansion can generate child grants that override restrictions on directory aliases. The restricted-token backend can also reject valid workspace policies because its compatibility check assumes the working directory is writable.

What changed 段逐字为：

> Check directory identity before MXC expands writable volume roots. Suppress generated write grants that conflict with read-only aliases, including through junctions on other volumes, while preserving narrower explicit grants. Reject launch if a writable volume is also denied or its relationship to a restricted directory cannot be determined.

> Let the restricted-token backend accept the supplied workspace roots when the working directory has no explicit write grant, while retaining exact root matching for filesystem-root write grants.

Testing 段逐字为：

> Add regression coverage for restricted volume aliases, junctions across writable roots, explicit drive-root denials, and restricted-token workspace roots with nested or read-only working directories or an empty root list.

### MXC README 的一条既有「已知限制」被删除

本仓库既有来源 `codex-mxc-readme` 固定在提交 `e95abcdf4939f37f11f00f984efdbbf8b088346e`，当时 README 写 “We intentionally accept two alias limitations”，其中第二条为：

> Volume-root expansion uses each root's declared access without reconciling aliases first. For example, a writable `V:\` plus a read-only junction to `V:\` can produce a writable `V:\projects` grant. That generated, more-specific grant permits writes through either name despite the read-only root alias.

main（`065e18b04021`，README 8,514 字节）上这一段已被删除，只保留硬链接那条 “Hard-link names retain independent path permissions. An allowed name can read or modify the same file as a denied or read-only name.”，并新增两段：

> Before expanding a writable volume root, the adapter checks whether a restricted directory names that root. For example, a read-only junction to writable `V:\` suppresses the generated write grant for `V:\projects`. Explicit grants beneath the root still apply. A child junction on another writable drive gets no generated write grant if it points beneath that restriction. When a deny names the same writable volume through another path, the adapter rejects the request before launch. Otherwise generated read-only grants such as `V:\.aws` could expose files beneath the denied root. These checks use the links present during policy construction.

> If the filesystem cannot supply a directory ID, the adapter compares resolved NT names. Different share names can refer to the same directory. If the adapter cannot distinguish a writable volume from a restricted directory, it reports both paths and stops before launch. Explicit grants outside volume expansion require no directory-identity comparison.

实现侧的关键注释：`policy.rs` 的 “BaseContainer applies the strictest grant to equivalent directories. A synthesized child would override that restriction by being more specific.”、“A junction on a second writable drive can land beneath a restricted root. Apply the nearest explicit directory grant to its resolved target.”、“All symbolic read roots have been bound above. Keep the declared spelling: canonicalizing a top-level read-only junction can collapse it into an explicit writable drive before BaseContainer sees the restriction.”、“Ordinary files and missing entries cannot be aliases of a directory. Keep their native restrictions without asking the filesystem for a file ID.” 与 “Hard-linked file names keep independent permissions. Compare directories only.”；拒绝分支为 `return Err(PolicyError::ConflictingVolumeDenial { volume: path.clone(), denial: denial.to_owned() });`，上方注释 “Even an inferred read-only metadata grant could reopen this volume.”；`mxc-sandbox/src/windows.rs` 的 “SMB need not support FileIdInfo. Query the resolved NT names through handles opened with zero requested access, including on directories denying metadata reads.” 与 “A share can export a local volume or the same directory as another share. Different redirector names do not establish distinct objects.”

受限令牌后端（`unelevated`）一侧，`codex-rs/sandboxing/src/windows.rs` 新增注释逐字为：

> WorkspaceWrite always adds cwd. The restricted token gets its write capabilities and allow ACLs from the actual roots, so cwd can be read-only or below a writable root. For a write grant at the filesystem root, the projected roots must still match exactly.

README 里与本字段相关的既有口径未变：文件系统权限取自规范化的 Codex 权限 Profile（含受保护元数据豁免）、路径冲突由 BaseContainer 按「等价拼写与 symlink/junction 别名取最严（`deny` > read-only > read-write）、更具体路径覆盖祖先授权」处理、deny glob 沿用既有 Windows 沙箱解析器在启动前展开并保持相同快照语义与扫描上限、只读卷根授权递归而不枚举子项而可写卷根授权不递归（只授卷根与其直接子项，运行中新建的子项不自动可写）。

### 回归测试坐标

`codex-rs/linux-sandbox/tests/suite/sandbox.rs`（65,937 字节、1,884 行、43 个 `async fn` 测试）中与本轮直接相关的用例名为 `writable_aliases_preserve_physical_denials_and_reopened_children`、`sandbox_reenables_writable_subpaths_under_unreadable_parents`、`sandbox_starts_with_denied_tmp_without_exposing_registry`、`sandbox_rejects_symlinked_synthetic_mount_registry`、`sandbox_blocks_codex_symlink_replacement_attack`、`sandbox_reports_codex_symlink_build_failure_without_panicking`、`bwrap_populates_minimal_dev_nodes`、`bwrap_preserves_writable_dev_shm_bind_mount`、`test_dev_null_write`、`wsl_interop_bind_alias_cannot_run_windows_program` 与 `sandbox_blocks_dev_tcp_redirection`；`codex-rs/linux-sandbox/tests/suite/bwrap_path.rs`（7,037 字节、177 行）两个测试为 `child_workdir_does_not_probe_or_launch_writable_parent_bwrap` 与 `managed_network_does_not_probe_writable_bwrap`。

## 3. Qwen Code：沙箱文档坐标前移到 v0.28.7，内容逐字节未变

- `docs/users/features/sandbox.md` 在 v0.25.3、v0.28.7（提交 `3a9baf531a8e54793de635dc3ab0e21a51c3542f`）与 main 三个坐标下都是 17,891 字节、SHA-256 前缀同为 `57362261766c8f7d`，两两 `diff` 无输出。
- `docs/users/configuration/settings.md` 整份由 v0.25.3 的 381,388 字节增至 v0.28.7 的 447,032 字节，但其中 “## Tool execution sandbox” 一节在两个标签下都是 660 字节、SHA-256 前缀同为 `5320b2f243b0`、逐字相同；`--yolo` 告警仍在 v0.28.7 的第 1,065 行，逐字为 “> ⚠️ **`--yolo` does _not_ automatically enable a sandbox.** YOLO mode only auto-approves tool calls; sandboxing must still be opted into via `--sandbox`, `QWEN_SANDBOX`, or `tools.sandbox`.”
- `tools.executionSandbox` 段、Landlock `partial` enforcement 段与 System > User > SystemDefaults 作用域段逐字未变；全页对 symlink、只读重挂与可写根绑定顺序都没有任何描述，即 Codex 本轮收紧的三类语义在 Qwen 侧没有可对照的官方文字。
- 仍记为未确认的一项未变：官方写 `qwen sandbox` 的报告包含 “requested/effective backend” 与 “enforcement level”，但全文只给出 Landlock 一侧的级别名 `partial`，bwrap 后端的级别取值官方没有列出。

## 4. Kimi Code：坐标前移到 2.8.1，并纠正一条已不成立的否定证据

坐标由 2.3.0 提交 `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb` 前移到 2.8.1 标签提交 `62402f173c5a838a1c1f8fa263b637a22486fa39`（标签对象 `5eb17ca75b4698b8ee41871262d34481b6db6fdb`，2026-11-26T11:47:26Z 打标签）：

- 整棵仓库树 6,505 条路径，对 sandbox、bwrap、bubblewrap、landlock、seccomp 与 seatbelt 的路径名命中数为 0，与 2.3.0 结论一致。
- `docs/zh/reference/tools.md`（23,180 字节）与 `docs/zh/configuration/env-vars.md`（23,489 字节）对 sandbox、bwrap、bubblewrap、landlock、seccomp、seatbelt 与「沙箱」的命中数都是 0。
- **需要纠正的一条**：旧记录写「该标签的 `docs/zh/configuration/config-files.md`、`docs/zh/reference/tools.md` 与 `docs/zh/configuration/env-vars.md` 也没有这些词」。2.8.1 下 `docs/zh/configuration/config-files.md`（50,046 字节）有 4 处命中、`docs/zh/guides/remote-environment.md`（5,033 字节）有 2 处命中，全部来自同一个 `[environments.sandbox]` 示例：

```toml
[environments.sandbox]
command = "sandbox"
args = ["ssh", "i-1234567890", "--"]
env = { SANDBOX_TOKEN = "..." }
defaultCwd = "/home/me/kimi-code"
```

  它是 `[environments]` 下 command 类型远端环境的条目名，官方对 command 条目的说明逐字为 “通用启动器形式，用于内置启动器未覆盖的环境（OrbStack 机器、`kubectl exec`、Apple Container、受管沙箱等）”，Kimi Code 会在 `args` 末尾追加 `<remoteBin> exec-server`。即由外部启动器把 Kimi 的 exec-server 送进第三方受管沙箱运行，边界由那个外部环境提供，不是 Kimi Code 自己施加的 OS 或容器隔离。因此「三份文档都没有这些词」的表述已不成立并改写，而「Kimi Code 没有 OS 沙箱」的结论不变，是否存在未公开的 OS 沙箱仍记为未确认。
- `packages/agent-core-v2/src/agent/permissionPolicy/policies/` 由 2.3.0 记录的 15 个文件增为 18 个，新增 `bash-read-only-specs.ts`、`bash-read-only.ts` 与 `environment-lease.ts`，路径判定仍在 `packages/agent-core-v2/src/tool/path-access.ts`。
- command 条目另有一条与文件系统相关但属启动器防冒名的规则，逐字为 “解析结果落在工作目录内会被拒绝，项目无法用同名二进制冒名顶替启动器”，不是文件系统沙箱。
- 2.8.1 标签下 `docs/zh/release-notes/changelog.md` 为 120,428 字节、最新小节是 2.7.3（2026-11-24，落后于标签本身），全页对沙箱相关词的命中数为 0；2.3.0（2026-10-21）与 2.2.0（2026-10-14）两段的既有记录不变。

## 5. Qoder CLI：发布说明坐标前移到更新日志站的 CLI 1.1.100

本字段的 Qoder 条件项此前写「官方 CLI Release Notes 最新条目为 CLI 1.1.75（October 20, 2026）」，落后同轮 `execution-files` 已改用的更新日志站 25 个版本。本次改以 `https://changelog.qoder.com/cli.md`（2026-11-28 核对，151,350 字节）为准：

- 最新条目为第 16 行的 `<Update label="November 27, 2026" description="CLI 1.1.100">`；CLI 1.1.76 为 October 21, 2026（第 400 行）、CLI 1.1.75 为 October 20, 2026（第 414 行）、CLI 1.0.0 为 May 20, 2026（第 2,222 行）；第 16 至 413 行共 25 个 `<Update label=` 条目，即 1.1.76 至 1.1.100。
- 这 25 个条目里没有任何本地沙箱键或 OS 隔离条目。
- 全页对 sandbox 的大小写不敏感命中只有 1 行，即第 2,238 行 CLI 1.0.0 段 “Enterprise Integration” 下的 “**Cloud Agents:** Agents-as-a-Service. Sandbox isolation, state management, async orchestration, credential management, and long-running execution all built into the platform.”，属云端 Surface。
- 对 isolat 的 6 行命中分别是第 2,047 行 CLI 1.0.12 的 “Fixed cross-window goal pollution by isolating goals per session”、上面那条 Cloud Agents，以及 CLI 0.2.13 段的第 2,314 行 “Worktree isolation enabled by default”、第 2,330 行锚点 `worktree-isolation-and-context-bar-improvements`、第 2,332 行小节标题 “Worktree Isolation and Context Bar Improvements” 与第 2,334 行 “Added worktree isolation for agents — run sub-agents in isolated git worktrees with `-w` flag, interactive exit dialog, and automatic cleanup on exit”，都属目标隔离或 Worktree 隔离，不是 OS 沙箱。
- `https://docs.qoder.com/en/cli/sandbox` 仍返回 404，设置参考与 SDK 参考仍无 `sandbox.*` 键，OS 沙箱继续记为未确认；本仓库此前记录的 SDK `sandbox.filesystem` 仍无法从官方文档复核。

## 6. 五家文件系统隔离对照（本次复核后）

| 产品 | OS 级文件系统边界 | 削弱或退出开关 | 本轮变化 | 证据层级 |
| --- | --- | --- | --- | --- |
| Claude Code | Bash 沙箱：macOS Seatbelt，Linux 与 WSL2 bubblewrap（另需 `socat`） | `enableWeakerNestedSandbox`（改挂已有 `/proc`）、`allowNestedUserNamespaces`（放行沙箱内建用户命名空间）、`danger-full-access` 无同类 | `allowNestedUserNamespaces` 四项未确认全部由官方双页解除 | 官方文档（Sandboxing 页 + Settings reference） |
| Codex | `read-only`／`workspace-write`／`danger-full-access`；Linux 与 WSL2 用 bubblewrap，原生 Windows 用 `elevated`／`unelevated`／`mxc` | `danger-full-access` 移除边界；`writable_roots` 扩展可写目录 | main 四个未发布提交收紧只读封挂、别名顺序、Windows 卷根别名与 `bwrap` 候选筛选；官方页仍写「`PATH` 上第一个 `bwrap`」 | 官方文档 + main 源码与提交（未进 Release） |
| Qwen Code | 条件：Linux 工具执行沙箱 `tools.executionSandbox`（`bwrap`/`landlock`）；另有整 CLI 的 Seatbelt 或容器 | `filesystem: "workspace-write"`；Landlock 后端报 `partial` enforcement | 文档坐标前移到 v0.28.7，三份材料逐字节未变 | 官方文档（v0.28.7 标签） |
| Kimi Code | 无 OS 沙箱；文件边界由 `[permission]` 规则与 `tool/path-access.ts` 提供 | `/yolo` 跳过审批但不涉及 OS 边界 | 坐标前移到 2.8.1；`[environments.sandbox]` 澄清为远端环境启动器示例 | 官方仓库树与文档 |
| Qoder CLI | 无公开的 OS 沙箱；路径权限规则与受信目录 | `bypass_permissions`／`yolo` 只影响审批 | 发布说明坐标前移到更新日志站 CLI 1.1.100，25 个条目无沙箱内容 | 官方文档站 + 更新日志站 |

跨产品事实据此新增三条：Codex 的 Linux 边界在 main 上继续收紧而官方文档没有跟进；官方「第一个 `bwrap`」的表述已被源码的策略筛选限定；Claude 的嵌套用户命名空间开关已由双页官方文档固定取值、默认值、作用域与最低版本。

## 同步范围

- `site/data.js`：`security-filesystem` 行的 claude 单元格把 `allowNestedUserNamespaces` 由「v2.1.305 起（放行沙箱内用户命名空间）」改写为「Boolean、默认 `false`、Scope 为 User or managed、项目设置里的 `true` 被忽略、`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` 时任何来源的 `true` 都被忽略、需 v2.1.305 及以上」，codex 单元格把「`PATH` 上的 `bwrap`」限定为「`PATH` 上第一个通过文件系统策略筛选的 `bwrap`」并追加 main 四项收紧，kimi 单元格由「2.3.0 仓库树」前移到「2.8.1 标签 6,505 条仓库路径」并注明 `[environments.sandbox]` 只是启动器示例，qoder 单元格补入「更新日志站」；qwen 单元格内容未变。新增 17 个来源 `claude-settings-allow-nested-userns-20261128`、`claude-sandboxing-nested-userns-20261128`、`claude-v21332-sandbox-changelog-scan`、`codex-sandboxing-20261128`、`codex-seal-synthetic-mounts-commit`、`codex-writable-symlink-aliases-commit`、`codex-bwrap-probe-commit`、`codex-windows-fs-permissions-commit`、`codex-linux-sandbox-bwrap-main-20261128`、`codex-bwrap-probe-main-20261128`、`codex-pre-sandbox-projection`、`codex-mxc-readme-main-20261128`、`codex-sandbox-regression-tests-main-20261128`、`codex-sandbox-unreleased-20261128`、`qwen-sandbox-doc-v0287-identical`、`kimi-no-os-sandbox-281`、`qoder-changelog-sandbox-scan-20261128`（GitHub 证据全部固定到 commit SHA 或标签提交），既有来源零删改，来源总数由 1,413 增至 1,430；`updatedAt` 维持 2026-11-28（同日第二轮研究）。
- `site/security-details.js`：`security-filesystem` 的 `facts` 由 6 条增至 9 条（改写「削弱开关」与「Kimi／Qoder 无 OS 沙箱」两条，新增 Codex main 收紧、`bwrap` 候选筛选与 Claude 双页补齐三条）；`behavior` 的 codex 追加 Linux 三层收紧与 MXC 卷根别名检查、kimi 前移到 2.8.1 并澄清 `[environments.sandbox]`；`overrides` 的 claude `rules`（键列表增至六项）／`boundary`（三种修法与两条新边界）／`conditions`（四项未确认落地、版本坐标前移到 v2.1.332、只剩一项未确认），codex `conditions`（`MISSING_BWRAP_WARNING`、候选筛选、`PreSandboxExecutable` 投影、官方页尺寸与 Ubuntu 25.04 提示、Release 与 compare 坐标、回归测试名），qwen `conditions`（v0.28.7 坐标与 SHA-256 前缀），kimi `boundary` 与 `conditions`（2.8.1 树扫描、四份文档命中数、18 个策略文件、中文变更记录 120,428 字节），qoder `conditions`（更新日志站坐标、25 个条目、sandbox 与 isolat 命中归属）；五个产品的 `sources` 数组各加入对应新来源。`value` 与 `status` 由 `createDetail` 从主表派生，自动跟随。
- `docs/03-权限与沙箱矩阵.md`、`docs/capabilities/security/security-filesystem.md` 及其余能力文档由 `npm run generate` 重新生成。
- `docs/09-版本与证据.md`：五家行核对日期维持 2026-11-28，主要材料各补一段本次复核结论；“官方来源” 表五家行的 “权限与沙箱” 列各追加本次新增链接（Claude 3 条、Codex 11 条、Qwen 1 条、Kimi 2 条、Qoder 1 条）。
- `README.md`：核对日期已是 2026-11-28，能力字段总数维持 119，均未改动。
- `npm run generate` 与 `npm test`（validate-details / validate-links / validate-site）全部通过：`Validated 119 details × 5 products.`、`Validated links in 307 Markdown files.`、`Validated matrix render, detail schemas, links, and CSS.`

## 本次未处理

同批一手材料里还有以下条目属其他能力字段，留待后续研究单元：

- Codex 提交 “Show confirmed thread permissions in TUI status”（#64396，`d2be907d4db2`）与 “Track server-confirmed thread permissions in the TUI”（#64393），属 `security-approval` 或状态行相关字段，2026-11-28 第一轮已标注「本次未处理」。
- Codex 提交 “Keep MCP guardian elicitation fixtures local in remote tests”（#64425）、“Fix TUI Markdown line breaks before inline code”（#64400）与 “Fit the Agent Command Center grouping header to the panel”（#64411），分属 MCP、渲染与云端 Surface。
- Claude Code v2.1.332 的 `PreSkillShellCommand` Hook 事件属 `extension-hooks`，“Added "Always deliver" to the prompt for held messages from other sessions” 属 `session-messaging`，OpenTelemetry `assistant_response` 事件属可观测性（本仓库暂无对应字段）。
- Claude Code Sandboxing 页本轮新增的 1,100 字节里还有 protected settings 路径出现符号链接时的拒绝规则与 `<name>.claude-sandbox-quarantine-<hex>` 改名行为，属 `security-filesystem` 的 protected paths 子话题，本次只处理嵌套用户命名空间一项，未展开。
- Qwen Code v0.28.7 的 `settings.md` 由 381,388 增至 447,032 字节，增量属其他字段（模型、Worktree、Mods 等），本次只核对 “## Tool execution sandbox” 一节。
- Kimi Code `docs/zh/guides/remote-environment.md`（5,033 字节）描述的 command 类型远端环境整体属 `surface-remote-control` 一类字段，本次只用来澄清 `[environments.sandbox]` 不是 OS 沙箱。
