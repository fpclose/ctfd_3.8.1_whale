import datetime
import traceback

from CTFd.utils import get_config
from .db import DBContainer, db
from .docker import DockerUtils
from .routers import Router


class ControlUtil:
    @staticmethod
    def try_add_container(team_id, challenge_id):
        container = DBContainer.create_container_record(team_id, challenge_id)
        try:
            DockerUtils.add_container(container)
        except Exception as e:
            DBContainer.remove_container_record(team_id, challenge_id)
            print(traceback.format_exc())
            return False, 'Docker创建失败'
        ok, msg = Router.register(container)
        if not ok:
            DockerUtils.remove_container(container)
            DBContainer.remove_container_record(team_id, challenge_id)
            return False, msg
        return True, 'Container已创建'

    @staticmethod
    def try_remove_container(team_id, challenge_id):
        container = DBContainer.get_current_containers(team_id=team_id, challenge_id=challenge_id)
        if not container:
            return False, '没有这个container'
        for _ in range(3):  # configurable? as "onerror_retry_cnt"
            try:
                ok, msg = Router.unregister(container)
                if not ok:
                    return False, msg
                DockerUtils.remove_container(container)
                DBContainer.remove_container_record(team_id, challenge_id)
                return True, 'Container已销毁'
            except Exception as e:
                print(traceback.format_exc())
        return False, '靶机销毁失败,请联系管理员!'

    @staticmethod
    def try_renew_container(team_id, challenge_id):
        container = DBContainer.get_current_containers(team_id, challenge_id)
        if not container:
            return False, '没有这个container'
        timeout = int(get_config("whale:docker_timeout", "3600"))
        container.start_time = container.start_time + \
                               datetime.timedelta(seconds=timeout)
        if container.start_time > datetime.datetime.now():
            container.start_time = datetime.datetime.now()
            # race condition? useless maybe?
            # useful when docker_timeout < poll timeout (10 seconds)
            # doesn't make any sense
        else:
            return False, '错误的container'
        container.renew_count += 1
        db.session.commit()
        return True, 'Container已续期'
