# JSON Master Pro

🚀 一个纯前端的现代化 JSON 工具集，无需后端，开箱即用。支持格式化、对比、转换、Mock 数据生成、JSONPath 查询及性能分析等功能。

![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![No Backend](https://img.shields.io/badge/backend-none-orange?style=flat-square)

## ✨ 在线体验

直接访问 [GitHub Pages 演示地址](https://your-username.github.io/json-master-pro/) (请替换为您的实际地址)

## 🎯 核心功能

### 📝 基础工具
- **JSON 格式化/压缩**: 智能缩进，语法高亮，支持搜索匹配
- **JSON 树视图**: 可折叠/展开的交互式树形结构，支持节点路径复制
- **JSON 对比**: 左右栏差异对比，高亮显示增删改，支持快速跳转
- **JSON ⇄ String**: 字符串转义/反转义，支持循环解套和美化输出
- **JSON ⇄ Java**: 
  - 生成 Java Map 代码 (支持 var 关键字)
  - 生成 Java Bean (Lombok @Builder, @Data, Jackson 注解)

### 🆕 高级功能
- **🎭 Mock 数据生成**: 
  - 基于 JSON 结构或 Java Bean 生成模拟数据
  - 集成 Faker.js 生成真实姓名、邮箱、电话、地址等
  - 支持自定义规则和批量数组生成 (1-100 条)
  
- **🔍 JSON 查询与过滤**:
  - 支持 **JSONPath** (`$.store.book[*].author`)
  - 支持 **JMESPath** (`people[*].name`)
  - 在线执行测试，实时显示结果和类型统计
  
- **📊 性能分析**:
  - 解析耗时统计 (毫秒级)
  - 文件大小自适应显示 (B/KB/MB/GB)
  - 键值对数量、最大深度计算
  - Null 值统计、重复值检测
  - 数据类型分布可视化

## 🏗️ 技术架构

采用模块化设计，便于扩展和维护：

```
json-master-pro/
├── index.html              # 主框架 (UI 布局 + CDN 依赖)
├── js/
│   ├── core/
│   │   ├── app.js          # 应用核心 (Tab 管理 + 模块注册)
│   │   ├── toast.js        # 通知系统 (替代 alert)
│   │   └── utils.js        # 通用工具函数
│   └── modules/
│       ├── format.js       # 格式化模块
│       ├── tree.js         # 树视图模块
│       ├── compare.js      # 对比模块
│       ├── convert.js      # 转换模块
│       ├── java.js         # Java 代码生成模块
│       ├── mock.js         # Mock 数据生成模块 ⭐
│       ├── query.js        # JSON 查询模块 ⭐
│       └── analyze.js      # 性能分析模块 ⭐
```

### 模块注册机制

每个功能模块独立实现，通过 `App.registerModule()` 注册到框架：

```javascript
// js/modules/mock.js 示例
App.registerModule('mock', {
  init() {
    // 初始化逻辑
  },
  onInput(data) {
    // 处理输入数据
  }
});
```

## 🚀 快速开始

### 方式一：GitHub Pages 部署 (推荐)

1. Fork 本仓库
2. 启用 GitHub Pages (Settings → Pages → Source: main branch)
3. 访问 `https://your-username.github.io/json-master-pro/`

**无需构建步骤，无需 Node.js，纯静态文件直接运行！**

### 方式二：本地运行

直接使用浏览器打开 `index.html` 即可：

```bash
# 方式 A: 直接双击打开
open index.html

# 方式 B: 使用本地服务器 (避免 CORS 问题)
npx serve .
# 或
python3 -m http.server 8080
```

## 🎨 特性亮点

- ✅ **纯前端**: 无后端依赖，数据完全在本地处理，安全隐私
- ✅ **模块化**: Tab 功能独立拆分，易于扩展新功能
- ✅ **响应式**: 适配桌面和移动端，暗色主题护眼
- ✅ **高性能**: 输入防抖处理，大数据量优化
- ✅ **友好提示**: 全 Toast 通知系统，无打断式 alert
- ✅ **全球同步**: 所有输入框实时联动，一处修改处处更新
- ✅ **零配置**: 开箱即用，无需安装任何依赖

## 📦 依赖库 (CDN 引入)

| 库 | 用途 |
|---|---|
| TailwindCSS | 样式框架 |
| FontAwesome | 图标库 |
| JSONPath Plus | JSONPath 查询 |
| JMESPath | JMESPath 查询 |
| Faker.js | Mock 数据生成 |

所有依赖均通过 CDN 引入，无需本地安装。

## 🔧 开发指南

### 添加新功能模块

1. 在 `js/modules/` 创建新文件，如 `feature.js`
2. 实现模块接口并注册：

```javascript
App.registerModule('feature', {
  init() { console.log('Initialized'); },
  onInput(data) { /* 处理数据 */ }
});
```

3. 在 `index.html` 添加对应的 Tab 按钮和面板
4. 完成！

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**Made with ❤️ by JSON Master Pro Team**

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
