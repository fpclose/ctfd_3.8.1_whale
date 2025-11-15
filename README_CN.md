# CTFd 3.8.1 Whale 插件 - 增强版

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CTFd Version](https://img.shields.io/badge/CTFd-3.8.1-blue.svg)](https://github.com/CTFd/CTFd)
[![Version](https://img.shields.io/badge/Version-2.0-green.svg)](https://github.com/fpclose/ctfd_3.8.1_whale)

**作者**: fpclose  
**版本**: 2.0 Enhanced  
**兼容**: CTFd 3.8.1  
**协议**: MIT License

## 项目简介

这是一个为 CTFd 3.8.1 定制的动态容器管理插件，提供完整的生产级部署解决方案。经过深度二次开发和优化，解决了原版插件的兼容性问题，增加了自动化部署脚本和详细文档。

## 快速开始

### 一键安装

```bash
# 克隆项目
git clone https://github.com/fpclose/ctfd_3.8.1_whale.git
cd ctfd_3.8.1_whale

# 运行安装脚本（自动配置所有依赖）
sudo ./install_whale.sh
```

### 访问 CTFd

安装完成后，浏览器访问：
- CTFd 主页: `http://your-server-ip`
- 管理后台: `http://your-server-ip/admin`

## 主要特性

- **Docker Swarm 编排**: 自动管理容器生命周期
- **FRP 端口转发**: 支持 HTTP/Direct-HTTP/Direct(TCP) 三种模式
- **动态 Flag 生成**: 每个用户独立 Flag，防止作弊
- **自动化部署**: 600+ 行安装脚本，一键完成所有配置
- **资源限制**: CPU/内存限制，自动超时清理
- **网络隔离**: 服务与容器网络分离，安全可靠
- **生产就绪**: 包含监控、日志、安全最佳实践

## 核心修复

本版本修复了以下关键问题：

1. **DNS 解析问题**: 修复了 CTFd 无法连接数据库的 DNS 问题
2. **FRP Admin API**: 修复了 "Unable to access frpc admin api" 错误
3. **容器启动**: 修复了容器无法启动和销毁的问题
4. **Flag 替换**: 修复了 Flag 占位符替换失败的问题
5. **网络配置**: 优化了 Docker 网络配置，确保服务稳定通信

## 项目结构

```
ctfd-3.8.1-whale/
├── README.md                    # 完整技术文档 (32KB)
├── README_CN.md                 # 中文说明文档
├── DEPLOYMENT_README.md         # 部署使用指南 (12KB)
├── DEVELOPMENT_CHANGES.md       # 二开修改详情 (20KB)
├── install_whale.sh             # 一键安装脚本 (16KB)
├── docker-compose.example.yml   # Docker 配置示例
├── requirements.txt             # Python 依赖
├── LICENSE                      # MIT 协议
│
├── assets/                      # 前端资源
├── templates/                   # HTML 模板
├── utils/                       # 后端工具
│
└── deployment/
    ├── templates/               # 配置模板
    │   ├── docker-compose.template.yml
    │   ├── frpc.template.ini
    │   ├── frps.template.ini
    │   └── nginx.template.conf
    └── examples/
        └── xiaolansa/           # 示例题目
```

## 文档说明

### 快速入门
- **README_CN.md** (本文件): 中文快速说明
- **DEPLOYMENT_README.md**: 详细的部署和使用指南

### 技术文档
- **README.md**: 完整的技术文档和 API 参考
- **DEVELOPMENT_CHANGES.md**: 二次开发的详细修改记录

### 配置模板
- **deployment/templates/**: 所有配置文件的模板
- **deployment/examples/**: 示例题目和 Dockerfile

## 系统要求

- **操作系统**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **CPU**: 2 核心以上
- **内存**: 4GB 以上
- **磁盘**: 20GB 以上
- **网络**: 需要公网 IP 或内网环境

## 环境依赖

安装脚本会自动安装以下组件：

- Docker 20.10+
- Docker Compose v2+
- Docker Swarm
- FRP (Fast Reverse Proxy)
- CTFd 3.8.1
- MariaDB 10.6
- Redis 6.2
- Nginx

## 使用流程

### 1. 管理员配置

1. 访问 CTFd 管理后台
2. 进入 "Plugins" -> "Whale" 配置页
3. 填写配置信息：
   - FRP API URL: `http://172.19.0.10:7400`
   - Docker Swarm 节点: `linux-1`
   - 端口范围: `10000-10100`

### 2. 创建题目

1. 编写题目 Dockerfile（参考 `deployment/examples/`）
2. 构建并推送镜像到 Docker Hub
3. 在 CTFd 后台创建 "dynamic_docker" 类型题目
4. 配置镜像名称和访问类型

### 3. 参赛者使用

1. 点击题目页面的 "启动容器" 按钮
2. 等待容器启动（通常 5-10 秒）
3. 通过提供的 URL 访问容器
4. 完成挑战后系统自动清理容器

## 故障排除

### 容器无法启动

```bash
# 检查 Docker Swarm
docker node ls

# 检查网络
docker network ls | grep frp-containers

# 查看日志
docker service logs $(docker service ls -q)
```

### FRP API 无法访问

```bash
# 检查 FRP 服务
docker ps | grep frpc
curl http://172.19.0.10:7400/api/status

# 重启 FRP
cd /opt/CTFd
docker compose restart frpc
```

### 数据库连接失败

```bash
# 检查数据库状态
docker ps | grep mariadb

# 查看日志
docker compose logs db
```

更多故障排除方法，请参考 `DEPLOYMENT_README.md` 的"故障排除"章节。

## 示例题目

项目包含一个完整的 PHP 示例题目 "小蓝鲨的秘密"：

```bash
# 题目位置
cd deployment/examples/xiaolansa/

# 构建镜像
docker build -t your-registry/xiaolansa:latest .

# 推送镜像
docker push your-registry/xiaolansa:latest
```

题目特点：
- HTTP Referer 验证
- 动态 Flag 替换
- 完整的前端页面
- 详细的 WriteUp

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 技术支持

- **GitHub Issues**: https://github.com/fpclose/ctfd_3.8.1_whale/issues
- **GitHub Repository**: https://github.com/fpclose/ctfd_3.8.1_whale
- **Email**: lsszuishuai@gmail.com

## 致谢

- CTFd 团队: https://github.com/CTFd/CTFd
- 原版 Whale 插件作者: https://github.com/frankli0324/ctfd-whale
- FRP 项目: https://github.com/fatedier/frp

## 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](LICENSE) 文件。

## 更新日志

### v2.0 (2025-11-15)

- 完全兼容 CTFd 3.8.1
- 修复所有已知 Bug
- 新增自动化安装脚本
- 新增完整文档体系
- 优化网络配置
- 增强安全性
- 添加示例题目

---

**项目主页**: https://github.com/fpclose/ctfd_3.8.1_whale  
**维护者**: fpclose  
**最后更新**: 2025-11-15
