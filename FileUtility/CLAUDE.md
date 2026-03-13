# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指引。

## 项目简介

FileUtility 是一个 Chrome 扩展（Manifest V3），用于文件迁移与去重。它生成 bash 脚本，由用户在本地执行实际的文件操作。

## 无构建流程

这是一个纯静态 Chrome 扩展，无打包工具、无包管理器、无转译。直接编辑文件，在 Chrome 中重新加载扩展即可测试。

加载/重新加载方式：`chrome://extensions` → 开启开发者模式 → 加载已解压的扩展程序（指向此目录）→ 编辑后点击刷新。

## 架构

```
manifest.json         # 扩展清单 v3
background.js         # Service Worker：点击图标时打开/聚焦工具页
styles.css            # 公共深色主题样式（CSS 变量）
pages/
  index.html          # 主界面（两 Tab 布局）
  index.js            # 全部应用逻辑（约 700 行）
```

**单页应用模式**：`pages/index.js` 通过直接操作 DOM 处理两个功能的所有逻辑，无路由、无框架。

### 功能一：迁移文件

用户通过 `<input webkitdirectory>` 选择源目录和目标目录。应用对比文件后生成 `copy_increment.sh` bash 脚本，使用 `cp -n` 仅复制新增/非重复文件。

### 功能二：文件去重

用户选择一个目录，应用通过流式读取（`File.stream()` + `crypto.subtle.digest('SHA-256')`）计算所有文件的 SHA-256 哈希值以控制内存占用。重复文件组以分页形式展示，用户勾选要删除的文件后生成 `delete_dupes.sh` bash 脚本。

### 关键实现细节

- 文件哈希：基于流的分块处理，无服务端、无外部依赖
- 批量处理，可配置批次大小，避免内存溢出
- 路径规范化，同时兼容 Windows（`\`）和 Unix（`/`）路径分隔符
- 脚本生成经过防抖处理，避免 UI 快速变化时重复计算
- 扩展本身不执行任何文件操作，仅生成脚本供用户运行

## 权限

扩展仅使用 `storage` 权限（Chrome API）。文件访问通过浏览器原生 `<input webkitdirectory>` 实现，无需 `fileSystem` 权限。
