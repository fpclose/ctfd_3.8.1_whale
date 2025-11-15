from collections import UserString
from flask import Blueprint
import requests
from CTFd.models import db, Flags
from CTFd.plugins.challenges import BaseChallenge, ChallengeResponse
from CTFd.plugins.dynamic_challenges import DynamicValueChallenge
from CTFd.plugins.flags import get_flag_class
from CTFd.utils import user as current_user
from .models import WhaleContainer, DynamicDockerChallenge, WhaleFlag
from .utils.control import ControlUtil


class DynamicValueDockerChallenge(BaseChallenge):
    id = "dynamic_docker"  # Unique identifier used to register challenges
    name = "dynamic_docker"  # Name of a challenge type
    # Blueprint used to access the static_folder directory.
    blueprint = Blueprint(
        "ctfd-whale-challenge",
        __name__,
        template_folder="templates",
        static_folder="assets",
    )
    challenge_model = DynamicDockerChallenge

    @classmethod
    def read(cls, challenge):
        challenge = DynamicDockerChallenge.query.filter_by(id=challenge.id).first()
        data = {
            "id": challenge.id,
            "name": challenge.name,
            "value": challenge.value,
            "initial": challenge.initial,
            "decay": challenge.decay,
            "minimum": challenge.minimum,
            "description": challenge.description,
            "category": challenge.category,
            "state": challenge.state,
            "max_attempts": challenge.max_attempts,
            "type": challenge.type,
            "type_data": {
                "id": cls.id,
                "name": cls.name,
                "templates": cls.templates,
                "scripts": cls.scripts,
            },
        }
        return data

    @classmethod
    def update(cls, challenge, request):
        data = request.form or request.get_json()

        for attr, value in data.items():
            # We need to set these to floats so that the next operations don't operate on strings
            if attr in ("initial", "minimum", "decay"):
                value = float(value)
            setattr(challenge, attr, value)

        if int(str(challenge.dynamic_score)) == 1:
            return DynamicValueChallenge.calculate_value(challenge)

        db.session.commit()
        return challenge

    @classmethod
    def attempt(cls, challenge, request):
        data = request.form or request.get_json()
        submission = data["submission"].strip()

        flags = Flags.query.filter_by(challenge_id=challenge.id).all()

        if len(flags) > 0:
            for flag in flags:
                if get_flag_class(flag.type).compare(flag, submission):
                    return ChallengeResponse(status="correct", message="正确")
            return ChallengeResponse(status="incorrect", message="错误")
        else:
            team_id = current_user.get_current_team().id
            q = db.session.query(WhaleContainer)
            q = q.filter(WhaleContainer.team_id == team_id)
            q = q.filter(WhaleContainer.challenge_id == challenge.id)
            records = q.all()
            if len(records) == 0:
                q = db.session.query(WhaleFlag)
                q = q.filter(WhaleFlag.flag == submission)
                q = q.filter(WhaleFlag.team_id != team_id)
                records = q.all()
                if len(records) != 0:
                    cls.send_cheat_notification(team_id, challenge.id, submission, records[0].team_id)
                    return ChallengeResponse(status="incorrect", message="flag重复")
                return ChallengeResponse(status="incorrect", message="请在靶机运行时答题")

            container = records[0]
            if container.flag == submission:
                ControlUtil.try_remove_container(team_id, challenge.id)
                return ChallengeResponse(status="correct", message="正确")

            q = db.session.query(WhaleFlag)
            q = q.filter(WhaleFlag.flag == submission)
            q = q.filter(WhaleFlag.team_id != team_id)
            records = q.all()
            if len(records) != 0:
                cls.send_cheat_notification(team_id, challenge.id, submission, records[0].team_id)
                return ChallengeResponse(status="incorrect", message="flag重复")
            return ChallengeResponse(status="incorrect", message="错误")

    @classmethod
    def send_cheat_notification(cls, team_id, challenge_id, submission, conflicting_team_id):
        """
        发送作弊检测通知到指定的 HTTP 服务
        """
        message = f"TeamID: {team_id} 提交了挑战 {challenge_id} 的 flag，与 TeamID: {conflicting_team_id} 的 flag 重复。"
        group_ids = [458249630, 731841782, 340254374]  # 要发送消息的群组列表

        for group_id in group_ids:
            data = {
                "GroupId": group_id,
                "Message": message
            }

            try:
                response = requests.post("http://gz.imxbt.cn:40018/notify", json=data)
                if response.status_code == 200:
                    print(f"作弊检测通知成功发送到群 {group_id}")
                else:
                    print(f"作弊检测通知发送到群 {group_id} 失败，状态码: {response.status_code}")
            except Exception as e:
                print(f"发送作弊检测通知到群 {group_id} 时发生错误: {e}")

    @classmethod
    def solve(cls, user, team, challenge, request):
        super().solve(user, team, challenge, request)

        if int(str(challenge.dynamic_score)) == 1:
            DynamicValueChallenge.calculate_value(challenge)

        db.session.commit()

    @classmethod
    def delete(cls, challenge):
        for container in WhaleContainer.query.filter_by(
                challenge_id=challenge.id
        ).all():
            ControlUtil.try_remove_container(container.team_id, container.challenge_id)
        super().delete(challenge)
