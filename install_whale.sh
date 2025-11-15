#!/bin/bash

# CTFd Whale 自动化安装脚本
# 版本: 2.0
# 适用于: CTFd 3.8.1
# 作者: CTFd Whale Deployment Team

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为 root 或有 sudo 权限
check_permission() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要 root 权限运行"
        echo "请使用: sudo $0"
        exit 1
    fi
}

# 检查系统
check_system() {
    log_info "检查系统环境..."
    
    # 检查操作系统
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
        log_info "操作系统: $NAME $VERSION"
    else
        log_error "无法识别操作系统"
        exit 1
    fi
    
    # 检查架构
    ARCH=$(uname -m)
    log_info "系统架构: $ARCH"
    
    if [[ "$ARCH" != "x86_64" ]]; then
        log_warning "此脚本主要为 x86_64 架构设计，其他架构可能需要手动调整"
    fi
}

# 安装 Docker
install_docker() {
    log_info "检查 Docker 安装状态..."
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        log_success "Docker 已安装: $DOCKER_VERSION"
        return 0
    fi
    
    log_info "开始安装 Docker..."
    
    case $OS in
        ubuntu|debian)
            apt-get update
            apt-get install -y apt-transport-https ca-certificates curl software-properties-common
            
            curl -fsSL https://download.docker.com/linux/$OS/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$OS $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            apt-get update
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
            
        centos|rhel|fedora)
            yum install -y yum-utils
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
            
        *)
            log_error "不支持的操作系统: $OS"
            log_info "请手动安装 Docker: https://docs.docker.com/engine/install/"
            exit 1
            ;;
    esac
    
    # 启动 Docker
    systemctl start docker
    systemctl enable docker
    
    log_success "Docker 安装完成"
    docker --version
}

# 初始化 Docker Swarm
init_swarm() {
    log_info "检查 Docker Swarm 状态..."
    
    if docker info 2>/dev/null | grep -q "Swarm: active"; then
        log_success "Docker Swarm 已初始化"
        SWARM_NODE=$(docker node ls --format "{{.Hostname}}" | head -1)
        log_info "当前节点: $SWARM_NODE"
        return 0
    fi
    
    log_info "初始化 Docker Swarm..."
    docker swarm init 2>/dev/null || docker swarm init --advertise-addr $(hostname -I | awk '{print $1}')
    
    SWARM_NODE=$(docker node ls --format "{{.Hostname}}" | head -1)
    log_success "Docker Swarm 初始化完成，节点名称: $SWARM_NODE"
    
    # 添加节点标签
    log_info "为节点添加标签..."
    docker node update --label-add name=$SWARM_NODE $SWARM_NODE
    
    log_success "节点标签添加完成"
}

# 创建 Docker 网络
create_network() {
    log_info "创建 Docker 网络..."
    
    if docker network ls | grep -q "ctfd_frp-containers"; then
        log_success "网络 ctfd_frp-containers 已存在"
        return 0
    fi
    
    docker network create \
        --driver overlay \
        --attachable \
        --subnet 10.0.0.0/24 \
        ctfd_frp-containers
    
    log_success "网络创建完成"
}

# 下载 CTFd
download_ctfd() {
    log_info "下载 CTFd..."
    
    if [[ -d "/opt/CTFd" ]]; then
        log_warning "/opt/CTFd 目录已存在"
        read -p "是否覆盖? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "跳过下载 CTFd"
            return 0
        fi
        rm -rf /opt/CTFd
    fi
    
    cd /opt
    git clone https://github.com/CTFd/CTFd.git
    cd CTFd
    git checkout 3.8.1
    
    log_success "CTFd 下载完成"
}

# 下载 Whale 插件
download_whale() {
    log_info "下载 Whale 插件..."
    
    cd /opt/CTFd/CTFd/plugins
    
    if [[ -d "ctfd-whale-master" ]]; then
        log_warning "Whale 插件已存在"
        return 0
    fi
    
    git clone https://github.com/fpclose/ctfd_3.8.1_whale.git ctfd-whale-master
    
    log_success "Whale 插件下载完成"
}

