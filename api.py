from datetime import datetime

from flask import request
from flask_restx import Namespace, Resource, abort

from CTFd.utils import get_config
from CTFd.utils import user as current_user
from CTFd.utils.decorators import admins_only, authed_only

from .decorators import challenge_visible, frequency_limited
from .utils.control import ControlUtil
from .utils.db import DBContainer
from .utils.routers import Router

admin_namespace = Namespace("ctfd-whale-admin")
team_namespace = Namespace("ctfd-whale-team")


@admin_namespace.errorhandler
@team_namespace.errorhandler
def handle_default(err):
    return {
        'success': False,
        'message': '未期望的事情发生'
    }, 500


@admin_namespace.route('/container')
class AdminContainers(Resource):
    @staticmethod
    @admins_only
    def get():
        page = abs(request.args.get("page", 1, type=int))
        results_per_page = abs(request.args.get("per_page", 20, type=int))
        page_start = results_per_page * (page - 1)
        page_end = results_per_page * (page - 1) + results_per_page

        count = DBContainer.get_all_alive_container_count()
        containers = DBContainer.get_all_alive_container_page(
            page_start, page_end)

        return {'success': True, 'data': {
            'containers': containers,
            'total': count,
            'pages': int(count / results_per_page) + (count % results_per_page > 0),
            'page_start': page_start,
        }}

    @staticmethod
    @admins_only
    def patch():
        team_id = request.args.get('team_id', -1)
        challenge_id = request.args.get('challenge_id', -1)
        result, message = ControlUtil.try_renew_container(team_id=int(team_id), challenge_id=int(challenge_id))
        if not result:
            abort(403, message, success=False)
        return {'success': True, 'message': message}

    @staticmethod
    @admins_only
    def delete():
        team_id = request.args.get('team_id')
        challenge_id = request.args.get('challenge_id')
        result, message = ControlUtil.try_remove_container(team_id, challenge_id)
        return {'success': result, 'message': message}


@team_namespace.route("/container")
class TeamContainers(Resource):
    @staticmethod
    @authed_only
    @challenge_visible
    def get():
        team_id = current_user.get_current_team().id
        challenge_id = request.args.get('challenge_id')
        container = DBContainer.get_current_containers(team_id=team_id, challenge_id=challenge_id)
        if not container:
            return {'success': True, 'data': {}}
        timeout = int(get_config("whale:docker_timeout", "3600"))
        #if int(container.challenge_id) != int(challenge_id):
        #    return abort(403, f'已启动其他题目靶机 ({container.challenge.name})', success=False)
        return {
            'success': True,
            'data': {
                'lan_domain': str(team_id) + "-" + container.uuid,
                'team_access': Router.access(container),
                'remaining_time': timeout - (datetime.now() - container.start_time).seconds,
            }
        }

    @staticmethod
    @authed_only
    @challenge_visible
    @frequency_limited
    def post():
        team_id = current_user.get_current_team().id
        challenge_id = request.args.get('challenge_id')
        ControlUtil.try_remove_container(team_id, challenge_id)

        current_count = DBContainer.get_all_alive_container_count()
        if int(get_config("whale:docker_max_container_count")) <= int(current_count):
            abort(403, '超出最大容器数量限制.', success=False)

        current_containers = DBContainer.get_team_alive_container(team_id)
        if current_containers > 1:
            abort(403, '超出队伍容器数量限制.', success=False)

        result, message = ControlUtil.try_add_container(
            team_id=team_id,
            challenge_id=challenge_id
        )
        if not result:
            abort(403, message, success=False)
        return {'success': True, 'message': message}

    @staticmethod
    @authed_only
    @challenge_visible
    @frequency_limited
    def patch():
        team_id = current_user.get_current_team().id
        challenge_id = request.args.get('challenge_id')
        docker_max_renew_count = int(get_config("whale:docker_max_renew_count", 5))
        container = DBContainer.get_current_containers(team_id, challenge_id)
        if container is None:
            abort(403, '找不到靶机.', success=False)
        #if int(container.challenge_id) != int(challenge_id):
        #    abort(403, f'已启动其他题目靶机({container.challenge.name})', success=False)
        if container.renew_count >= docker_max_renew_count:
            abort(403, '超过最大续期次数限制.', success=False)
        result, message = ControlUtil.try_renew_container(team_id=team_id, challenge_id=challenge_id)
        return {'success': result, 'message': message}

    @staticmethod
    @authed_only
    @frequency_limited
    def delete():
        team_id = current_user.get_current_team().id
        challenge_id = request.args.get('challenge_id')
        result, message = ControlUtil.try_remove_container(team_id, challenge_id)
        if not result:
            abort(403, message, success=False)
        return {'success': True, 'message': message}
