# CTFd Whale 插件安装指南

## 📋 概述

本仓库提供了完整的 CTFd 3.8.1 Whale 插件及一键安装脚本，支持动态 Docker 容器题目类型。

### 主要特性

- ✅ **完整的样式修复**：修复了 flag 输入框和提交按钮的样式问题
- ✅ **动态容器管理**：支持基于 Docker 的动态题目容器
- ✅ **FRP 内网穿透**：自动配置 FRP 服务器和客户端
- ✅ **一键部署**：提供完整的自动化安装脚本
- ✅ **完整文档**：包含部署、使用和题目制作指南

## 🚀 快速开始

### 方法一：一键安装（推荐）

适用于全新安装 CTFd 3.8.1 + Whale 插件的场景。

```bash
# 1. 下载安装脚本
wget https://raw.githubusercontent.com/fpclose/ctfd_3.8.1_whale/main/install_whale.sh

# 2. 添加执行权限
chmod +x install_whale.sh

# 3. 运行安装脚本（需要 root 权限）
sudo ./install_whale.sh
```

**脚本会自动完成以下操作：**
- 安装 Docker 和 Docker Compose
- 初始化 Docker Swarm
- 创建必要的 Docker 网络
- 下载并配置 CTFd 3.8.1
- 安装 Whale 插件
- 安装并配置 FRP Server
- 配置所有必要的服务
- 启动整个平台

**安装完成后：**
- 访问 `http://YOUR_SERVER_IP` 完成 CTFd 初始化
- 登录管理后台验证 Whale 配置
- 创建测试题目

### 方法二：手动安装插件

适用于已有 CTFd 3.8.1 环境，只需要安装 Whale 插件的场景。

```bash
# 1. 进入 CTFd 插件目录
cd /opt/CTFd/CTFd/plugins

# 2. 克隆插件仓库
git clone https://github.com/fpclose/ctfd_3.8.1_whale.git ctfd-whale-master

# 3. 安装依赖
cd ctfd-whale-master
pip install -r requirements.txt

# 4. 重启 CTFd
cd /opt/CTFd
docker compose restart ctfd
```

**手动配置 Docker Swarm 和 FRP：**

参考 `deployment/install_whale.sh` 中的配置步骤，或查看 `docs/install.zh-cn.md` 获取详细说明。

## 📁 仓库结构

```
ctfd_3.8.1_whale/
├── __init__.py                    # 插件入口文件
├── api.py                        # API 路由定义
├── challenge_type.py             # 动态 Docker 题目类型定义
├── models.py                     # 数据库模型
├── decorators.py                 # 装饰器函数
├── requirements.txt              # Python 依赖
├── install_whale.sh              # 一键安装脚本
├── assets/                       # 前端资源
│   ├── view.html                # 题目查看模板
│   ├── view.js                  # 题目交互脚本（已修复样式问题）
│   ├── whale-style.css          # 自定义样式
│   ├── create.html              # 题目创建模板
│   ├── update.html              # 题目更新模板
│   └── ...
├── templates/                    # 后端模板
│   ├── whale_config.html        # 配置页面
│   ├── whale_containers.html    # 容器管理页面
│   └── config/                  # 配置子模板
├── utils/                        # 工具函数
│   ├── control.py               # 容器控制
│   ├── docker.py                # Docker API 封装
│   ├── checks.py                # 健康检查
│   └── routers/                 # 路由器实现（FRP/TRP）
├── deployment/                   # 部署相关文件
│   ├── install_whale.sh         # 完整部署脚本
│   ├── templates/               # 配置模板
│   └── examples/                # 示例题目
└── docs/                         # 文档
    ├── install.md               # 安装文档（英文）
    ├── install.zh-cn.md         # 安装文档（中文）
    ├── advanced.md              # 高级配置（英文）
    └── advanced.zh-cn.md        # 高级配置（中文）
```

## 🔧 配置说明

### Whale 插件配置项

安装完成后，在 CTFd 管理后台 → Plugins → ctfd-whale 可以看到以下配置：

**Docker 配置：**
- `docker_api_url`: Docker API 地址（默认：`unix:///var/run/docker.sock`）
- `docker_max_cpu`: 单个容器最大 CPU 使用（默认：`0.5`）
- `docker_max_memory`: 单个容器最大内存（默认：`256m`）
- `docker_swarm_nodes`: Swarm 节点名称列表

**FRP 配置：**
- `frp_api_url`: FRP 管理 API 地址
- `frp_direct_ip_address`: FRP 服务器公网 IP
- `frp_direct_port_minimum`: 直连端口范围最小值（默认：`10000`）
- `frp_direct_port_maximum`: 直连端口范围最大值（默认：`10100`）
- `frp_http_domain_suffix`: HTTP 域名后缀（如：`example.com.xip.io`）
- `frp_http_port`: FRP HTTP 端口（默认：`8080`）

**网络配置：**
- `auto_connect_network`: 自动连接的 Docker 网络名称

**限制配置：**
- `max_container_count`: 每个用户/队伍最大容器数
- `max_renew_count`: 最大续期次数

## 🎯 使用指南

### 创建动态 Docker 题目

1. 登录 CTFd 管理后台
2. 进入 Challenges → Create Challenge
3. 选择题目类型：`dynamic_docker`
4. 填写题目信息：
   - Name: 题目名称
   - Category: 题目分类
   - Description: 题目描述
   - Value: 初始分值
   - Image: Docker 镜像名称（如：`nginx:latest`）
   - Memory Limit: 内存限制
   - CPU Limit: CPU 限制
   - Port: 容器暴露端口（如：`80`）

### 题目制作示例

仓库中包含了示例题目，位于 `deployment/examples/xiaolansa/`：

```dockerfile
FROM php:7.4-apache

# 复制题目文件
COPY index.php /var/www/html/
COPY flag.php /var/www/html/
COPY get_flag.php /var/www/html/

# 设置权限
RUN chmod 644 /var/www/html/*.php

# 暴露端口
EXPOSE 80
```

构建并推送镜像：

```bash
cd deployment/examples/xiaolansa/
docker build -t your-registry/xiaolansa:latest .
docker push your-registry/xiaolansa:latest
```

## 🐛 故障排除

### 样式不显示

如果 flag 输入框和提交按钮样式不正常，请：

1. 清除浏览器缓存（Ctrl + Shift + R）
2. 检查浏览器控制台是否有 JavaScript 错误
3. 确认 `view.js` 文件已更新到最新版本

### 容器无法启动

1. 检查 Docker 服务状态：`systemctl status docker`
2. 检查 Swarm 状态：`docker info | grep Swarm`
3. 查看容器日志：`docker service logs <service_name>`

### FRP 连接失败

1. 检查 FRP Server 状态：`systemctl status frps`
2. 查看 FRP Server 日志：`journalctl -u frps -f`
3. 确认防火墙规则允许 FRP 端口

## 📚 文档资源

- [部署指南](docs/install.zh-cn.md)
- [高级配置](docs/advanced.zh-cn.md)
- [快速开始](QUICK_START_3.8.1.md)
- [升级指南](UPGRADE_TO_3.8.1.md)
- [更新日志](CHANGELOG.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目基于 Apache License 2.0 许可证开源。详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [CTFd](https://github.com/CTFd/CTFd) - 开源 CTF 平台
- [ctfd-whale](https://github.com/frankli0324/ctfd-whale) - 原始 Whale 插件
- 所有贡献者

## 📮 联系方式

- GitHub Issues: https://github.com/fpclose/ctfd_3.8.1_whale/issues
- 维护者: fpclose

---

**版本**: 3.8.1  
**最后更新**: 2025-11-18
