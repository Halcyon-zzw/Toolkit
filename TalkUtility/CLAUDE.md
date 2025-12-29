# CLAUDE.md

这个文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

TalkUtility 是一个 Chrome 浏览器扩展程序（Manifest V3），主要用于说客英语（talk915.com）教师管理系统的辅助工具。当前版本：2.5.4

**核心域名**：
- `https://www.talk915.com/*` - 主要业务域名
- `https://trmk.teachingrecord.com/*` - 教学记录管理域名

## 项目架构

### 目录结构
```
TalkUtility/
├── manifest.json          # Chrome 扩展配置文件
├── popup.html/js          # 主弹出窗口（标签页切换容器）
├── content.js             # 内容脚本（自动填充登录表单）
├── styles.css             # 全局样式
├── features/              # 功能模块目录（每个功能独立）
│   ├── feature1/          # 账号处理
│   ├── feature2/          # 课程统计
│   ├── feature3/          # 迟到提醒
│   └── feature4/          # 差评处理
├── assets/                # 静态资源（Excel模板等）
├── lib/                   # 第三方库（xlsx.full.min.js）
└── docs/                  # 文档目录
    ├── CHANGELOG_TALK_UTILITY.md
    ├── prompt/            # 功能需求文档
    └── demand/            # 需求文档
```

### 架构设计模式

**主窗口采用标签页 + iframe 架构**：
- `popup.html` 作为容器，包含4个功能标签按钮
- `popup.js` 负责标签切换，通过修改 iframe 的 `src` 属性加载对应功能页面
- 每个功能在 `features/` 下有独立的 HTML 和 JS 文件
- 功能间完全隔离，互不干扰

**功能模块独立性**：
- 每个 feature 包含：`popup_featureN.html` + `featureN.js`
- 所有功能通过 iframe 加载，拥有独立的 DOM 环境
- Chrome Storage API (`chrome.storage.sync`) 用于跨页面数据共享

## 四大核心功能

### 功能1：账号处理 (feature1)
**文件**：`features/feature1/popup_feature1.html`、`feature1.js`

**功能描述**：
1. 从文本模板中提取说客账号和密码（正则匹配）
2. 提取后的账号密码可一键复制到剪贴板
3. 保存到 Chrome Storage 并自动跳转/刷新登录页面
4. 从文本模板提取教师姓名，查询当前时段课程列表（表格展示）

**关键 API**：
- 登录：`POST https://www.talk915.com/users/user/login`
- 查询教师列表：`POST https://www.talk915.com/users/teacherProxy/queryScheduledClassesSelectList`
- 查询课程列表：`POST https://www.talk915.com/users/teacherProxy/queryScheduledClassesList`

**注意**：
- 支持双账号登录重试逻辑（ta-peng / ta-fonpeng）
- 课程列表按时间排序展示

### 功能2：课程统计 (feature2)
**文件**：`features/feature2/popup_feature2.html`、`feature2.js`

**功能描述**：
1. 上传 Excel 文件（使用 `lib/xlsx.full.min.js` 解析）
2. 统计处理 Excel 数据
3. 提供模板下载（`assets/talk_template.xlsx`）
4. 支持再次进入页面时继续统计（状态保持）

### 功能3：迟到提醒 (feature3)
**文件**：`features/feature3/popup_feature3.html`、`feature3.js`

**功能描述**：
- 生成迟到提醒文案

**版本历史**：
- v2.5.4 (2025-12-24)：迟到提醒文案修改
- v2.5.2 (2025-10-13)：首次添加此功能

### 功能4：差评处理 (feature4)
**文件**：`features/feature4/popup_feature4.html`、`feature4.js`

**功能描述**：
1. 上传 Excel 文件（包含教师姓名、课程ID、处理内容等）
2. 批量处理差评记录：
   - 通过教师姓名查询 user_id
   - 查询对应的差评列表（follow_status=2）
   - 保存备注到差评记录
   - 根据处理内容更新跟进状态（包含"已移除"时更新为3）
   - 验证处理结果
3. 导出处理结果 Excel

