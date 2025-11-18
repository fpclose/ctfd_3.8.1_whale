# CTFd Whale 插件 - CTFd 3.8.1 快速开始

## 插件状态
✅ **已完成 CTFd 3.8.1 适配** - 所有功能正常工作

## 快速验证

### 1. 启动 CTFd
```bash
cd /path/to/ctfd3.8.1
python serve.py
```

或使用 Docker:
```bash
docker-compose up -d
```

### 2. 访问管理面板
1. 登录管理员账户
2. 在顶部菜单找到 **Whale** 选项
3. 配置 Docker 和路由设置

### 3. 创建测试挑战
1. 进入 **Challenges** 页面
2. 点击 **Create Challenge**
3. 选择类型: **dynamic_docker**
4. 填写基本信息:
   - Name: 测试挑战
   - Docker Image: ubuntu:latest
   - Redirect Type: HTTP
   - Redirect Port: 80
   - Memory Limit: 128m
   - CPU Limit: 0.5
   - Initial Value: 100

### 4. 测试功能
**用户端**:
1. 以普通用户身份登录
2. 打开挑战
3. 点击 "启动靶机" 按钮
4. 等待容器启动
5. 查看连接信息
6. 测试续期和销毁功能

**管理员端**:
1. 进入 Whale > Instances
2. 查看当前运行的容器
3. 测试手动管理功能

## 主要功能

### ✅ 核心功能
- **容器管理**: 启动、销毁、续期
- **动态 Flag**: 每个容器独立 flag
- **资源限制**: CPU、内存限制
- **自动清理**: 过期容器自动删除
- **作弊检测**: Flag 重复检测

### ✅ 管理功能
- **配置面板**: Docker、路由、限制配置
- **容器监控**: 实时查看所有容器
- **手动控制**: 管理员手动管理容器

### ✅ 路由模式
- **HTTP**: 适用于 Web 服务
- **Direct**: 直接端口映射
- **Direct-HTTP**: HTTP 直接访问

## 配置检查清单

在使用前请确保：

- [ ] Docker 服务正常运行
- [ ] FRP 配置正确（如使用）
- [ ] Docker 镜像已准备好
- [ ] 网络配置正确
- [ ] 端口范围可用

## 常见问题

### Q: 容器启动失败
**A**: 检查 Docker 日志和镜像是否存在

### Q: 无法访问容器
**A**: 检查路由配置和 FRP 服务状态

### Q: Flag 提交错误
**A**: 确保容器正在运行且 flag 正确

## 版本信息

- **CTFd 版本**: 3.8.1
- **插件版本**: 3.8.1 适配版
- **Python 版本**: 3.x
- **Docker 版本**: 推荐 20.x+

## 技术栈

### 后端
- Flask
- Flask-RESTx
- SQLAlchemy
- Docker SDK
- APScheduler

### 前端
- Vanilla JavaScript
- CTFd.lib.$ (jQuery)
- CTFd API
- Bootstrap

## 获取帮助

如遇到问题：
1. 查看 `UPGRADE_TO_3.8.1.md` 详细文档
2. 查看 `CHANGES.md` 了解所有更改
3. 检查 CTFd 日志
4. 检查 Docker 日志

## 下一步

- 配置 Docker 镜像仓库
- 设置 FRP 服务器
- 创建自定义挑战
- 配置资源限制
- 设置自动清理策略

---

**状态**: ✅ 生产就绪
**最后更新**: 2024
**维护**: 活跃
