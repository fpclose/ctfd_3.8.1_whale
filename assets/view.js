CTFd._internal.challenge.data = undefined;

CTFd._internal.challenge.renderer = null;

CTFd._internal.challenge.preRender = function () {
}

CTFd._internal.challenge.render = null;

CTFd._internal.challenge.postRender = function () {
    // 注入自定义样式
    injectWhaleStyles();
    
    // 添加自定义样式类到 flag 输入框和提交按钮
    setTimeout(function() {
        // 添加 whale-flag-input 类到输入框
        var flagInput = document.getElementById('challenge-input');
        if (flagInput && !flagInput.classList.contains('whale-flag-input')) {
            flagInput.classList.add('whale-flag-input');
        }
        
        // 添加 whale-submit-btn 类到提交按钮
        var submitBtn = document.getElementById('challenge-submit');
        if (submitBtn && !submitBtn.classList.contains('whale-submit-btn')) {
            submitBtn.classList.add('whale-submit-btn');
        }
        
        loadInfo();
    }, 100);
}

function injectWhaleStyles() {
    // 检查是否已经注入过样式
    if (document.getElementById('whale-custom-styles')) {
        return;
    }
    
    var styleSheet = document.createElement('style');
    styleSheet.id = 'whale-custom-styles';
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = `
/* Whale Plugin - Minimalist Design - Highest Priority */

/* Flag Input Field - Clean & Modern */
#challenge-input.whale-flag-input,
input[name="submission"].whale-flag-input,
.challenge-input.whale-flag-input {
    width: 100% !important;
    padding: 15px 20px !important;
    font-size: 15px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
    font-weight: 500 !important;
    color: #2d3748 !important;
    background-color: #ffffff !important;
    background-image: none !important;
    border: 2px solid #e2e8f0 !important;
    border-radius: 12px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
}

#challenge-input.whale-flag-input:hover,
input[name="submission"].whale-flag-input:hover,
.challenge-input.whale-flag-input:hover {
    border-color: #cbd5e0 !important;
    background-color: #ffffff !important;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08) !important;
    transform: translateY(-1px) !important;
}

#challenge-input.whale-flag-input:focus,
input[name="submission"].whale-flag-input:focus,
.challenge-input.whale-flag-input:focus {
    border-color: #667eea !important;
    background-color: #ffffff !important;
    outline: none !important;
    box-shadow: 
        0 0 0 3px rgba(102, 126, 234, 0.1),
        0 4px 12px rgba(102, 126, 234, 0.15) !important;
    transform: translateY(-2px) !important;
}

#challenge-input.whale-flag-input::placeholder,
input[name="submission"].whale-flag-input::placeholder,
.challenge-input.whale-flag-input::placeholder {
    color: #a0aec0 !important;
    font-weight: 400 !important;
}

/* Submit Button - Clean & Modern */
#challenge-submit.whale-submit-btn,
button[type="submit"].whale-submit-btn,
.challenge-submit.whale-submit-btn {
    width: 100% !important;
    padding: 14px 28px !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    color: #ffffff !important;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    background-color: #667eea !important;
    border: none !important;
    border-radius: 12px !important;
    cursor: pointer !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    box-shadow: 
        0 4px 12px rgba(102, 126, 234, 0.3),
        0 2px 4px rgba(118, 75, 162, 0.2) !important;
    position: relative !important;
    overflow: hidden !important;
}

#challenge-submit.whale-submit-btn::before,
button[type="submit"].whale-submit-btn::before,
.challenge-submit.whale-submit-btn::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: -100% !important;
    width: 100% !important;
    height: 100% !important;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent) !important;
    transition: left 0.5s !important;
    z-index: 1 !important;
}

#challenge-submit.whale-submit-btn:hover::before,
button[type="submit"].whale-submit-btn:hover::before,
.challenge-submit.whale-submit-btn:hover::before {
    left: 100% !important;
}

#challenge-submit.whale-submit-btn:hover,
button[type="submit"].whale-submit-btn:hover,
.challenge-submit.whale-submit-btn:hover {
    background: linear-gradient(135deg, #5568d3 0%, #6a3e8f 100%) !important;
    background-color: #5568d3 !important;
    transform: translateY(-2px) !important;
    box-shadow: 
        0 8px 20px rgba(102, 126, 234, 0.4),
        0 4px 8px rgba(118, 75, 162, 0.3) !important;
}

#challenge-submit.whale-submit-btn:active,
button[type="submit"].whale-submit-btn:active,
.challenge-submit.whale-submit-btn:active {
    transform: translateY(0) !important;
    box-shadow: 
        0 2px 8px rgba(102, 126, 234, 0.3),
        0 1px 4px rgba(118, 75, 162, 0.2) !important;
}

#challenge-submit.whale-submit-btn:focus,
button[type="submit"].whale-submit-btn:focus,
.challenge-submit.whale-submit-btn:focus {
    outline: none !important;
    box-shadow: 
        0 0 0 3px rgba(102, 126, 234, 0.2),
        0 8px 20px rgba(102, 126, 234, 0.4),
        0 4px 8px rgba(118, 75, 162, 0.3) !important;
}

/* Boot Button Enhancement */
.whale-boot-btn {
    padding: 10px 30px !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    border-radius: 8px !important;
    box-shadow: 0 3px 10px rgba(0, 123, 255, 0.3) !important;
    transition: all 0.3s ease !important;
}

.whale-boot-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 5px 14px rgba(0, 123, 255, 0.4) !important;
}

.whale-boot-btn i {
    margin-right: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
    #challenge-input.whale-flag-input,
    input.whale-flag-input {
        font-size: 14px !important;
        padding: 12px 16px !important;
    }
    
    #challenge-submit.whale-submit-btn,
    button.whale-submit-btn {
        font-size: 14px !important;
        padding: 12px 24px !important;
    }
    
    .whale-boot-btn {
        font-size: 14px !important;
        padding: 8px 20px !important;
    }
}

/* Loading Animation */
button.whale-submit-btn.loading {
    color: transparent !important;
    pointer-events: none !important;
}

button.whale-submit-btn.loading::after {
    content: "" !important;
    position: absolute !important;
    width: 18px !important;
    height: 18px !important;
    top: 50% !important;
    left: 50% !important;
    margin-left: -9px !important;
    margin-top: -9px !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 50% !important;
    border-top-color: #fff !important;
    animation: spin 0.6s linear infinite !important;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Success/Error State */
input.whale-flag-input.success {
    border-color: #48bb78 !important;
    background: #f0fff4 !important;
    box-shadow: 
        0 0 0 3px rgba(72, 187, 120, 0.15),
        0 4px 12px rgba(72, 187, 120, 0.2) !important;
}

input.whale-flag-input.error {
    border-color: #f56565 !important;
    background: #fff5f5 !important;
    box-shadow: 
        0 0 0 3px rgba(245, 101, 101, 0.15),
        0 4px 12px rgba(245, 101, 101, 0.2) !important;
    animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) !important;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
    `;
    
    document.head.appendChild(styleSheet);
}

