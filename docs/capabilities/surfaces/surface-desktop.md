# 桌面端

[返回 Headless、SDK 与多端详情目录](./README.md) · [打开网页详情](https://qqqys.github.io/code-agent/capability.html?id=surface-desktop)

> 核对日期：2026-10-10

## 定义

以独立桌面应用（原生、Electron 或 Tauri 一类带 Web 视图的壳）或官方桌面 IDE 提供 Agent 会话、文件审阅、终端和项目管理，而不是只在终端或编辑器插件中运行。

## 能力结论

| 产品 | 结论 | 证据状态 |
| --- | --- | --- |
| Claude Code | Claude Desktop Code 页签（macOS · Windows x64/ARM64 · Linux beta） | 官方确认 |
| Codex | ChatGPT Desktop Codex（macOS · Windows · Linux 预览） | 官方确认 |
| Qwen Code | Qwen Code Desktop（Tauri 2 壳 + 打包 CLI runtime，官方 Release 提供 macOS/Windows/Linux 安装包） | 官方确认 |
| Kimi Code | 官方桌面端 · `kimi install-desktop`（别名 `install-app`）与 `/desktop` 打开下载页 · 条件：`kimi app [path]` 唤起桌面端新会话（main 分支，尚未发布） | 条件项 |
| Qoder CLI | Qoder IDE（macOS 12+ · Windows 10+ · Linux `.deb`/`.rpm`） | 官方确认 |

## 比较边界

### 本页包含

- 官方桌面应用或官方桌面 IDE
- 本地 Agent 运行与文件审阅
- 桌面端特有的多会话、预览或计算机控制
- 桌面端的平台范围、安装与更新通道
- CLI 或 TUI 中唤起、下载桌面端的入口

### 本页不包含

- VS Code Extension 被当作独立桌面应用
- 浏览器 PWA
- 仅有仓库源码但没有产品定位的实验 UI
- 桌面端里逐条可用的 Slash 命令或 Headless 参数

## 跨产品事实

1. 五家都有桌面产品，但形态不同：Claude 是 Claude Desktop 的 Code 页签，Codex 是 ChatGPT 桌面应用内的 Codex，Qwen 是仓库内的 Tauri 2 壳，Qoder 是完整桌面 IDE，Kimi 的桌面端本体不在公开 CLI 仓库内、CLI 只提供唤起与下载页入口。
2. Linux 桌面端在 2026-10-09 核对时四家可用但阶段不同：Claude Desktop 标注 beta（只支持 Debian 系，apt 仓库或 `.deb`），ChatGPT 桌面应用标注 preview（Ubuntu 24.04/26.04 LTS、Debian 13、Fedora 43/44、Arch，x64 与 ARM64），Qwen Code Desktop 随 `desktop-v0.25.0` 发布 AppImage 与 `.deb`（amd64 与 arm64），Qoder 官方下载页把 Linux（`.deb`/`.rpm`）与 macOS 12+、Windows 10+ 并列；Kimi 桌面端的平台清单没有一手说明。
3. Computer Use 在 Linux 桌面端缺席：Claude 的 Linux beta 明确列出 Computer Use 与语音听写尚不可用，Codex 的 Linux 预览也写明 Computer Use 只在 macOS 与 Windows、后续版本再加。
4. 更新通道各不相同：Claude Desktop 在 macOS 与 Windows 启动时自更新、Linux 只能靠系统包管理器；ChatGPT 桌面应用的 Linux 包由签名的 OpenAI 包仓库经发行版包管理器更新；Qwen 桌面壳用 Tauri updater 读 `desktop-latest.json`；Kimi CLI 只打开下载页，不下载也不安装桌面端。
5. 桌面端经常增加 Worktree、多窗格、文件预览和会话管理，但不意味着 Headless 参数或全部 CLI 命令在 GUI 中可用：Claude Desktop 不支持 `--print`/`--output-format`，Agent Teams 仍是 CLI/SDK 能力。

## 逐产品记录

### Claude Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Claude Desktop Code 页签（macOS · Windows x64/ARM64 · Linux beta） |
| 入口与调用 | Claude Desktop 的 Code 页签；下载项为 macOS（Universal，Intel 与 Apple Silicon）、Windows（x64，另有 ARM64 安装器）与 Linux（beta，apt 或 `.deb`，Ubuntu 与 Debian）；安装后启动 Claude、登录并点开 Code 页签，Linux 可从应用启动器或终端运行 `claude-desktop`。 |
| 协议与输出 | 桌面 GUI 调用 Claude Code 运行时，可选择 Local、Remote 或 SSH 环境，Windows 上还可选择 WSL 2 发行版；应用分 Chat、Cowork 与 Code 三个页签，Code 页签是 Claude Code 的参考界面。 |
| 具体行为 | 并行会话与自动 Worktree、终端/编辑器/预览、多窗格、Side chat、Diff 评论、Computer Use、iOS Simulator 窗格、PR monitoring、Dispatch 会话与 scheduled task；Linux beta 提供与 macOS/Windows 相同的 Chat、Cowork 与 Code 体验（并行会话、可视化 Diff 审阅、集成终端与编辑器、实时应用预览）。 |
| 会话与状态 | 每个会话独立跟踪上下文和改动；Remote 会话关机后仍在云端继续；Linux 上登录状态存在桌面 keyring（GNOME Keyring 或 KDE Wallet），拿不到已解锁的 keyring 时登录不保存、每次启动都要重新登录。 |
| 工具与能力 | Local/SSH 可用项目配置、MCP 与 Plugins；Desktop 另有 Connectors 与 Computer Use；Skills、Plugins 与 Connectors 取自 claude.ai 账号同步的 Customize 配置，而不是 CLI 的 `~/.claude` 目录。 |
| 认证与权限 | Claude 账号（claude.ai 订阅或组织 SSO）；桌面端不直接接受 Console API Key，API Key 认证走 CLI；企业可用 managed settings 与管理台控制能力，设备策略在 macOS 走 MDM 的 `com.anthropic.claudefordesktop`、Windows 走注册表 `SOFTWARE\Policies\Claude`、Linux 走 root 所有的 `/etc/claude-desktop/managed-settings.json`（与 Claude Code 的 managed settings 是不同文件，非 root 可写时拒绝加载）。 |
| 运行位置 | macOS、Windows（x64 与 ARM64）与 Linux beta；Linux 要求 Debian 系发行版（Ubuntu 22.04 及以上或 Debian 12 及以上）与 x86_64 或 arm64，Fedora、Arch 等非 Debian 系改用 CLI，Windows 上的 WSL 2 装 Windows 桌面应用并在发行版内运行会话；会话可跑在 Local、Anthropic Remote 或用户 SSH 主机，Cowork 在 Linux 上把任务跑在桌面应用用 QEMU 与 KVM 托管的虚拟机里。 |
| 条件与边界 | Desktop 是交互式 Surface，不支持 `--print`/`--output-format`；Agent Teams 仍是 CLI/SDK 能力，桌面端内的多代理改用 dynamic workflows。Linux 支持标注为 beta：安装走 Anthropic 的 apt 仓库（签名密钥 `https://downloads.claude.ai/claude-desktop/key.asc`，指纹 `31DDDE24DDFAB679F42D7BD2BAA929FF1A7ECACE`，仓库项写入 `/etc/apt/sources.list.d/claude-desktop.list`，只发布 amd64 与 arm64），也可直接下载 `.deb` 安装，`/etc/default/claude-desktop` 写 `CLAUDE_DESKTOP_ADD_REPO="false"` 可跳过仓库注册；Linux 上应用不自更新，更新随 `sudo apt update && sudo apt upgrade` 或发行版图形更新器到达，`sudo apt remove claude-desktop` 会连带移除它注册的仓库项与签名密钥；以 root 启动且不加 `--no-sandbox` 不受支持。Linux beta 暂缺 Computer Use 与语音听写，Quick Entry 全局热键只在 X11 生效、原生 Wayland 需要桌面环境的 GlobalShortcuts portal，Fedora 与 RHEL 尚未支持。Cowork 另需固件开启硬件虚拟化、`qemu-system-x86`/`ovmf`/`virtiofsd`（x86_64）或 `qemu-system-arm`/`qemu-efi-aarch64`/`virtiofsd`（arm64）、用户在 `kvm` 组内并能打开 `/dev/kvm` 与 `/dev/vhost-vsock`，缺项时 Cowork 页签给出对应报错（Ubuntu 22.04 没有 `virtiofsd` 包时改用应用自带副本）。 |
| 证据状态 | 官方确认 |
| 来源 | [Claude Code Desktop](https://code.claude.com/docs/en/desktop)、[Claude Desktop on Linux (beta)](https://code.claude.com/docs/en/desktop-linux) |

### Codex

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | ChatGPT Desktop Codex（macOS · Windows · Linux 预览） |
| 入口与调用 | ChatGPT Desktop 中选择 Codex；macOS 与 Windows 从 `https://chatgpt.com/download/` 下载，Linux 预览版按发行版取 `.deb`（Ubuntu/Debian）、`.rpm`（Fedora）或 Arch 安装脚本，安装后从应用菜单打开或在终端运行 `chatgpt`。 |
| 协议与输出 | ChatGPT 桌面应用连接本地文件夹、Codex 本地运行时和 Cloud；在应用里选择 ChatGPT 或 Codex，Codex 从 New chat 开始，也可用 New chat 右侧的 Quick chat 图标提快速问题。 |
| 具体行为 | 集中管理项目和长运行任务，打开文件、审阅产物、使用浏览器/电脑工具并调度任务；Linux 预览版登录后同样可以处理项目、本地文件与 Codex。 |
| 会话与状态 | 项目和 chat 保存在 ChatGPT 工作区；Codex 本地与 Cloud task 按各自环境保留状态。 |
| 工具与能力 | 可使用本地文件、终端、浏览器、Computer Use 和 Plugins；具体工具受当前模式与权限控制；Computer Use 只在 macOS 与 Windows 可用，Linux 预览版还没有。 |
| 认证与权限 | ChatGPT 账号与工作区权限；Linux 预览版用同一 ChatGPT 账号登录。 |
| 运行位置 | macOS、Windows 与 Linux 预览版；Linux 预览支持 Ubuntu 24.04 LTS 与 26.04 LTS、Debian 13、Fedora 43 与 44、Arch Linux（当前完全更新的滚动版本），每个发行版都有 x64 与 ARM64 包。 |
| 条件与边界 | 当前桌面产品是 ChatGPT app 内的 Codex，不再是单独命名的 Codex App；Cloud task 与本地 folder task 仍需区分。Linux 为预览版：`.deb`/`.rpm` 由 `https://persistent.oaistatic.com/codex-app-prod/linux/` 提供，Arch 用 `install-arch.sh`（脚本检测架构、配置签名的 OpenAI 包仓库并执行一次需确认的完整系统升级）；安装后由发行版包管理器更新（`sudo apt install --only-upgrade chatgpt`、`sudo dnf upgrade --refresh chatgpt`、`sudo pacman -Syu`）；其他 Linux 发行版可能可用但不受正式支持。原生 Wayland 支持仍是实验性，Wayland 会话默认走 XWayland，可用 `chatgpt --ozone-platform=wayland` 显式选择原生 Wayland，浮动窗口、窗口定位、焦点与快捷键可能不完整。 |
| 证据状态 | 官方确认 |
| 来源 | [ChatGPT desktop app](https://learn.chatgpt.com/docs/app)、[ChatGPT desktop app for Linux（preview）](https://learn.chatgpt.com/docs/linux/linux-app) |

### Qwen Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Qwen Code Desktop（Tauri 2 壳 + 打包 CLI runtime，官方 Release 提供 macOS/Windows/Linux 安装包） |
| 入口与调用 | Qwen Code Desktop；官方 GitHub Release `desktop-v0.25.0`（2026-10-05）提供 macOS `.dmg`（arm64 与 x64）与 `.app.tar.gz`（含 `.sig`）、Linux AppImage 与 `.deb`（amd64 与 arm64，含 `.sig`）、Windows `Qwen-Code-Desktop_0.25.0_x64-setup.exe`（含 `.sig`），另有 `SHA256SUMS.txt` 与更新清单 `desktop-latest.json`。 |
| 协议与输出 | Tauri 2 壳（`packages/desktop`，`productName` 为 `Qwen Code Desktop`、`identifier` 为 `com.alibaba.qwen-code`）包住既有 Web Shell：应用启动时在临时 loopback 端口拉起 `qwen serve`、带每次启动生成的 bearer token，等 `/health` 就绪后在原生窗口里打开同一个 daemon 提供的 Web Shell；`npm run build:runtime` 把当前平台的 Node.js、打包的 `qwen` CLI 与构建好的 Web Shell（`lib/web-shell/`）放进 `runtime/qwen-code/`，再作为 bundle 资源随安装包分发。 |
| 具体行为 | 界面与能力来自 daemon 提供的 Web Shell，壳本身不含第二套 UI；窗口缩放用 `Cmd`/`Ctrl` + `-`/`=`/`0` 或 `Ctrl`+滚轮，选定的比例下次启动恢复；Settings → Daemon → Local Control 可临时把在跑的 daemon 共享给同一 Wi-Fi 上的手机（Web Shell 显示二维码、共享期间保持机器唤醒、关闭时关掉 LAN 监听）；`QWEN_DESKTOP_WORKSPACE` 覆盖初始工作区，未设置时恢复已保存的主工作区或在首次启动创建 `~/Documents/Qwen`（`QWEN_DEFAULT_WORKSPACE_DIR` 改这个默认目录），DevTools 用 `Cmd+Option+I`（macOS）或 `Ctrl+Shift+I`（Windows/Linux）打开。 |
| 会话与状态 | 本地优先保存 workspace 与会话，会话状态由 `qwen serve` daemon 承载；壳自己的状态（保存的工作区、窗口位置、缩放比例）写在 `~/Library/Application Support/com.alibaba.qwen-code/desktop-state.json`，daemon 日志写在 `~/Library/Logs/com.alibaba.qwen-code/desktop-runtime.log`（macOS 路径）。 |
| 工具与能力 | 使用 Web Shell 背后的 Qwen Code runtime：模型发现、MCP、REST/文件 source、Skills、Permission mode 与 Automation。 |
| 认证与权限 | 复用 Qwen Code runtime 认证；桌面壳不保存第三方 LLM API key。 |
| 运行位置 | 官方 Release 提供 macOS（arm64 与 x64）、Windows（x64）与 Linux（AppImage 与 `.deb`，amd64 与 arm64）安装包；`tauri.conf.json` 的 bundle targets 为 `app`/`dmg`/`nsis`/`appimage`/`deb`，macOS 最低系统版本 11.0 并开启 hardened runtime 与 entitlements，Windows 用 NSIS 按当前用户安装并以 downloadBootstrapper 静默安装 WebView2；更新经 Tauri updater，端点为 `https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/desktop/latest/desktop-latest.json` 与 GitHub `desktop-latest` Release 上的同名清单。 |
| 条件与边界 | 桌面包在仓库 workspace 中被排除于根 npm workspace，用 Tauri/Rust 与打包 runtime 独立构建（`npm install --workspaces=false`、`npm run build:runtime --workspaces=false`、`npm run dev --workspaces=false`），功能不能自动计入 CLI；`QWEN_DESKTOP_DISABLE_UPDATES=1` 关闭启动时的更新检查与提示，发布签名更新需要 Tauri updater 私钥（`TAURI_SIGNING_PRIVATE_KEY` 必须与配置里的公钥匹配），macOS 另需 Apple 签名与公证凭据。此前记录的 Electron + ACP 形态已过期：旧 `packages/desktop`（Electron，经 ACP 驱动 CLI）在 2026-08-25 提交 `ce72ddbe6cfe`（PR #9085）移除，Tauri 壳原名 `packages/desktop-shell`，2026-09-25 提交 `73aa65a4b41e`（PR #12653）改名为 `packages/desktop`；Electron→Tauri 更新桥沿用旧的产品名与应用标识，Windows 安装器（NSIS hook `windows/electron-migration.nsh`）在写入文件前用已注册的卸载器移除匹配的按用户 Electron 安装并保留用户数据，macOS ZIP 由签名并公证的 Tauri app 生成，Linux AppImage 更新直接替换当前 AppImage。 |
| 证据状态 | 官方确认 |
| 来源 | [Qwen Code Desktop 壳 README（Tauri 2）](https://github.com/QwenLM/qwen-code/blob/e3c5360e5a718549f7ace9be61ef830ed097a81a/packages/desktop/README.md)、[Qwen Code Desktop Tauri 配置（bundle 目标、平台要求与 updater 端点）](https://github.com/QwenLM/qwen-code/blob/e3c5360e5a718549f7ace9be61ef830ed097a81a/packages/desktop/src-tauri/tauri.conf.json)、[Qwen Code Desktop v0.25.0 Release 与安装包](https://github.com/QwenLM/qwen-code/releases/tag/desktop-v0.25.0)、[Qwen Code desktop-shell 改名为 desktop 提交（PR #12653）](https://github.com/QwenLM/qwen-code/commit/73aa65a4b41e674e8729011a648e8f0a577902f2)、[Qwen Code 移除 Electron 桌面包提交（PR #9085）](https://github.com/QwenLM/qwen-code/commit/ce72ddbe6cfe3c10fe51a0f7cd0116320b690529)、[Qwen Code Electron→Tauri 更新桥设计文档](https://github.com/QwenLM/qwen-code/blob/e3c5360e5a718549f7ace9be61ef830ed097a81a/docs/design/desktop-electron-to-tauri-update-bridge.md) |

### Kimi Code

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | 官方桌面端 · `kimi install-desktop`（别名 `install-app`）与 `/desktop` 打开下载页 · 条件：`kimi app [path]` 唤起桌面端新会话（main 分支，尚未发布） |
| 入口与调用 | 官方桌面端由 CLI 唤起或引导安装：`kimi app [path]`（省略路径时用当前目录）打开桌面端并在该目录开始新会话，`kimi install-desktop`（隐藏别名 `kimi install-app`）打印桌面端页面地址并在默认浏览器打开，TUI 内 `/desktop`（别名 `/install-desktop`）打开同一页面；桌面端本体不在公开的 kimi-code 仓库内。 |
| 协议与输出 | `kimi app` 把路径按当前目录解析为绝对路径，再请系统打开 `kimi-code://open?root=<URL 编码路径>&new=1`；打开动作按平台走 macOS `open`、Windows `powershell.exe -NoProfile -NonInteractive -EncodedCommand`（内部执行 `Start-Process -FilePath <url> -ErrorAction Stop`）或 Linux `xdg-open`，opener 先经 PATH 解析成绝对可执行文件（Windows 按 `PATHEXT`，缺省 `.COM`/`.EXE`/`.BAT`/`.CMD`），落在当前工作目录内的命中会被跳过以免执行工作区里植入的二进制，当前目录本身是文件系统根时不受该限制；`install-desktop` 与 `/desktop` 打开的地址由 `kimiCodeOfficialInstallUrl()` 取 `${siteBase}/code`，随区域为 `https://www.kimi.com/code`（国内）或 `https://www.kimi.ai/code`（全球）。 |
| 具体行为 | `kimi app` 只负责唤起，不下载也不安装桌面端：目标工作区已存在时桌面端打开新草稿而不恢复之前的会话，系统报告打不开时向 stderr 写 “Could not open Kimi Code desktop. Run `kimi install-desktop` to install it.” 并把退出码置 1；`kimi install-desktop` 没有任何选项，先把地址写到 stdout 再打开浏览器；`/desktop` 在 TUI 里显示 “<url> — opened in your browser” 状态行后打开同一页面。 |
| 会话与状态 | CLI 侧不保存桌面端状态，也不检测桌面端版本；桌面端是否与 CLI 会话共享 home 目录或会话历史，官方文档没有说明。 |
| 工具与能力 | CLI 只提供唤起与打开下载页两个动作，不声明桌面端的工具集；桌面端可用的工具、权限模式与文件边界没有公开文档。 |
| 认证与权限 | 唤起桌面端与打开下载页都不需要登录；桌面端自身的登录方式未确认。 |
| 运行位置 | CLI 与 TUI 入口在 macOS、Windows 与 Linux 都能发起（分别用 `open`、PowerShell `Start-Process`、`xdg-open`）；官方产品页把 Kimi Code 的入口分为 Desktop、Terminal 与 IDE 三类，但桌面端支持的平台、架构与安装包形式在核对日期没有一手说明，记为未确认。 |
| 条件与边界 | `kimi app` 需要已安装支持从 CLI 打开工作区的桌面端版本；CLI 不做版本检测，已安装的旧桌面端可能静默忽略这个链接，失败提示只在系统 opener 报错时出现。`/desktop`（别名 `/install-desktop`）与 `kimi install-app` 随 2.0.0（2026-09-17）发布，2.0.1（2026-09-18）把子命令改名为 `kimi install-desktop` 并保留旧名为隐藏别名；`kimi app [path]` 于 2026-10-09 经 PR #4145 合入 main（合并提交 `242ac2300064`，changeset `.changeset/open-desktop-app.md` 给 `@moonshot-ai/kimi-code` 记 minor），核对日期最新 Release 仍是 2.1.1（2026-09-24），因此该子命令尚未发布。此前记录的“无独立桌面端”已过期：官方 CLI 参考与斜杠命令表都把该页面记为可下载并安装的桌面端应用。桌面端能力不自动计入 CLI，VS Code Extension 与本地 Web UI 也不等于桌面端。 |
| 证据状态 | 条件项 |
| 来源 | [Kimi Code CLI 参考（`kimi app` 与 `kimi install-desktop` 章节）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/reference/kimi-command.md)、[Kimi Code 斜杠命令表（`/desktop` 与 `/install-desktop` 行）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/reference/slash-commands.md)、[Kimi Code 中文更新日志（2.0.0 新增 `/desktop`、2.0.1 改名 `install-desktop`）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/release-notes/changelog.md)、[Kimi Code `kimi app` 子命令源码](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/cli/sub/app.ts)、[Kimi Code `kimi install-desktop` 子命令源码](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/cli/sub/install-desktop.ts)、[Kimi Code `/desktop` TUI 命令源码](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/tui/commands/desktop.ts)、[Kimi Code 系统 URL 打开器源码（open/Start-Process/xdg-open）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/utils/open-url.ts)、[Kimi Code PATH 可执行文件解析源码（跳过 cwd 内命中）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/utils/process/resolve-command.ts)、[Kimi Code `kimi app` changeset（minor）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/.changeset/open-desktop-app.md)、[Kimi Code PR #4145（`kimi app [path]` 合入 main）](https://github.com/MoonshotAI/kimi-code/pull/4145)、[Kimi Code 2.0.0 发布说明（新增 `/desktop` 与 `kimi install-app`）](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.0.0)、[Kimi Code 2.0.1 发布说明（`install-app` 改名 `install-desktop`）](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.0.1)、[Kimi Code 2.1.1 发布说明（核对日期最新 Release，不含 `kimi app`）](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.1.1)、[Kimi Code 官方产品页（Desktop / Terminal / IDE 入口）](https://www.kimi.ai/code) |

### Qoder CLI

| 字段 | 记录 |
| --- | --- |
| 矩阵结论 | Qoder IDE（macOS 12+ · Windows 10+ · Linux `.deb`/`.rpm`） |
| 入口与调用 | Qoder IDE，官方桌面编辑器；下载入口是 `https://qoder.com/download`，官方快速上手要求从该页取安装包；另有 JetBrains Plugin。 |
| 协议与输出 | 完整桌面 IDE 集成 Agent、项目索引、编辑器、终端与 Qoder 账号服务。 |
| 具体行为 | 打开/克隆项目、索引代码、Chat/Quest Agent、审阅改动并使用 IDE 内浏览器与工具；快捷键按 macOS 与 Windows 分别给出（`⌘O`/`Ctrl O` 打开项目、`⌥P`/`Alt P` 触发补全、`⌘I`/`Ctrl I` 打开 Inline Chat、`⌘L`/`Ctrl L` 打开 Chat 并选 Ask 或 Agent）。 |
| 会话与状态 | IDE 管理本地项目、索引和 Agent conversation；可与 Cloud/Remote task 联动。 |
| 工具与能力 | 提供 IDE Agent、终端、Sandbox、浏览器、索引、Rules 和 MCP 等产品能力。 |
| 认证与权限 | Qoder 账号，可用 Google/GitHub 等登录；IDE 内点用户图标或按 `⌘⇧,`（macOS）/`Ctrl Shift ,`（Windows）打开 Sign in。 |
| 运行位置 | 官方下载页的 Qoder IDE 下载项为 macOS 12+、Windows 10+ 与 Linux（`.deb`/`.rpm`）；同页把 QoderWake（AI Employees）桌面端列为 macOS 13+、Windows 10+ 与 Linux 安装脚本，QoderWork 仍提供 Mac x64/ARM64 `.dmg` 与 Windows x64 用户/系统安装器。 |
| 条件与边界 | Qoder IDE 是与 qodercli 并列的产品 Surface；IDE 索引和 Quest 等能力不自动算作 CLI 能力。下载页顶部的主下载区另列 HarmonyOS 6.1.1+ 项，页面没有说明它对应哪个构建，记为未确认；同页公告 QoderWork 于 2027-09-05 停止运营，建议提前迁移到 Qoder Desktop（内置任务历史、Skill 与记忆的数据导入工具），过渡期内 QoderWork 仍可下载和使用。 |
| 证据状态 | 官方确认 |
| 来源 | [Qoder IDE quick start](https://docs.qoder.com/quick-start)、[Qoder 官方下载页（IDE、JetBrains Plugin、CLI、QoderWake 与 QoderWork 下载项）](https://qoder.com/download)、[Qoder CLI Documentation](https://docs.qoder.com/en/cli) |

## 官方来源

- [Claude Code Desktop](https://code.claude.com/docs/en/desktop)
- [Claude Desktop on Linux (beta)](https://code.claude.com/docs/en/desktop-linux)
- [ChatGPT desktop app](https://learn.chatgpt.com/docs/app)
- [ChatGPT desktop app for Linux（preview）](https://learn.chatgpt.com/docs/linux/linux-app)
- [Qwen Code Desktop 壳 README（Tauri 2）](https://github.com/QwenLM/qwen-code/blob/e3c5360e5a718549f7ace9be61ef830ed097a81a/packages/desktop/README.md)
- [Qwen Code Desktop Tauri 配置（bundle 目标、平台要求与 updater 端点）](https://github.com/QwenLM/qwen-code/blob/e3c5360e5a718549f7ace9be61ef830ed097a81a/packages/desktop/src-tauri/tauri.conf.json)
- [Qwen Code Desktop v0.25.0 Release 与安装包](https://github.com/QwenLM/qwen-code/releases/tag/desktop-v0.25.0)
- [Qwen Code desktop-shell 改名为 desktop 提交（PR #12653）](https://github.com/QwenLM/qwen-code/commit/73aa65a4b41e674e8729011a648e8f0a577902f2)
- [Qwen Code 移除 Electron 桌面包提交（PR #9085）](https://github.com/QwenLM/qwen-code/commit/ce72ddbe6cfe3c10fe51a0f7cd0116320b690529)
- [Qwen Code Electron→Tauri 更新桥设计文档](https://github.com/QwenLM/qwen-code/blob/e3c5360e5a718549f7ace9be61ef830ed097a81a/docs/design/desktop-electron-to-tauri-update-bridge.md)
- [Kimi Code CLI 参考（`kimi app` 与 `kimi install-desktop` 章节）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/reference/kimi-command.md)
- [Kimi Code 斜杠命令表（`/desktop` 与 `/install-desktop` 行）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/reference/slash-commands.md)
- [Kimi Code 中文更新日志（2.0.0 新增 `/desktop`、2.0.1 改名 `install-desktop`）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/docs/zh/release-notes/changelog.md)
- [Kimi Code `kimi app` 子命令源码](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/cli/sub/app.ts)
- [Kimi Code `kimi install-desktop` 子命令源码](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/cli/sub/install-desktop.ts)
- [Kimi Code `/desktop` TUI 命令源码](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/tui/commands/desktop.ts)
- [Kimi Code 系统 URL 打开器源码（open/Start-Process/xdg-open）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/utils/open-url.ts)
- [Kimi Code PATH 可执行文件解析源码（跳过 cwd 内命中）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/apps/kimi-code/src/utils/process/resolve-command.ts)
- [Kimi Code `kimi app` changeset（minor）](https://github.com/MoonshotAI/kimi-code/blob/242ac230006447f8601e1678c49182bfbae89fe9/.changeset/open-desktop-app.md)
- [Kimi Code PR #4145（`kimi app [path]` 合入 main）](https://github.com/MoonshotAI/kimi-code/pull/4145)
- [Kimi Code 2.0.0 发布说明（新增 `/desktop` 与 `kimi install-app`）](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.0.0)
- [Kimi Code 2.0.1 发布说明（`install-app` 改名 `install-desktop`）](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.0.1)
- [Kimi Code 2.1.1 发布说明（核对日期最新 Release，不含 `kimi app`）](https://github.com/MoonshotAI/kimi-code/releases/tag/%40moonshot-ai%2Fkimi-code%402.1.1)
- [Kimi Code 官方产品页（Desktop / Terminal / IDE 入口）](https://www.kimi.ai/code)
- [Qoder IDE quick start](https://docs.qoder.com/quick-start)
- [Qoder 官方下载页（IDE、JetBrains Plugin、CLI、QoderWake 与 QoderWork 下载项）](https://qoder.com/download)
- [Qoder CLI Documentation](https://docs.qoder.com/en/cli)

## 关联能力

- [IDE 与 ACP](./surface-ide.md)
- [Web 界面](./surface-web.md)
- [CLI](./surface-cli.md)
- [并行 Worktree](../execution/execution-worktree.md)
