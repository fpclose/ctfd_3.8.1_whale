# CTFd Whale 插件 - CTFd 3.8.1 适配更改清单

## 修改的文件

### 后端文件

#### 1. `challenge_type.py`
**修改内容**:
- 导入 `ChallengeResponse` 类
- 更新 `attempt()` 方法返回类型从 `(bool, str)` 元组改为 `ChallengeResponse` 对象

**修改位置**:
- 第 5 行: 添加 `ChallengeResponse` 导入
- 第 66-105 行: 所有返回语句从元组改为 `ChallengeResponse` 对象

### 模板文件

#### 2. `assets/view.html`
**修改内容**:
- 修复 onclick 事件: `window.challenge.boot()` → `CTFd._internal.challenge.boot()`
- 统一按钮文本为中文

#### 3. `templates/config/base.router.config.html`
**修改内容**:
- 移除无效的 `onchange="window.updateConfigs"` 属性
- 事件处理由 `config.js` 统一管理

### 前端 JavaScript 文件

#### 4. `assets/view.js` ⚠️ 关键修改
**运行环境**: Core 主题（用户端）- **没有 jQuery！**

**修改内容**:
- ❌ 移除所有 `CTFd.lib.$()` 调用（因为 Core 主题没有 jQuery）
- ✅ 使用纯 JavaScript：`document.getElementById()`
- ✅ 使用 `element.innerHTML` 代替 `.html()`
- ✅ 使用 `element.value` 代替 `.val()`
- ✅ 保留 `CTFd.fetch` 和 `CTFd.ui.ezq`（这些可用）

**关键修改示例**:
```javascript
// 修改前（错误）
var id = CTFd.lib.$('#challenge-id').val();
CTFd.lib.$('#whale-panel').html(content);

// 修改后（正确）
var id = document.getElementById('challenge-id').value;
document.getElementById('whale-panel').innerHTML = content;
```

**影响的函数**:
- `loadInfo()`
- `CTFd._internal.challenge.destroy()`
- `CTFd._internal.challenge.renew()`
- `CTFd._internal.challenge.boot()`
- `CTFd._internal.challenge.submit()`

#### 5. `assets/config.js`
**运行环境**: Admin 主题（管理员端）- **有 jQuery**

**修改内容**:
- ✅ 保留 `const $ = CTFd.lib.$`
- ✏️ 简化 `#router-type` 选择器

```javascript
// 修改前
$(".config-section > form:not(.form-upload) > div > div > div > #router-type").change(...)

// 修改后
$("#router-type").change(...)  // ID 已经是唯一的
```

#### 6. `assets/containers.js`
**运行环境**: Admin 主题（管理员端）- **有 jQuery**

**修改内容**:
- ✅ 保留 `const $ = CTFd.lib.$`
- 🐛 修复 `renew_container` 调用缺少 `challenge_id` 参数
- 🐛 修复 `htmlentities` 调用参数错误

```javascript
// Bug 修复 1
- await renew_container(team_id);  // 缺少参数
+ await renew_container(team_id, challenge_id);

// Bug 修复 2
- htmlentities(container_id, challenge_id)  // 参数过多
+ htmlentities(container_id)
```

#### 7. `assets/create.js`
**运行环境**: Admin 主题（管理员端）- **有 jQuery**

**修改内容**:
- 使用标准 `CTFd.plugin.run()` 格式

```javascript
CTFd.plugin.run((_CTFd) => {
    const $ = _CTFd.lib.$;
    const md = _CTFd.lib.markdown();
});
```

#### 8. `assets/update.js`
**运行环境**: Admin 主题（管理员端）- **有 jQuery**

**修改内容**: 与 `create.js` 相同

### 已验证兼容的文件

以下文件已符合 CTFd 3.8.1 标准，无需修改：
- `__init__.py` - 插件注册代码无需修改
- `api.py` - REST API 代码无需修改
- `models.py` - 数据模型无需修改
- `assets/create.html` - 挑战创建表单模板
- `assets/update.html` - 挑战更新表单模板
- `templates/whale_base.html` - 基础布局模板
- `templates/whale_config.html` - 配置页面模板
- `templates/whale_containers.html` - 容器列表模板
- `templates/config/*.html` - 各配置子页面（除 base.router.config.html）
- `templates/containers/*.html` - 容器视图模板

## 功能完整性

✅ **所有原有功能均已保留**:
- Docker 容器管理
- 动态 Flag 生成
- 容器自动清理
- 作弊检测
- 管理员界面
- 用户挑战界面
- FRP 路由配置
- 资源限制

## 兼容性

- ✅ CTFd 3.8.1
- ✅ Python 3.x
- ✅ 向后兼容的 ChallengeResponse（支持元组解包）
- ⚠️  不兼容 CTFd 3.6.0 及更早版本

## API 变更摘要

### 后端 API
```python
# 旧 API (CTFd 3.6.0)
def attempt(cls, challenge, request):
    return True, "正确"
    return False, "错误"

# 新 API (CTFd 3.8.1)
def attempt(cls, challenge, request):
    return ChallengeResponse(status="correct", message="正确")
    return ChallengeResponse(status="incorrect", message="错误")
```

### 前端 API - ⚠️ 取决于运行环境！

#### 用户端（Core 主题）- 没有 jQuery
```javascript
// ❌ 错误：CTFd.lib.$ 不存在
var value = CTFd.lib.$('#element').val();

// ✅ 正确：使用纯 JavaScript
var value = document.getElementById('element').value;
```

#### 管理员端（Admin 主题）- 有 jQuery
```javascript
// ✅ 正确：可以使用 CTFd.lib.$
const $ = CTFd.lib.$;
var value = $('#element').val();
```

**关键理解**: 
- **Core 主题**（用户挑战页面）：❌ 没有 jQuery
- **Admin 主题**（管理面板）：✅ 有 jQuery

## 测试建议

1. **后端测试**:
   - 创建动态 Docker 挑战
   - 提交正确和错误的 flag
   - 测试作弊检测

2. **前端测试**:
   - 启动容器
   - 续期容器
   - 销毁容器
   - 检查倒计时功能

3. **管理员测试**:
   - 配置页面功能
   - 容器列表查看
   - 手动管理容器

## 升级方式

直接使用重构后的插件即可，无需额外配置或数据库迁移。

## 文档

详细的升级说明和技术文档请参阅 `UPGRADE_TO_3.8.1.md`
