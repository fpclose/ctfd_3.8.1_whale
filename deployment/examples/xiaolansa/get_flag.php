<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>获取 Flag</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        .error {
            color: #e74c3c;
        }
        .success {
            color: #27ae60;
        }
        .flag {
            background: #f8f9fa;
            border: 2px solid #667eea;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 18px;
            word-break: break-all;
        }
        .shark-emoji {
            font-size: 80px;
            margin: 20px 0;
        }
        a {
            color: #667eea;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <?php
        // 检查 Referer 是否来自 bluesharkinfo.com
        if (!isset($_SERVER['HTTP_REFERER']) || 
            strpos($_SERVER['HTTP_REFERER'], 'bluesharkinfo.com') === false) {
            ?>
            <div class="shark-emoji">🦈</div>
            <h1 class="error">访问被拒绝</h1>
            <p>小蓝鲨说：你不是从我最喜欢的网站来的！</p>
            <p>💡 提示：我最喜欢的网站是 <a href="https://www.bluesharkinfo.com/" target="_blank">www.bluesharkinfo.com</a></p>
            <p><a href="index.php">← 返回首页</a></p>
            <?php
        } else {
            // 显示 flag
            include "flag.php";
            ?>
            <div class="shark-emoji">🎉</div>
            <h1 class="success">恭喜你！</h1>
            <p>你成功找到了小蓝鲨的秘密！</p>
            <div class="flag"><?php echo htmlspecialchars($flag); ?></div>
            <p>🦈 小蓝鲨很高兴认识你！</p>
            <?php
        }
        ?>
    </div>
</body>
</html>

