# Codex / Claude Code / Qwen Code 对比：范围与版本锁定

> 阶段：0 · 立项定界  
> 快照时间：2026-07-25T10:37:54Z（Asia/Shanghai：2026-07-25 18:37:54 +08:00）  
> 调研平台：Darwin arm64  
> 受众：Qwen Code 产品与研发人员

## 1. 目标

本系列文档用于回答三个问题：

1. 三款 coding agent 分别能完成哪些用户任务，能力在什么入口、条件和边界下成立？
2. 同名功能的行为契约是否真正等价，包括状态范围、权限、持久化、自动化和失败语义？
3. 哪些差异是 Qwen Code 应补齐的缺口、可形成的差异化、需要继续观察的方向，或明确不应投入的能力？

最终产物面向产品和工程决策，不做营销式总榜，也不把“竞品有、Qwen 没有”直接当成需求。

## 2. 比较对象

比较对象是“以本地 CLI 为中心的第一方 coding-agent 产品栈”，而不是只比较三个可执行文件，也不是把厂商所有 AI 产品混在一起。

### 2.1 主矩阵

主矩阵比较以下核心闭环：

- 本地 CLI / TUI 的任务输入、Agent 执行、工具调用、验证和结果交付。
- 上下文、会话、记忆、权限、沙箱、扩展和多 Agent。
- Headless、结构化输出及与 CLI 共用 Agent runtime 的编程接口。

### 2.2 分 Surface 记录

以下第一方 Surface 可以纳入，但必须单独标注，不能反推 CLI 也支持相同能力：

- IDE / editor extension
- Desktop
- Web / cloud / remote execution
- SDK / daemon / app server
- CI / GitHub Action
- IM channel / notification surface

每条结论必须带 `product_surface`。例如，只存在于 Codex cloud、Claude Desktop 或 Qwen Web Shell 的能力，不计为 CLI 能力。

## 3. 纳入与排除

### 3.1 纳入

- 安装、升级、版本通道、平台和认证。
- Agent 控制循环、上下文、会话、记忆及工具系统。
- 权限、安全、沙箱和企业治理。
- MCP、Skills、Hooks、Plugins、Extensions 和自定义 Agent。
- Subagent、后台任务、并发协作、Worktree 和 workspace 隔离。
- Git、PR、Review、CI、Headless、SDK、daemon 和计划任务。
- 模型提供方、模型选择、缓存、成本控制与可观测性，但只比较产品能力和控制面。
- 稳定版本中的限制、门禁、失败语义和平台差异。

### 3.2 默认排除

- 模型智力、代码生成质量和 benchmark 排名；如需评测，另建独立实验。
- 单纯的价格横评；套餐只在它构成能力可用门禁时记录。
- 第三方社区 UI、非官方插件和未经厂商确认的路线图传闻。
- Preview、alpha、nightly、内部开关和未发布代码；必要时作为独立增量，不进入稳定版主矩阵。
- 不从闭源、压缩或混淆实现中复制代码；公开结论只记录可公开验证的产品行为。

## 4. 稳定版本选择规则

统一规则如下：

1. 厂商若提供明确的 `stable` 通道，主基线使用该通道。
2. 没有独立 `stable` 通道时，使用 registry 的非预发布 `latest`，并要求存在对应的官方非 prerelease 发布。
3. `latest`、alpha、nightly 等更快通道与稳定基线之间的差异另行记录，不能静默合并。
4. 后续调研期间即使发布新版本，也保留本快照；需要升级时新建版本增量，而不是覆盖旧证据。

| 产品 | 主基线 | 通道依据 | 对照通道 |
| --- | --- | --- | --- |
| Codex CLI | `0.145.0` | npm `latest`；官方 GitHub Release 标记 Latest，未观察到独立 stable tag | `0.146.0-alpha.10`，排除 |
| Claude Code | `2.1.212` | npm `stable`；官方定义 stable 为延迟发布并跳过重大回归 | `latest` / `next` 为 `2.1.220` |
| Qwen Code | `0.21.0` | npm `latest`；官方 GitHub Release 非 prerelease | preview、nightly 及实验 dist-tags，排除 |

Claude Code 的默认更新通道是 `latest`，但本研究此前约定比较“最新稳定版”，因此主矩阵锁定显式 `stable 2.1.212`。`2.1.220` 会作为 latest-channel 增量保留，避免遗漏近期变化。

## 5. 冻结的发行物

### 5.1 Codex CLI