function loadInfo() {
    var challengeIdElement = document.getElementById('challenge-id');
    if (!challengeIdElement) {
        console.error('challenge-id element not found, retrying...');
        // 如果元素未找到，再次延迟重试
        setTimeout(function() {
            loadInfo();
        }, 200);
        return;
    }
    var challenge_id = challengeIdElement.value;
    var url = "/api/v1/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    var params = {};

    CTFd.fetch(url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function (response) {
        if (window.t !== undefined) {
            clearInterval(window.t);
            window.t = undefined;
        }
        if (response.success) {
            response = response.data;
        } else {
            if (CTFd.ui && CTFd.ui.ezq && CTFd.ui.ezq.ezAlert) {
                CTFd.ui.ezq.ezAlert({
                    title: "失败",
                    body: response.message,
                    button: "OK"
                });
            } else {
                alert("失败: " + response.message);
            }
            return;
        }
        if (response.remaining_time === undefined) {
            document.getElementById('whale-panel').innerHTML = '<div class="tabpanel" style="width: 100%;">' +
                '<div class="card-body">' +
                '<h5 class="card-title">靶机信息</h5>' +
                '<button type="button" class="btn btn-primary card-link" id="whale-button-boot" ' +
                '        onclick="CTFd._internal.challenge.boot()">' +
                '启动靶机' +
                '</button>' +
                '</div>' +
                '</div>';
        } else {
            document.getElementById('whale-panel').innerHTML = 
                `<div class="tabpanel" style="width: 100%;">
                    <div class="card-body">
                        <h5 class="card-title">靶机信息</h5>
                        <h6 class="card-subtitle mb-2 text-muted" id="whale-challenge-count-down">
                            剩余时间: ${response.remaining_time}秒
                        </h6>
                        <h6 class="card-subtitle mb-2 text-muted">
                            局域网域名: ${response.lan_domain}
                        </h6>
                        <p id="team-access" class="card-text"></p>
                        <button type="button" class="btn btn-danger card-link" id="whale-button-destroy"
                                onclick="CTFd._internal.challenge.destroy()">
                            销毁靶机
                        </button>
                        <button type="button" class="btn btn-success card-link" id="whale-button-renew"
                                onclick="CTFd._internal.challenge.renew()">
                            续期靶机
                        </button>
                    </div>
                </div>`;
            document.getElementById('team-access').innerHTML = response.team_access;

            function showAuto() {
                const c = document.getElementById('whale-challenge-count-down');
                if (c === null) return;
                const origin = c.innerHTML;
                const second = parseInt(origin.split(": ")[1].split('秒')[0]) - 1;
                c.innerHTML = '剩余时间: ' + second + '秒';
                if (second < 0) {
                    loadInfo();
                }
            }

            window.t = setInterval(showAuto, 1000);
        }
    });
};

