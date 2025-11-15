# GitHub 上传指南

## 快速上传步骤

### 方式一：Git 命令行（推荐）

```bash
# 1. 进入项目目录
cd /home/fpclose/ctfd-3.8.1-whale

# 2. 初始化 Git 仓库
git init

# 3. 添加所有文件
git add .

# 4. 创建初始提交
git commit -m "feat: CTFd 3.8.1 Whale Plugin v2.0 - Complete Enhanced Edition

- Full CTFd 3.8.1 compatibility
- Automated deployment solution
- Complete documentation suite
- Bug fixes and enhancements
- Production-ready configuration

Version: 2.0.0
Author: fpclose"

# 5. 添加远程仓库
git remote add origin https://github.com/fpclose/ctfd_3.8.1_whale.git

# 6. 设置主分支
git branch -M main

# 7. 推送到 GitHub
git push -u origin main
```

**认证说明**：
- GitHub 不再支持密码认证
- 需要使用 Personal Access Token (PAT)
- 当提示输入密码时，使用 PAT 而不是 GitHub 密码

**获取 Personal Access Token**：
1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Generate new token (classic)"
3. 设置 Token 名称：`CTFd Whale Upload`
4. 选择权限：勾选 `repo`（完整仓库访问权限）
5. 点击 "Generate token"
6. **立即复制 Token**（只显示一次）
7. 在 Git push 时使用这个 Token 作为密码

---

### 方式二：使用 SSH Key（推荐长期使用）

```bash
# 1. 生成 SSH Key（如果还没有）
ssh-keygen -t ed25519 -C "lsszuishuai@gmail.com"
# 按 Enter 使用默认路径，可以设置密码或留空

# 2. 查看公钥
cat ~/.ssh/id_ed25519.pub

# 3. 复制公钥内容，添加到 GitHub
# 访问：https://github.com/settings/keys
# 点击 "New SSH key"
# 粘贴公钥内容，保存

# 4. 测试 SSH 连接
ssh -T git@github.com

# 5. 上传项目
cd /home/fpclose/ctfd-3.8.1-whale
git init
git add .
git commit -m "Initial commit: CTFd Whale Plugin v2.0"
git remote add origin git@github.com:fpclose/ctfd_3.8.1_whale.git
git branch -M main
git push -u origin main
```

---

### 方式三：手动打包上传

如果 Git 命令行遇到问题，可以手动上传：

```bash
# 1. 打包项目
cd /home/fpclose
tar -czf ctfd-3.8.1-whale-v2.0.tar.gz ctfd-3.8.1-whale/

# 2. 下载压缩包到本地
# 使用 scp、sftp 或其他方式

# 3. 在 GitHub 网页操作
# - 访问：https://github.com/fpclose/ctfd_3.8.1_whale
# - 如果仓库已有内容，先清空或创建新分支
# - 点击 "Add file" -> "Upload files"
# - 解压后拖拽所有文件到页面
# - 填写提交信息
# - 点击 "Commit changes"
```

---

## 推送后的配置

### 1. 仓库设置

访问：https://github.com/fpclose/ctfd_3.8.1_whale/settings

#### 基本信息
- **Description**: `CTFd 3.8.1 Whale Plugin - Production-ready dynamic container management solution`
- **Website**: 留空或填写相关链接
- **Topics**: 添加标签
  - `ctfd`
  - `docker`
  - `docker-swarm`
  - `frp`
  - `ctf`
  - `security`
  - `python`
  - `flask`

#### 功能开关
- ✅ Issues（问题追踪）
- ✅ Discussions（讨论区，可选）
- ✅ Projects（项目管理，可选）
- ✅ Wiki（维基，可选）

### 2. 创建 Release

访问：https://github.com/fpclose/ctfd_3.8.1_whale/releases/new

#### Release 配置
- **Tag**: `v2.0.0`
- **Target**: `main`
- **Title**: `v2.0.0 - Complete Enhanced Edition`
- **Description**:

```markdown
# CTFd Whale Plugin v2.0.0 - Complete Enhanced Edition

## 🎉 Major Release

This is a complete rewrite and enhancement of the CTFd Whale plugin, providing a production-ready solution for dynamic container management in CTFd 3.8.1.

## ✨ Key Features

- **Full CTFd 3.8.1 Compatibility**: Extensively tested and verified
- **Automated Deployment**: One-command installation script (600+ lines)
- **Complete Documentation**: English + Chinese, 70KB+ of detailed guides
- **Bug Fixes**: All major issues from v1.x resolved
- **Production Ready**: Includes monitoring, logging, security best practices

## 🔧 What's New

### Core Features
- Automated installation script with dependency management
- Complete deployment solution (Docker + Swarm + FRP)
- Configuration templates for all components
- Example challenge with full source code
- Comprehensive documentation suite

### Bug Fixes
- Fixed DNS resolution preventing database connection
- Fixed FRP Admin API "Unable to access" error
- Fixed container startup and destruction failures
- Fixed flag placeholder replacement issues
- Fixed network communication problems

### Documentation
- Complete technical documentation (README.md)
- Deployment and usage guide (DEPLOYMENT_README.md)
- Development changes documentation (DEVELOPMENT_CHANGES.md)
- Chinese quick start (README_CN.md)
- Contributing guidelines (CONTRIBUTING.md)
- Security policy (SECURITY.md)

## 📦 Installation

```bash
git clone https://github.com/fpclose/ctfd_3.8.1_whale.git
cd ctfd_3.8.1_whale
sudo ./install_whale.sh
```

## 📚 Documentation

- **Installation**: See `README.md` or `DEPLOYMENT_README.md`
- **API Reference**: See `README.md` Section 9
- **Troubleshooting**: See `DEPLOYMENT_README.md` Section 7
- **Development**: See `DEVELOPMENT_CHANGES.md`

## 🐛 Known Issues

None at this time. Please report any issues on GitHub.

## 🙏 Acknowledgments

- CTFd Team for the excellent CTF framework
- frankli0324 for the original Whale plugin
- All contributors and testers

## 📧 Support

- **Issues**: https://github.com/fpclose/ctfd_3.8.1_whale/issues
- **Email**: lsszuishuai@gmail.com

---

**Full Changelog**: See [CHANGELOG.md](CHANGELOG.md)
```

- **Attach files**: 可选择附加压缩包

### 3. 分支保护（可选）

如果需要更严格的代码审查：

访问：https://github.com/fpclose/ctfd_3.8.1_whale/settings/branches

- 添加 `main` 分支保护规则
- 选项：
  - ✅ Require a pull request before merging
  - ✅ Require approvals (至少 1 个)
  - ✅ Require status checks to pass

### 4. 更新仓库主页

确保 README.md 正确显示：
- 访问仓库主页查看渲染效果
- 检查所有链接是否正常
- 验证图片和徽章显示

---

## 常见问题

### Q: Push 时提示 403 错误
**A**: 确认使用的是 Personal Access Token，不是密码

### Q: 仓库已有内容怎么办？
**A**: 可以选择：
1. 删除现有内容后重新推送
2. 使用 `git push -f` 强制推送（慎用）
3. 创建新分支合并

### Q: 文件太大无法上传
**A**: Git 对单个文件有 100MB 限制，本项目所有文件都远小于此限制

### Q: 如何更新已推送的内容？
**A**: 
```bash
cd /home/fpclose/ctfd-3.8.1-whale
git add .
git commit -m "Update: description of changes"
git push
```

---

## 验证清单

推送完成后，验证以下内容：

- [ ] README.md 正确显示
- [ ] 所有文档文件可访问
- [ ] LICENSE 文件存在
- [ ] .gitignore 正常工作
- [ ] 没有敏感信息泄露
- [ ] 所有链接正常工作
- [ ] Issues 模板正常显示
- [ ] PR 模板正常显示
- [ ] 仓库描述和标签已设置

---

**准备就绪！现在可以开始推送了。**

推荐使用方式一（Git + PAT）或方式二（SSH），它们更可靠且易于维护。
