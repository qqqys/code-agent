# Codex 便携 Agent Plugin 清单与 extension-plugins 字段深化

Codex 在 2026-08-02 的提交中增加了对便携 Agent Plugin 清单的支持：根目录 `plugin.json`（`$schema` 指向 `agent-plugins.org/schemas/1.0.0/plugin.schema.json`）与原有 `.codex-plugin/plugin.json` 并存，用于插件发现、打包和安装。本次把这个一手确认的清单格式并入现有 `extension-plugins` 字段的 Codex 详情（不新增同义字段），并在跨产品事实中记录这是当前唯一公开支持该清单的产品。

## 修正

- `extension-plugins` 矩阵 Codex 列保持 `/plugins`（清单格式不是命令，不进矩阵短结论）。
- Codex 详情的文件与目录新增：也接受根目录 `plugin.json`（`$schema` 指向 `agent-plugins.org/schemas/1.0.0/plugin.schema.json`）的便携 Agent Plugin 清单。
- Codex 详情的条件与边界新增：便携清单只要求 `$schema` 和 `name`（允许点号，最长 64 字符）；`version` 缺省为 `1.0.0`，非目录安全版本内部派生 `agent-plugins-<sha256-hex>` 目录名且不改写原清单；Agent Plugin 跳过旧式命令迁移；安装时拒绝符号链接和不受支持的文件类型。
- 跨产品事实新增：Codex 在仓库中增加了对 `agent-plugins.org` 1.0.0 清单的支持，`extensions` 字段按反向域名命名空间承载客户端特定数据；其余四家当前一手资料未列出对同一清单的支持。
- 新增来源 `codex-portable-plugins`，固定到实现提交 SHA。

## 影响页面

- [扩展系统矩阵](../docs/05-扩展系统矩阵.md)
- [插件分发详情](../docs/capabilities/extensions/extension-plugins.md)

## 证据版本

- Codex 官方仓库提交 `2b5bdcf67547860f2e5c5a605009a70026796b2b`（`Support portable Agent Plugins throughout installation (#36544)`），在 `codex-rs/core-plugins/src/store.rs`、`plugin_bundle_archive.rs`、`remote_bundle.rs` 和 `codex-rs/plugin/src/plugin_id.rs` 中增加对根目录 Agent Plugin 清单的识别、打包、安装和版本处理。
- `agent-plugins.org/schemas/1.0.0/plugin.schema.json` 公开可访问，定义 `$schema`（必填）、`name`（必填，允许点号，最长 64 字符）、`version`、`description`、`author`、`homepage`、`repository`、`license`、`keywords` 和 `extensions`（反向域名命名空间对象）字段，根对象不允许额外属性。
- Codex 官方文档 Plugins 与 Build plugins 页面当前仍只列出 `.codex-plugin/plugin.json`，尚未记录便携清单格式。