- npm wrapper：`@openai/codex@0.145.0`
- Release tag：[`rust-v0.145.0`](https://github.com/openai/codex/releases/tag/rust-v0.145.0)
- Release commit：`25af12f7e61572b0bc18ddb1008be543b91519b0`
- Commit time：`2026-07-21T17:29:35Z`
- Wrapper tarball：<https://registry.npmjs.org/@openai/codex/-/codex-0.145.0.tgz>
- Wrapper integrity：`sha512-/PSPSFujjjmiyVFvG2yu/grOFhsWdokTH8t2KGWhXSo/M5n/dIDsnbsnO82/7bLtIoDuzQf7ATBUMWqPWQINlQ==`
- Wrapper 形态：3 个文件、约 11 KB 解包大小的 JavaScript launcher，不是实现本体。
- Darwin arm64 映射：optional dependency 别名 `@openai/codex-darwin-arm64` 指向 `npm:@openai/codex@0.145.0-darwin-arm64`。
- Darwin arm64 tarball：<https://registry.npmjs.org/@openai/codex/-/codex-0.145.0-darwin-arm64.tgz>
- Darwin arm64 integrity：`sha512-h6aQ0UxnaP8mIM/9/qPAH9MNkRliJo88toq1T36IxNM2L5JSU0TFamu+MZn7YkFgDsrp0RfiI+97Tm8AVVxqtA==`
- 平台包版本：`0.145.0-darwin-arm64`
- 平台包形态：7 个文件、约 322 MB 解包大小；官方仓库确认当前维护实现是 Rust standalone executable。

官方入口：

- [Codex CLI 文档](https://developers.openai.com/codex/cli)
- [Codex changelog](https://developers.openai.com/codex/changelog)
- [openai/codex](https://github.com/openai/codex)
- [Codex releases](https://github.com/openai/codex/releases)

### 5.2 Claude Code

主基线：

- npm wrapper：`@anthropic-ai/claude-code@2.1.212`
- npm dist-tag：`stable`
- GitHub Release：[`v2.1.212`](https://github.com/anthropics/claude-code/releases/tag/v2.1.212)
- Wrapper tarball：<https://registry.npmjs.org/@anthropic-ai/claude-code/-/claude-code-2.1.212.tgz>
- Wrapper integrity：`sha512-MEasj1oaoARRKEWU7eHJ6DWC2TC8ogml9QUDihbmxYI2Ij5Ol1leW90DIj8/a0xX3lfHZOwT3gJr0JxVKa8Sxw==`
- Darwin arm64 平台包：`@anthropic-ai/claude-code-darwin-arm64@2.1.212`
- Darwin arm64 tarball：<https://registry.npmjs.org/@anthropic-ai/claude-code-darwin-arm64/-/claude-code-darwin-arm64-2.1.212.tgz>
- Darwin arm64 integrity：`sha512-QjQwqJU5XzAl1mdlnY+hQxK/pGx6/0q59BfHWiKsSeLyMBpK9avgwu+kap8kzSigSEdbo1rIABO8t2EKqzvvaA==`
- Wrapper 与平台包版本一致，wrapper 的 optional dependency 精确锁定 `2.1.212`。
- 官方 native manifest：<https://downloads.claude.ai/claude-code-releases/2.1.212/manifest.json>
- Manifest build commit：`8b2783a8f907ce5c5ad1241ecdbab0ff3301c617`
- Manifest build time：`2026-07-16T16:50:33Z`
- Darwin arm64 binary SHA-256：`09ecba2ab2df9b6ee5b0695e26f65dea60fb3b6af3d3542ee09f466838d1e574`
- Darwin arm64 binary size：`244530512` bytes

`latest` 对照：

- npm `latest` / `next`：`2.1.220`
- GitHub Release published at：`2026-07-25T01:35:55Z`
- Wrapper 与 Darwin arm64 平台包均为 `2.1.220`
- Wrapper integrity：`sha512-ogBrvwkqF9f8okmnXKxmRNHuvtFxFEffe5pWdqOV3iQDxlUOKirFqnyWC7NGXXnDA4WkkbPH8pvSbwyCR2Auyw==`
- Darwin arm64 integrity：`sha512-rmtd41Bf+n+YnhjSjtQ8WG5qy8KKogUp3YRfQrkLsTgPUD0H3j869rBInBJT3SHrKQ0hLghQLGM73CC1C+USLQ==`

官方文档明确说明 npm wrapper 通过 per-platform optional dependency 安装与 standalone installer 相同类型的原生二进制，运行时不依赖 Node。wrapper 不能作为实现分析对象。

官方入口：

- [Claude Code overview](https://code.claude.com/docs/en/overview)
- [安装、发布通道与完整性](https://code.claude.com/docs/en/setup)
- [Claude Code changelog](https://code.claude.com/docs/en/changelog)
- [anthropics/claude-code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- [Claude Code releases](https://github.com/anthropics/claude-code/releases)

### 5.3 Qwen Code

发布基线：

- npm package：`@qwen-code/qwen-code@0.21.0`
- Release：[`v0.21.0`](https://github.com/QwenLM/qwen-code/releases/tag/v0.21.0)
- Release / npm `gitHead`：`5610eb405212f807a482214ddd28a259da7855d3`
- Commit subject：`chore(release): v0.21.0`
- Commit time：`2026-07-24T13:25:05Z`
- Tarball：<https://registry.npmjs.org/@qwen-code/qwen-code/-/qwen-code-0.21.0.tgz>
- Integrity：`sha512-h4t8crH1WTKS4I3uolOQGTzvGu7iW9DuqIegaq+v8yRXTyTkNV7k74AARHPWYh5DJL1ZY/ZCDsOuPsNhaLlnog==`
- 发行形态：ESM / Node bundle，`main=cli.js`，`bin.qwen=cli-entry.js`，Node `>=22`。
- npm 包约 88 MB 解包大小、882 个文件；包目录或源码目录的存在仍不能直接证明能力默认可用。

本地开发叠加层：

- checkout：`feat/image-zoom-file-mvp`
- tracking branch：`upstream/main`
- origin：<https://github.com/qqqys/qwen-code.git>
- HEAD：`69b991aa77fb65fd3d026508ccda13552e3ce02c`
- HEAD commit time：`2026-07-24T01:31:00Z`
- HEAD package version：`0.20.1`
- GitHub compare 显示发布 commit `5610eb4` 是本地 HEAD 之后的 28 个提交；因此本地 checkout 不能代替 `0.21.0` 发布基线。

阶段 1 调查稳定能力时，应使用 `v0.21.0` tagged source、npm 发行物和该版本 runtime。当前 checkout 只作为明确标注的开发叠加层；如需研究最新 `upstream/main`，必须另行冻结 SHA。

官方与本地入口：

- [QwenLM/qwen-code](https://github.com/QwenLM/qwen-code)
- [Qwen Code releases](https://github.com/QwenLM/qwen-code/releases)
- `docs/users/features/`
- `docs/developers/`
- `packages/cli/`
- `packages/core/`

## 6. 当前工作树排除边界

快照时已有 15 个 modified 和 3 个 untracked 文件。这些改动属于并行中的用户工作，不纳入任何能力结论：

```text
 M package-lock.json
 M packages/core/package.json
 M packages/core/src/config/config.test.ts
 M packages/core/src/config/config.ts
 M packages/core/src/core/coreToolScheduler.test.ts
 M packages/core/src/core/coreToolScheduler.ts
 M packages/core/src/permissions/autoMode.test.ts
 M packages/core/src/permissions/autoMode.ts
 M packages/core/src/permissions/permission-manager.test.ts
 M packages/core/src/permissions/permission-manager.ts
 M packages/core/src/permissions/rule-parser.ts
 M packages/core/src/services/loopDetectionService.test.ts
 M packages/core/src/services/loopDetectionService.ts
 M packages/core/src/tools/read-file.ts
 M packages/core/src/tools/tool-names.ts
?? packages/core/src/tools/file-read-permission.ts
?? packages/core/src/tools/zoom-image.test.ts
?? packages/core/src/tools/zoom-image.ts
```

对受影响路径的已提交状态，只能通过 `git show HEAD:<path>`、干净 worktree 或发布 tag 读取。

## 7. 版本漂移处理

- 每条 Claim 记录
  `product + version + release_channel + product_surface + last_checked`；每条
  Evidence 另记不可变的 `captured_at`。
- 新版本发布后不改写原结论；创建 delta，并只重跑受影响的证据和场景。
- Stable、latest、preview 和 dev-only 不得放在同一单元格中混算。
- Qwen 发布版、当前 HEAD 和未提交工作树是三个不同的证据层。
- 本阶段只冻结身份和研究边界，不把 release notes 中的功能描述写成对比结论。

## 8. 阶段 0 Review Gate

进入阶段 1 前需确认：

- 主矩阵以 CLI 核心闭环为中心，其他第一方 Surface 单独标注。
- Claude Code 以 `stable 2.1.212` 为主，`latest 2.1.220` 作为增量。
- Preview、nightly 和 dev-only 默认不参与稳定版胜负判断。
- 模型质量 benchmark 与价格总榜不在本系列主范围内。
- Qwen 稳定版证据以 `v0.21.0` 为准，当前 dirty checkout 不作为替代。
- Claim、Evidence、Runtime Probe、Support 和 Alignment 状态模型已经确认。
- 中立 taxonomy、topic/atomic 两级 ID、跨域主归属和验证场景已经确认。
