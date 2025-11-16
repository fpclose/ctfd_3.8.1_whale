# CTFd Whale 插件升级说明

## 版本信息
- **版本**: 2.0.2 Enhanced
- **更新日期**: 2025-11-16
- **适配版本**: CTFd 3.8.1

## 本次更新内容

### 🎨 前端UI优化
1. **Flag输入框美化**
   - 简约现代风格设计
   - 白色背景 + 灰色边框
   - Hover效果：边框变深 + 轻微上浮
   - Focus效果：紫色边框 + 光晕
   - 圆角12px，无图标装饰

2. **提交按钮美化**
   - 紫色渐变背景 (#667eea → #764ba2)
   - Hover效果：渐变加深 + 上浮 + 光泽扫过
   - Active效果：按下反馈
   - 圆角12px，纯文字显示

3. **交互体验优化**
   - 加载动画
   - 成功/失败视觉反馈
   - 抖动动画（错误时）
   - 响应式设计

### 🔧 功能完善
1. **用户模式兼容**
   - 支持Teams模式
   - 支持Users模式
   - 自动识别并适配

2. **容器管理优化**
   - 启动/销毁/续期功能完整
   - 冷却时间动态提示
   - 剩余时间倒计时

3. **错误处理增强**
   - Element空值检查
   - 自动重试机制
   - 友好错误提示

### 🐛 Bug修复
1. 修复了`challenge-id`元素找不到的问题
2. 修复了`get_config`未定义错误
3. 修复了提交按钮无反应问题
4. 修复了Alpine.js数据绑定问题
5. 修复了用户模式兼容性问题

### 📦 样式封装
所有样式已内联到`view.html`中，使用最高优先级选择器：
- `#challenge-input.whale-flag-input`
- `input[name="answer"].whale-flag-input`
- `.challenge-input.whale-flag-input`
- `#challenge-submit.whale-submit-btn`
- `button[type="button"].whale-submit-btn`
- `.challenge-submit.whale-submit-btn`

### 🚀 使用方法

#### 1. 下载插件
```bash
cd /opt/CTFd/CTFd/plugins/
git clone https://github.com/fpclose/ctfd_3.8.1_whale.git ctfd-whale
```

#### 2. 重启CTFd
```bash
cd /opt/CTFd
docker compose restart ctfd
```

#### 3. 清除浏览器缓存
- Windows: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### 📝 配置说明
插件无需额外配置即可使用，所有样式已内联到模板中。

### ⚠️ 注意事项
1. 确保CTFd版本为3.8.1
2. 确保Docker Swarm已初始化
3. 确保FRP正确配置
4. 清除浏览器缓存以查看新样式

### 🔄 从旧版本升级
```bash
cd /opt/CTFd/CTFd/plugins/ctfd-whale
git pull origin main
docker compose restart ctfd
```

### 🐛 故障排除

#### 样式未生效
1. 强制刷新浏览器（Ctrl + F5）
2. 检查浏览器开发者工具（F12）
3. 查看Elements标签页中的样式规则

#### 容器无法启动
1. 检查Docker Swarm状态
2. 检查FRP配置
3. 查看CTFd日志：`docker compose logs ctfd`

### 📞 支持
- GitHub Issues: https://github.com/fpclose/ctfd_3.8.1_whale/issues
- 文档: 查看README.md

---

**维护者**: fpclose  
**仓库**: https://github.com/fpclose/ctfd_3.8.1_whale
