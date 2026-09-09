# JSON Master Pro

> 纯前端 JSON 工具集，模块化架构，GitHub Pages 一键部署

## 🚀 快速开始

1. 克隆仓库到 GitHub
2. 启用 GitHub Pages 服务
3. 访问生成的 URL 即可使用

无需任何构建步骤，所有依赖通过 CDN 加载。

## ✨ 核心功能

### 基础工具
| 模块 | 图标 | 功能描述 |
|------|------|----------|
| **格式化** | `fa-code` | JSON 美化/压缩，支持复制 |
| **树视图** | `fa-sitemap` | 可折叠展开的交互式树形结构 |
| **对比** | `fa-columns` | 左右两栏差异对比，导航跳转 |
| **String 转换** | `fa-exchange-alt` | JSON ⇄ 字符串双向转换 |

### 代码生成
| 模块 | 图标 | 功能描述 |
|------|------|----------|
| **Java Map** | `fa-coffee` | 生成嵌套 HashMap/ArrayList 代码 |
| **Java Bean** | `fa-file-code` | 生成 Lombok + Swagger 注解的 Bean 类 |

### 高级功能
| 模块 | 图标 | 功能描述 |
|------|------|----------|
| **Mock 数据** | `fa-wand-magic-sparkles` | 基于 Faker.js 生成真实测试数据 |
| **查询过滤** | `fa-search` | 支持 JSONPath 和 JMESPath 查询语法 |
| **性能分析** | `fa-chart-bar` | 统计大小、深度、类型分布、重复值 |

## 🏗️ 技术架构

```
JSON Master Pro
├── index.html              # 主框架 (零业务逻辑)
├── js/
│   ├── core/
│   │   ├── app.js          # 核心框架 (注册/切换/同步)
│   │   ├── toast.js        # 通知系统
│   │   └── utils.js        # JSON 工具函数
│   └── modules/
│       ├── format.js       # 格式化模块
│       ├── tree.js         # 树视图模块
│       ├── compare.js      # 对比模块
│       ├── convert.js      # 转换模块
│       ├── java.js         # Java Map 模块
│       ├── bean.js         # Java Bean 模块
│       ├── mock.js         # Mock 数据模块
│       ├── query.js        # 查询模块
│       └── analyze.js      # 分析模块
└── README.md
```

### 插件式注册机制

每个模块独立封装，通过 `AppInstance.register()` 主动注册：

```javascript
// 模块示例
(function() {
    const MyModule = {
        name: '我的模块',
        icon: 'fa-star',
        init: (container) => { /* 渲染 UI */ },
        activate: (input) => { /* Tab 激活时执行 */ },
        deactivate: () => { /* Tab 离开时执行 */ }
    };
    
    window.AppInstance.register('my-module', MyModule);
})();
```

**新增功能只需两步：**
1. 创建 `js/modules/my-feature.js`
2. 在 `index.html` 添加一行 `<script>` 标签

无需修改任何现有代码！

## 🛠️ 依赖库

| 库 | 用途 | CDN |
|---|------|-----|
| TailwindCSS | 样式框架 | ✅ 已集成 |
| FontAwesome | 图标库 | ✅ 已集成 |
| Faker.js | Mock 数据生成 | ✅ 按需加载 |
| JSONPath Plus | JSON 查询 | ✅ 按需加载 |
| JMESPath | JSON 查询 | ✅ 按需加载 |

## 🎨 特性亮点

- ✅ **纯前端**：无后端依赖，数据安全
- ✅ **模块化**：插件式架构，易扩展
- ✅ **全局同步**：所有模块共享输入框数据
- ✅ **Toast 通知**：无打断式 alert，体验流畅
- ✅ **暗色主题**：护眼配色，JetBrains Mono 字体
- ✅ **响应式**：适配各种屏幕尺寸
- ✅ **GitHub Pages**：一键部署，免费托管

## 📝 使用示例

### Mock 数据生成
```json
{
  "count": 5,
  "template": {
    "id": "@integer",
    "name": "@name",
    "email": "@email",
    "phone": "@phone"
  }
}
```

### JSONPath 查询
```
$.store.book[*].author
$..price
$.book[?(@.price < 10)]
```

### JMESPath 查询
```
people[*].name
{foo: bar, baz: qux}
sort_by(people, &age)
```

## 🔧 开发指南

### 本地开发
```bash
# 任意 HTTP 服务器即可
npx serve .
# 或
python -m http.server 8080
```

### 添加新模块
1. 在 `js/modules/` 创建新文件
2. 实现 `init`, `activate`, `deactivate` 方法
3. 调用 `AppInstance.register()` 注册
4. 在 `index.html` 引入脚本

### 自定义样式
修改 `index.html` 中的 `<style>` 标签，Tailwind 支持任意 class。

## 📄 License

MIT License

---

**在线演示**: [GitHub Pages](https://yourusername.github.io/json-master-pro/)
