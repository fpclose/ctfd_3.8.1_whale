const $ = CTFd.lib.$;

function htmlentities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function copyToClipboard(event, str) {
    // Select element
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    $(event.target).tooltip({
        title: "Copied!",
        trigger: "manual"
    });
    $(event.target).tooltip("show");

    setTimeout(function () {
        $(event.target).tooltip("hide");
    }, 1500);
}

$(".click-copy").click(function (e) {
    copyToClipboard(e, $(this).data("copy"));
})

async function delete_container(team_id, challenge_id) {
    let response = await CTFd.fetch("/api/v1/plugins/ctfd-whale/admin/container?team_id=" + team_id + "&challenge_id=" + challenge_id, {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    });
    response = await response.json();
    return response.success;
}
async function renew_container(team_id, challenge_id) {
    let response = await CTFd.fetch(
        "/api/v1/plugins/ctfd-whale/admin/container?team_id=" + team_id + "&challenge_id=" + challenge_id, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    });
    response = await response.json();
    return response.success;
}

$(".delete-container").click(function (e) {
    e.preventDefault();
    let container_id = $(this).attr("container-id");
    let team_id = $(this).attr("team-id");
    let challenge_id = $(this).attr("challenge-id");

    CTFd.ui.ezq.ezQuery({
        title: "Destroy Container",
        body: "<span>Are you sure you want to delete <strong>Container #{0}</strong>?</span>".format(
            htmlentities(container_id)
        ),
        success: async function () {
            await delete_container(team_id, challenge_id);
            location.reload();
        }
    });
});

$(".renew-container").click(function (e) {
    e.preventDefault();
    let container_id = $(this).attr("container-id");
    let team_id = $(this).attr("team-id");
    let challenge_id = $(this).attr("challenge-id");

    CTFd.ui.ezq.ezQuery({
        title: "Renew Container",
        body: "<span>Are you sure you want to renew <strong>Container #{0}</strong>?</span>".format(
            htmlentities(container_id)
        ),
        success: async function () {
            await renew_container(team_id, challenge_id);
            location.reload();
        },
    });
});
