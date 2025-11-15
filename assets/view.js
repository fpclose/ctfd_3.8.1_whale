CTFd._internal.challenge.data = undefined;

CTFd._internal.challenge.renderer = null;

CTFd._internal.challenge.preRender = function () {
}

CTFd._internal.challenge.render = null;

CTFd._internal.challenge.postRender = function () {
    loadInfo();
}

function loadInfo() {
    var challenge_id = document.getElementById('challenge-id').value;
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
        if (response.success) response = response.data;
        else CTFd.ui.ezq.ezAlert({
            title: "失败",
            body: response.message,
            button: "OK"
        });
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
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "您的靶机已被销毁!",
                button: "OK"
            });
        } else {
            var btn = document.getElementById('whale-button-destroy');
            if (btn) {
                btn.innerHTML = "销毁靶机";
                btn.disabled = false;
            }
            CTFd.ui.ezq.ezAlert({
                title: "失败",
                body: response.message,
                button: "OK"
            });
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
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "您的靶机已成功续期!",
                button: "OK"
            });
        } else {
            var btn = document.getElementById('whale-button-renew');
            if (btn) {
                btn.innerHTML = "续期靶机";
                btn.disabled = false;
            }
            CTFd.ui.ezq.ezAlert({
                title: "失败",
                body: response.message,
                button: "OK"
            });
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
            CTFd.ui.ezq.ezAlert({
                title: "成功",
                body: "您的靶机已启动!",
                button: "OK"
            });
        } else {
            var btn = document.getElementById('whale-button-boot');
            if (btn) {
                btn.innerHTML = "启动靶机";
                btn.disabled = false;
            }
            CTFd.ui.ezq.ezAlert({
                title: "失败",
                body: response.message,
                button: "OK"
            });
        }
    });
};


CTFd._internal.challenge.submit = function (preview) {
    var challenge_id = document.getElementById('challenge-id').value;
    var submission = document.getElementById('challenge-input').value;

    var body = {
        'challenge_id': challenge_id,
        'submission': submission,
    }
    var params = {}
    if (preview)
        params['preview'] = true

    return CTFd.api.post_challenge_attempt(params, body).then(function (response) {
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
    })
};