CTFd._internal.challenge.destroy = function () {
    var challenge_id = document.getElementById('challenge-id').value;
    var url = "/api/v1/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    var btn = document.getElementById('whale-button-destroy');
    btn.innerHTML = "请稍候...";
    btn.disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function (response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function (response) {
        if (response.success) {
            loadInfo();
            if (CTFd.ui && CTFd.ui.ezq && CTFd.ui.ezq.ezAlert) {
                CTFd.ui.ezq.ezAlert({
                    title: "成功",
                    body: "您的靶机已被销毁!",
                    button: "OK"
                });
            } else {
                alert("成功: 您的靶机已被销毁!");
            }
        } else {
            var btn = document.getElementById('whale-button-destroy');
            if (btn) {
                btn.innerHTML = "销毁靶机";
                btn.disabled = false;
            }
            if (CTFd.ui && CTFd.ui.ezq && CTFd.ui.ezq.ezAlert) {
                CTFd.ui.ezq.ezAlert({
                    title: "失败",
                    body: response.message,
                    button: "OK"
                });
            } else {
                alert("失败: " + response.message);
            }
        }
    });
};

CTFd._internal.challenge.renew = function () {
    var challenge_id = document.getElementById('challenge-id').value;
    var url = "/api/v1/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    var btn = document.getElementById('whale-button-renew');
    btn.innerHTML = "请稍候...";
    btn.disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function (response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function (response) {
        if (response.success) {
            loadInfo();
            if (CTFd.ui && CTFd.ui.ezq && CTFd.ui.ezq.ezAlert) {
                CTFd.ui.ezq.ezAlert({
                    title: "成功",
                    body: "您的靶机已成功续期!",
                    button: "OK"
                });
            } else {
                alert("成功: 您的靶机已成功续期!");
            }
        } else {
            var btn = document.getElementById('whale-button-renew');
            if (btn) {
                btn.innerHTML = "续期靶机";
                btn.disabled = false;
            }
            if (CTFd.ui && CTFd.ui.ezq && CTFd.ui.ezq.ezAlert) {
                CTFd.ui.ezq.ezAlert({
                    title: "失败",
                    body: response.message,
                    button: "OK"
                });
            } else {
                alert("失败: " + response.message);
            }
        }
    });
};

CTFd._internal.challenge.boot = function () {
    var challenge_id = document.getElementById('challenge-id').value;
    var url = "/api/v1/plugins/ctfd-whale/container?challenge_id=" + challenge_id;

    var btn = document.getElementById('whale-button-boot');
    btn.innerHTML = "请稍候...";
    btn.disabled = true;

    var params = {};

    CTFd.fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    }).then(function (response) {
        if (response.status === 429) {
            // User was ratelimited but process response
            return response.json();
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response.json();
        }
        return response.json();
    }).then(function (response) {
        if (response.success) {
            loadInfo();
            if (CTFd.ui && CTFd.ui.ezq && CTFd.ui.ezq.ezAlert) {
                CTFd.ui.ezq.ezAlert({
                    title: "成功",
                    body: "您的靶机已启动!",
                    button: "OK"
                });
            } else {
                alert("成功: 您的靶机已启动!");
            }
        } else {
            var btn = document.getElementById('whale-button-boot');
            if (btn) {
                btn.innerHTML = "启动靶机";
                btn.disabled = false;
            }
            if (CTFd.ui && CTFd.ui.ezq && CTFd.ui.ezq.ezAlert) {
                CTFd.ui.ezq.ezAlert({
                    title: "失败",
                    body: response.message,
                    button: "OK"
                });
            } else {
                alert("失败: " + response.message);
            }
        }
    });
};


CTFd._internal.challenge.submit = function (preview) {
    var challenge_id = document.getElementById('challenge-id').value;
    var submission = document.getElementById('challenge-input').value;
    var submitBtn = document.getElementById('challenge-submit');
    var inputField = document.getElementById('challenge-input');

    // Add loading state
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    }

    // Remove previous state classes
    if (inputField) {
        inputField.classList.remove('success', 'error');
    }

    var body = {
        'challenge_id': challenge_id,
        'submission': submission,
    }
    var params = {}
    if (preview)
        params['preview'] = true

    return CTFd.api.post_challenge_attempt(params, body).then(function (response) {
        // Remove loading state
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }

        // Add visual feedback based on result
        if (response.data && response.data.status === 'correct') {
            if (inputField) {
                inputField.classList.add('success');
                setTimeout(function() {
                    inputField.classList.remove('success');
                }, 3000);
            }
        } else if (response.data && response.data.status === 'incorrect') {
            if (inputField) {
                inputField.classList.add('error');
                setTimeout(function() {
                    inputField.classList.remove('error');
                }, 3000);
            }
        }

        if (response.status === 429) {
            // User was ratelimited but process response
            return response
        }
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            return response
        }
        loadInfo();
        return response
    }).catch(function(error) {
        // Remove loading state on error
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
        if (inputField) {
            inputField.classList.add('error');
            setTimeout(function() {
                inputField.classList.remove('error');
            }, 3000);
        }
        throw error;
    })
};
