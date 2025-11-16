# CTFd Whale 插件安装指南

## 快速安装

### 方法一：Git克隆（推荐）

```bash
# 1. 进入CTFd插件目录
cd /opt/CTFd/CTFd/plugins/

# 2. 克隆插件
git clone https://github.com/fpclose/ctfd_3.8.1_whale.git ctfd-whale

# 3. 设置权限
chmod +x ctfd-whale/utils/*.py
chmod +x ctfd-whale/assets/*.js

# 4. 重启CTFd
cd /opt/CTFd
docker compose restart ctfd
```

### 方法二：手动下载

```bash
# 1. 下载ZIP
wget https://github.com/fpclose/ctfd_3.8.1_whale/archive/refs/heads/main.zip

# 2. 解压
unzip main.zip

# 3. 移动到插件目录
mv ctfd_3.8.1_whale-main /opt/CTFd/CTFd/plugins/ctfd-whale

# 4. 重启CTFd
cd /opt/CTFd
docker compose restart ctfd
```

## 完整部署流程

### 1. 系统要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 最低4GB，推荐8GB+
- **磁盘**: 最低20GB可用空间

### 2. 安装Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 启用Docker服务
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. 初始化Docker Swarm
```bash
# 初始化Swarm
docker swarm init --advertise-addr $(hostname -I | awk '{print $1}')

# 给节点打标签
NODE=$(docker node ls --format "{{.Hostname}}" | head -1)
docker node update --label-add "name=linux-1" $NODE
```

### 4. 创建FRP网络
```bash
docker network create \
  --driver overlay \
  --attachable \
  --subnet 172.20.0.0/16 \
  ctfd_frp-containers
```

### 5. 部署CTFd
```bash
# 克隆CTFd
cd /opt
git clone https://github.com/CTFd/CTFd.git
cd CTFd
git checkout 3.8.1

# 安装Whale插件
cd CTFd/plugins
git clone https://github.com/fpclose/ctfd_3.8.1_whale.git ctfd-whale

# 启动服务
cd /opt/CTFd
docker compose up -d
```

### 6. 配置FRP

#### 安装FRP服务端
```bash
# 下载FRP
mkdir -p /usr/local/frp
cd /usr/local/frp
wget https://github.com/fatedier/frp/releases/download/v0.52.0/frp_0.52.0_linux_amd64.tar.gz
tar -xzf frp_0.52.0_linux_amd64.tar.gz
cd frp_0.52.0_linux_amd64

# 创建配置
cat > frps.ini << 'FRPS_EOF'
[common]
bind_addr = 0.0.0.0
bind_port = 7897
token = ctfd_whale_token_change_this
vhost_http_port = 8080
subdomain_host = 127.0.0.1.xip.io
dashboard_port = 7500
dashboard_user = admin
dashboard_pwd = admin
FRPS_EOF

# 创建systemd服务
sudo cat > /etc/systemd/system/frps.service << 'SERVICE_EOF'
[Unit]
Description=FRP Server
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/frp/frp_0.52.0_linux_amd64/frps -c /usr/local/frp/frp_0.52.0_linux_amd64/frps.ini
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable frps
sudo systemctl start frps
```

#### 配置FRP客户端
编辑 `/opt/CTFd/conf/frp/frpc.ini`:

```ini
[common]
server_addr = host.docker.internal
server_port = 7897
token = ctfd_whale_token_change_this
admin_addr = 0.0.0.0
admin_port = 7400
```

### 7. 访问CTFd
```bash
# 获取服务器IP
hostname -I | awk '{print $1}'

# 访问
# http://YOUR_IP:8000
```

## 插件配置

### 1. 登录管理后台
访问 `http://YOUR_IP:8000/admin`

### 2. 配置Whale插件
1. 点击顶部导航栏的 "Whale"
2. 检查配置项：
   - Docker连接状态
   - Swarm状态
   - FRP连接状态
   - 网络配置

### 3. 创建动态挑战
1. 进入 "Challenges" → "Create Challenge"
2. 选择 "dynamic_docker" 类型
3. 填写挑战信息：
   - Name: 挑战名称
   - Category: 分类
   - Description: 描述
   - Value: 分值
   - Docker Image: 镜像名称（例如：nginx:alpine）
   - Redirect Type: direct-http（推荐）
   - Redirect Port: 80
   - Memory Limit: 128m
   - CPU Limit: 0.5

### 4. 测试挑战
1. 以普通用户登录
2. 访问挑战页面
3. 点击"启动靶机"按钮
4. 等待容器启动
5. 访问提供的URL
6. 提交Flag

## 验证安装

### 检查插件状态
```bash
# 检查插件目录
ls -la /opt/CTFd/CTFd/plugins/ctfd-whale/

# 检查日志
docker compose logs ctfd | grep -i whale

# 检查Swarm
docker node ls

# 检查网络
docker network ls | grep frp
```

### 检查服务状态
```bash
# CTFd服务
docker compose ps

# FRP服务
sudo systemctl status frps

# FRP Admin API
curl http://localhost:7400/api/status
```

## 常见问题

### Q1: 插件未加载
**A**: 检查插件目录名称是否为 `ctfd-whale`（不是 `ctfd_3.8.1_whale`）

### Q2: 样式未生效
**A**: 清除浏览器缓存（Ctrl + F5）

### Q3: 容器无法启动
**A**: 检查Docker Swarm和FRP配置

### Q4: FRP连接失败
**A**: 检查token是否一致，防火墙是否开放7897端口

## 卸载

```bash
# 1. 停止CTFd
cd /opt/CTFd
docker compose down

# 2. 删除插件
rm -rf CTFd/plugins/ctfd-whale

# 3. 清理数据（可选）
rm -rf .data

# 4. 重启CTFd
docker compose up -d
```

## 更多文档

- **部署文档**: `DEPLOYMENT_README.md`
- **开发文档**: `DEVELOPMENT_CHANGES.md`
- **升级说明**: `UPGRADE_NOTES.md`
- **API文档**: `README.md` - API Reference部分

## 技术支持

- **GitHub Issues**: https://github.com/fpclose/ctfd_3.8.1_whale/issues
- **作者**: fpclose
- **仓库**: https://github.com/fpclose/ctfd_3.8.1_whale

---

**提示**: 生产环境部署请参考 `README.md` 中的 "Production Deployment" 部分