# 安装 FRP Server
install_frp() {
    log_info "安装 FRP Server..."
    
    if [[ -f "/usr/local/frp/frps" ]]; then
        log_success "FRP Server 已安装"
        return 0
    fi
    
    mkdir -p /usr/local/frp
    cd /usr/local/frp
    
    FRP_VERSION="0.52.3"
    log_info "下载 FRP v$FRP_VERSION..."
    
    wget -q https://github.com/fatedier/frp/releases/download/v${FRP_VERSION}/frp_${FRP_VERSION}_linux_amd64.tar.gz
    
    tar -xzf frp_${FRP_VERSION}_linux_amd64.tar.gz
    mv frp_${FRP_VERSION}_linux_amd64/* .
    rm -rf frp_${FRP_VERSION}_linux_amd64*
    
    log_success "FRP Server 安装完成"
}

# 配置文件
configure_files() {
    log_info "配置文件..."
    
    cd /opt/CTFd
    
    # 创建必要的目录
    mkdir -p .data/CTFd/logs
    mkdir -p .data/CTFd/uploads
    mkdir -p .data/mysql
    mkdir -p .data/redis
    mkdir -p conf/nginx
    mkdir -p conf/frp
    
    # 获取配置信息
    log_info "请输入配置信息:"
    
    # 获取服务器 IP
    DEFAULT_IP=$(hostname -I | awk '{print $1}')
    read -p "服务器 IP 地址 [$DEFAULT_IP]: " SERVER_IP
    SERVER_IP=${SERVER_IP:-$DEFAULT_IP}
    
    # 获取节点名称
    DEFAULT_NODE=$(docker node ls --format "{{.Hostname}}" | head -1)
    read -p "Docker Swarm 节点名称 [$DEFAULT_NODE]: " SWARM_NODE
    SWARM_NODE=${SWARM_NODE:-$DEFAULT_NODE}
    
    # 生成随机 token
    FRP_TOKEN=$(openssl rand -hex 16)
    
    log_info "使用配置:"
    echo "  服务器 IP: $SERVER_IP"
    echo "  节点名称: $SWARM_NODE"
    echo "  FRP Token: $FRP_TOKEN"
    
    # 创建 Nginx 配置
    cat > conf/nginx/http.conf << 'EOF'
worker_processes 4;

events {
    worker_connections 1024;
}

http {
    client_max_body_size 4G;
    
    upstream app_servers {
        server 172.19.0.4:8000;
    }
    
    server {
        listen 80;
        server_name _;
        
        location / {
            proxy_pass http://app_servers;
            proxy_redirect off;
            
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Host $server_name;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
    
    # 创建 FRP Server 配置
    cat > /usr/local/frp/frps.ini << EOF
[common]
bind_addr = 0.0.0.0
bind_port = 7897
token = $FRP_TOKEN
vhost_http_port = 8080
subdomain_host = $SERVER_IP.xip.io
dashboard_port = 7500
dashboard_user = admin
dashboard_pwd = admin
EOF
    
    # 创建 FRP Client 配置
    cat > conf/frp/frpc.ini << EOF
[common]
server_addr = host.docker.internal
server_port = 7897
token = $FRP_TOKEN
admin_addr = 0.0.0.0
admin_port = 7400
log_file = /dev/stdout
log_level = info
EOF
    
    # 创建 Docker Compose 配置
    cat > docker-compose.yml << 'COMPOSE_EOF'
services:
  ctfd:
    build: .
    user: root
    restart: always
    ports:
      - "8000:8000"
    environment:
      - UPLOAD_FOLDER=/var/uploads
      - DATABASE_URL=mysql+pymysql://ctfd:ctfd@172.19.0.3/ctfd
      - REDIS_URL=redis://172.19.0.2:6379
      - WORKERS=1
      - LOG_FOLDER=/var/log/CTFd
      - ACCESS_LOG=-
      - ERROR_LOG=-
      - REVERSE_PROXY=true
    volumes:
      - .data/CTFd/logs:/var/log/CTFd
      - .data/CTFd/uploads:/var/uploads
      - .:/opt/CTFd:ro
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_healthy
      frpc:
        condition: service_started
    links:
      - db
      - cache
      - frpc
    networks:
      default:
        ipv4_address: 172.19.0.4
        aliases: [ ctfd ]

  nginx:
    image: nginx:stable
    restart: always
    volumes:
      - ./conf/nginx/http.conf:/etc/nginx/nginx.conf
    ports:
      - 80:80
    depends_on:
      ctfd:
        condition: service_started
    links:
      - ctfd
    networks:
      default:
        ipv4_address: 172.19.0.5

  db:
    image: mariadb:10.11
    restart: always
    environment:
      - MARIADB_ROOT_PASSWORD=ctfd
      - MARIADB_USER=ctfd
      - MARIADB_PASSWORD=ctfd
      - MARIADB_DATABASE=ctfd
      - MARIADB_AUTO_UPGRADE=1
    volumes:
      - .data/mysql:/var/lib/mysql
    networks:
      default:
        ipv4_address: 172.19.0.3
        aliases: [ db ]
    command: [mysqld, --character-set-server=utf8mb4, --collation-server=utf8mb4_unicode_ci, --wait_timeout=28800, --log-warnings=0]
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1"]
      interval: 10s
      timeout: 5s
      retries: 10

  cache:
    image: redis:4
    restart: always
    volumes:
    - .data/redis:/data
    networks:
      default:
        ipv4_address: 172.19.0.2
        aliases: [ cache ]
    healthcheck:
      test: [ "CMD", "redis-cli", "ping" ]
      interval: 5s
      timeout: 3s
      retries: 10

  frpc:
    image: snowdreamtech/frpc:0.52.3
    restart: always
    ports:
      - "7400:7400"
    volumes:
      - ./conf/frp/frpc.ini:/etc/frp/frpc.ini
    entrypoint: ["/usr/bin/frpc", "-c", "/etc/frp/frpc.ini"]
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      default:
        ipv4_address: 172.19.0.10
      frp-containers:

networks:
    default:
        driver: bridge
        ipam:
            config:
                - subnet: 172.19.0.0/16
                  gateway: 172.19.0.1
    frp-containers:
        external: true
        name: ctfd_frp-containers
COMPOSE_EOF
    
    # 创建 systemd 服务
    cat > /etc/systemd/system/frps.service << 'SERVICE_EOF'
[Unit]
Description=FRP Server Service
After=network.target

[Service]
Type=simple
User=root
Restart=on-failure
RestartSec=5s
ExecStart=/usr/local/frp/frps -c /usr/local/frp/frps.ini
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
SERVICE_EOF
    
    systemctl daemon-reload
    
    # 保存配置信息
    cat > /opt/CTFd/.whale_config << EOF
SERVER_IP=$SERVER_IP
SWARM_NODE=$SWARM_NODE
FRP_TOKEN=$FRP_TOKEN
EOF
    
    log_success "配置文件创建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 启动 FRP Server
    log_info "启动 FRP Server..."
    systemctl start frps
    systemctl enable frps
    sleep 2
    
    if systemctl is-active --quiet frps; then
        log_success "FRP Server 启动成功"
    else
        log_error "FRP Server 启动失败"
        journalctl -u frps -n 20
        exit 1
    fi
    
    # 启动 CTFd
    log_info "启动 CTFd（这可能需要几分钟）..."
    cd /opt/CTFd
    docker compose up -d
    
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    if docker compose ps | grep -q "Up"; then
        log_success "CTFd 服务启动成功"
    else
        log_error "CTFd 服务启动失败"
        docker compose ps
        exit 1
    fi
}

# 配置 Whale 插件
configure_whale() {
    log_info "配置 Whale 插件..."
    
    # 读取配置
    source /opt/CTFd/.whale_config
    
    # 等待数据库完全启动
    log_info "等待数据库初始化..."
    sleep 10
    
    # 配置 Whale
    docker exec ctfd-db-1 mysql -uctfd -pctfd -D ctfd << EOF
-- Docker 配置
INSERT INTO config (\`key\`, value) VALUES ('whale:docker_api_url', 'unix:///var/run/docker.sock') ON DUPLICATE KEY UPDATE value='unix:///var/run/docker.sock';
INSERT INTO config (\`key\`, value) VALUES ('whale:docker_max_cpu', '0.5') ON DUPLICATE KEY UPDATE value='0.5';
INSERT INTO config (\`key\`, value) VALUES ('whale:docker_max_memory', '256m') ON DUPLICATE KEY UPDATE value='256m';
INSERT INTO config (\`key\`, value) VALUES ('whale:docker_swarm_nodes', '$SWARM_NODE') ON DUPLICATE KEY UPDATE value='$SWARM_NODE';
INSERT INTO config (\`key\`, value) VALUES ('whale:auto_connect_network', 'ctfd_frp-containers') ON DUPLICATE KEY UPDATE value='ctfd_frp-containers';

-- FRP 配置
INSERT INTO config (\`key\`, value) VALUES ('whale:frp_api_url', 'http://172.19.0.10:7400') ON DUPLICATE KEY UPDATE value='http://172.19.0.10:7400';
INSERT INTO config (\`key\`, value) VALUES ('whale:frp_direct_ip_address', '$SERVER_IP') ON DUPLICATE KEY UPDATE value='$SERVER_IP';
INSERT INTO config (\`key\`, value) VALUES ('whale:frp_direct_port_maximum', '10100') ON DUPLICATE KEY UPDATE value='10100';
INSERT INTO config (\`key\`, value) VALUES ('whale:frp_direct_port_minimum', '10000') ON DUPLICATE KEY UPDATE value='10000';
INSERT INTO config (\`key\`, value) VALUES ('whale:frp_http_domain_suffix', '$SERVER_IP.xip.io') ON DUPLICATE KEY UPDATE value='$SERVER_IP.xip.io';
INSERT INTO config (\`key\`, value) VALUES ('whale:frp_http_port', '8080') ON DUPLICATE KEY UPDATE value='8080';
EOF
    
    log_success "Whale 插件配置完成"
}

# 显示信息
show_info() {
    source /opt/CTFd/.whale_config
    
    echo ""
    echo "========================================"
    echo "   CTFd Whale 安装完成！"
    echo "========================================"
    echo ""
    echo "📊 服务信息:"
    echo "  • CTFd 主页: http://$SERVER_IP"
    echo "  • CTFd 直接访问: http://$SERVER_IP:8000"
    echo "  • FRP Admin API: http://$SERVER_IP:7400"
    echo "  • FRP Dashboard: http://$SERVER_IP:7500 (admin/admin)"
    echo ""
    echo "🔧 配置信息:"
    echo "  • 服务器 IP: $SERVER_IP"
    echo "  • Swarm 节点: $SWARM_NODE"
    echo "  • FRP Token: $FRP_TOKEN"
    echo ""
    echo "📖 文档:"
    echo "  • 部署指南: /opt/CTFd/WHALE_DEPLOYMENT_GUIDE.md"
    echo "  • 题目制作: /opt/CTFd/CHALLENGE_BUILD_GUIDE.md"
    echo "  • 快速开始: /opt/CTFd/QUICKSTART.md"
    echo ""
    echo "🎯 下一步:"
    echo "  1. 访问 http://$SERVER_IP 完成 CTFd 初始化"
    echo "  2. 登录管理后台 → Plugins → ctfd-whale"
    echo "  3. 验证 Whale 配置（应该已自动配置）"
    echo "  4. 创建测试题目验证功能"
    echo ""
    echo "💡 提示:"
    echo "  • 查看日志: cd /opt/CTFd && docker compose logs -f"
    echo "  • 重启服务: cd /opt/CTFd && docker compose restart"
    echo "  • 查看 FRP: sudo systemctl status frps"
    echo ""
    echo "========================================"
    echo ""
}

# 主函数
main() {
    echo "========================================"
    echo "  CTFd Whale 自动化安装脚本"
    echo "  版本: 2.0"
    echo "  适用于: CTFd 3.8.1"
    echo "========================================"
    echo ""
    
    check_permission
    check_system
    
    log_info "开始安装..."
    
    install_docker
    init_swarm
    create_network
    download_ctfd
    download_whale
    install_frp
    configure_files
    start_services
    configure_whale
    
    show_info
    
    log_success "安装完成！"
}

# 运行主函数
main "$@"

