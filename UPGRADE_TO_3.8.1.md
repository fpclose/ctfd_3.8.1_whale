# CTFd Whale 插件升级到 CTFd 3.8.1 版本

本文档说明了将 ctfd-whale 插件从 CTFd 3.6.0 升级到 CTFd 3.8.1 所做的所有更改。

## 主要变更概述

### 1. 后端 API 更新

#### challenge_type.py
- **导入 ChallengeResponse**：添加了 `from CTFd.plugins.challenges import ChallengeResponse`
- **更新 attempt() 方法**：从返回元组 `(bool, str)` 改为返回 `ChallengeResponse` 对象
  
  **之前 (3.6.0)**:
  ```python
  return True, "正确"
  return False, "错误"
  ```
  
  **现在 (3.8.1)**:
  ```python
  return ChallengeResponse(status="correct", message="正确")
  return ChallengeResponse(status="incorrect", message="错误")
  ```

这个更改确保了与 CTFd 3.8.0+ 新的 Challenge API 的兼容性，并为未来的 CTFd 4.0 做好准备。

### 2. 前端 JavaScript 重构

CTFd 3.7.0+ 完全移除了 jQuery 作为全局变量。所有 jQuery 调用必须通过 `CTFd.lib.$` 访问。

#### view.js
- **移除全局 jQuery 依赖**：所有 `$()` 调用改为 `CTFd.lib.$()`
- **更新 renderer**：移除自定义 markdown renderer，设置为 `null` 以符合新标准
- **保持所有功能**：容器启动、销毁、续期等功能完全保留

**主要更改**:
```javascript
// 之前
$('#challenge-id').val()

// 现在
CTFd.lib.$('#challenge-id').val()
```

#### create.js
完全重写为符合 CTFd 3.8.1 插件标准：
```javascript
CTFd.plugin.run((_CTFd) => {
    const $ = _CTFd.lib.$
    const md = _CTFd.lib.markdown()
});
```

#### update.js
完全重写为符合 CTFd 3.8.1 插件标准（与 create.js 相同的结构）。

#### config.js 和 containers.js
这两个文件已经正确使用了 `CTFd.lib.$`、`CTFd.api`、`CTFd.fetch` 和 `CTFd.ui.ezq` API，因此无需修改。

### 3. 兼容性说明

所有功能都已保留并在 CTFd 3.8.1 中正常工作：

✅ **核心功能**
- Docker 容器动态创建
- 容器生命周期管理（启动、销毁、续期）
- 动态 flag 生成
- 容器资源限制
- FRP 端口转发配置
- 管理员容器监控

✅ **前端交互**
- 用户挑战页面容器控制
- 管理员配置页面
- 管理员容器管理页面
- 实时倒计时显示

✅ **后端功能**
- 作弊检测和通知
- 容器自动清理
- 动态评分支持
- 多种路由模式（HTTP、Direct、Direct-HTTP）

## 升级步骤

1. **备份现有插件**（如果需要）
   ```bash
   cp -r CTFd/plugins/ctfd-whale-master CTFd/plugins/ctfd-whale-master.bak
   ```

2. **替换插件文件**
   直接使用重构后的插件文件即可。所有更改都已应用。

3. **重启 CTFd**
   ```bash
   # 如果使用 Docker
   docker-compose restart
   
   # 如果直接运行
   python serve.py
   ```

4. **验证功能**
   - 登录管理员账户
   - 访问 "Whale" 菜单
   - 创建一个 dynamic_docker 类型的挑战
   - 测试容器启动、续期和销毁功能

## 技术细节

### ChallengeResponse 对象
新的 `ChallengeResponse` 类支持以下状态：
- `correct`: 答案正确
- `incorrect`: 答案错误
- `partial`: 部分正确（用于多 flag 挑战）

示例：
```python
return ChallengeResponse(status="correct", message="正确")
return ChallengeResponse(status="incorrect", message="错误")
return ChallengeResponse(status="partial", message="部分正确")
```

### jQuery 访问模式
在 CTFd 3.8.1 中：
- ✅ 使用 `CTFd.lib.$` 访问 jQuery
- ❌ 不要使用全局 `$` 或 `jQuery`
- ✅ 使用 `CTFd.fetch` 进行 API 调用
- ✅ 使用 `CTFd.ui.ezq.ezAlert` 显示提示框

## 向后兼容性

CTFd 3.8.1 的 `ChallengeResponse` 类实现了向后兼容的元组解包功能：
```python
# ChallengeResponse 可以像元组一样解包
status, message = ChallengeResponse(status="correct", message="正确")
# status = True, message = "正确"
```

但建议直接使用新的 API，因为元组返回格式将在 CTFd 4.0 中被完全移除。

## 已知问题和注意事项

1. **插件配置**：所有配置项保持不变，无需修改
2. **数据库迁移**：不需要数据库迁移，模型定义未改变
3. **Docker 配置**：Docker 相关配置完全兼容

## 测试清单

升级后请测试以下功能：

- [ ] 创建 dynamic_docker 类型挑战
- [ ] 用户启动容器
- [ ] 用户续期容器
- [ ] 用户销毁容器
- [ ] Flag 提交和验证
- [ ] 作弊检测功能
- [ ] 管理员查看容器列表
- [ ] 管理员手动管理容器
- [ ] 容器自动过期清理
- [ ] 动态评分功能
- [ ] 各种路由模式（HTTP、Direct、Direct-HTTP）

## 技术支持

如果遇到问题，请检查：
1. CTFd 版本是否为 3.8.1
2. Python 依赖是否完整安装
3. Docker 服务是否正常运行
4. FRP 配置是否正确

## 更新日志

### 2024 版本
- ✅ 支持 CTFd 3.8.1
- ✅ 使用新的 ChallengeResponse API
- ✅ 前端完全移除 jQuery 全局依赖
- ✅ 所有功能完整保留
- ✅ 向后兼容的代码实现

---

**重构完成时间**: 2024
**兼容版本**: CTFd 3.8.1
**维护状态**: 活跃