**关键 API（基于 trmk.teachingrecord.com）**：
- 登录：`POST /api/login` (用户名: Seven)
- 搜索用户：`GET /api/search/user?name={teacherName}`
- 获取差评列表：`GET /api/evaluation/list?follow_status=2&user_id={userId}`
- 保存任务：`POST /api/task/add`
- 更新跟进状态：`POST /api/evaluation/operation?follow_status=3&id={evaluateId}`

**详细实现文档**：参见 `docs/prompt/prompt_feature4.md`

## Content Script 机制

**文件**：`content.js`

**作用**：在 `https://www.talk915.com/teacher/login*` 页面自动填充账号密码

**实现细节**：
- 从 Chrome Storage 读取账号密码
- 使用重试机制对抗 Vue.js 的双向绑定和浏览器自动填充
- 使用 MutationObserver 监听 DOM 变化
- 多次触发 input/change 事件确保 Vue 实例更新
- 直接修改 Vue 实例数据（`__vue__.ruleForm`）

## 开发指南

### 修改已有功能
1. 定位到 `features/featureN/` 目录
2. 修改对应的 `featureN.js` 或 `popup_featureN.html`
3. 如需跨功能通信，使用 `chrome.storage.sync`

### 添加新功能（功能5示例）
1. 在 `features/` 下创建 `feature5/` 目录
2. 创建 `popup_feature5.html` 和 `feature5.js`
3. 在 `popup.html` 中添加标签按钮（如 `featureFiveBtn`）
4. 在 `popup.js` 中添加对应的 `switchFeature` 事件监听器
5. 更新 `manifest.json` 中的版本号

### 测试扩展
1. 打开 Chrome 浏览器
2. 进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目根目录

### 发布新版本
1. 修改 `manifest.json` 中的 `version` 字段
2. 在 `docs/CHANGELOG_TALK_UTILITY.md` 中记录更新内容
3. 遵循语义化版本规范（Semantic Versioning）

## 关键技术点

### Chrome Extension API
- **Storage API**：`chrome.storage.sync.get/set` 用于数据持久化
- **Tabs API**：`chrome.tabs.query/create/reload` 用于标签页操作
- **Scripting API**：通过 `content_scripts` 注入 content.js

### 外部依赖
- **SheetJS (xlsx.full.min.js)**：用于 Excel 文件的读取和生成
  - 位置：`lib/xlsx.full.min.js`
  - 在 `manifest.json` 中声明为 `web_accessible_resources`

### 跨域请求
- 通过 `host_permissions` 声明允许访问的域名
- Manifest V3 下，content script 中的 fetch 请求会受到 CORS 限制
- 后台页面或 popup 页面中的请求不受 CORS 限制

### Vue.js 页面处理
- 说客英语登录页面使用 Vue.js
- 自动填充需要同时修改 DOM 值和 Vue 实例数据
- 访问 Vue 实例：`element.__vue__`

## 常见问题

### 自动填充不生效
- 检查 `content.js` 是否正确加载（在 DevTools Console 中查看）
- 验证 Chrome Storage 中是否存有账号密码
- 确认页面 URL 匹配 `manifest.json` 中的 `matches` 规则

### Excel 处理异常
- 确保 `lib/xlsx.full.min.js` 正确加载
- 检查 Excel 文件格式（需要 .xlsx 格式）
- 查看浏览器 Console 是否有错误信息

### API 请求失败
- 检查 `host_permissions` 是否包含目标域名
- 验证 token/access_token 是否有效
- 使用浏览器 Network 面板查看请求详情

## 命名约定

- 功能模块目录：`featureN`（N 为数字）
- HTML 文件：`popup_featureN.html`
- JS 文件：`featureN.js`
- 按钮 ID：`featureNBtn`（驼峰命名）
- 中文功能名称在 `popup.html` 的按钮文本中定义

## 相关文档

- 更新日志：`docs/CHANGELOG_TALK_UTILITY.md`
- 功能需求文档：`docs/prompt/prompt_featureN.md`
- Chrome Extension 官方文档：https://developer.chrome.com/docs/extensions/
