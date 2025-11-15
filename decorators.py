import functools
import time
from flask import request, current_app, session
from flask_restx import abort
from sqlalchemy.sql import and_

from CTFd.utils import get_config
from CTFd.models import Challenges
from CTFd.utils.user import is_admin, get_current_team
from .utils.cache import CacheProvider


def challenge_visible(func):
    @functools.wraps(func)
    def _challenge_visible(*args, **kwargs):
        challenge_id = request.args.get('challenge_id')
        if is_admin():
            if not Challenges.query.filter(
                Challenges.id == challenge_id
            ).first():
                abort(404, '没有这个题目', success=False)
        else:
            if not Challenges.query.filter(
                Challenges.id == challenge_id,
                and_(Challenges.state != "hidden", Challenges.state != "locked"),
            ).first():
                abort(403, '题目不可见', success=False)
        return func(*args, **kwargs)

    return _challenge_visible


def frequency_limited(func):
    @functools.wraps(func)
    def _frequency_limited(*args, **kwargs):
        if is_admin():
            return func(*args, **kwargs)
        redis_util = CacheProvider(app=current_app, team_id=get_current_team().id)
        if not redis_util.acquire_lock():
            abort(403, '请求过快!', success=False)
            # last request was unsuccessful. this is for protection.

        if "limit" not in session:
            session["limit"] = int(time.time())
        else:
            cooldown = int(get_config("whale:docker_cooldown_timeout", 60))
            if int(time.time()) - session["limit"] < cooldown:
                abort(403, f'请求限制, 至少间隔 {str(cooldown)} 秒.', success=False)
        session["limit"] = int(time.time())

        result = func(*args, **kwargs)
        redis_util.release_lock()  # if any exception is raised, lock will not be released
        return result

    return _frequency_limited
