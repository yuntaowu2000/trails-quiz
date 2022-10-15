import json
import datetime
import redis
from nonebot import on_command
from nonebot.adapters.onebot.v11 import Bot, Event, MessageSegment
from .data_source import draw_quiz_question

my_redis = redis.Redis(host='localhost', port=6379, db=0)

trails_quiz = on_command(".kquiz", aliases={".trailsquiz", ".tQuiz", ".trailsQuiz"})
trails_quiz_result = on_command(".kquiz分")

async def get_audio_title(bot: Bot, event: Event):
    ids = str(event.get_session_id()).split("_")
    if ids[0] == "group":
        gid = ids[1]
        uid = ids[2]
        result = await bot.call_api("get_group_member_info", group_id=gid, user_id=uid)
        return result["nickname"] + "题目音频"
    else:
        return str(event.get_user_id()) + "题目音频"

@trails_quiz.handle()
async def trails_quiz_handler(bot: Bot, event: Event):
    today = datetime.datetime.now()
    # convert to UTC+8 (Beijing time)
    today = today.astimezone(datetime.timezone(datetime.timedelta(hours=8)))
    todaystr = "{0}-{1}-{2}".format(today.year, today.month, today.day)
    daycount = 0
    redis_key = todaystr + str(event.get_user_id()) + "quiz"
    if my_redis.get(redis_key) is None:
        tomorrow = today + datetime.timedelta(days=1)
        reset_time = datetime.datetime(year=tomorrow.year, month=tomorrow.month, day=tomorrow.day)
        today = today.replace(tzinfo=None)
        ttl = (reset_time - today).total_seconds()
        my_redis.set(redis_key, 1, ex=round(ttl))
    else:
        daycount = int(my_redis.get(redis_key))
        my_redis.incr(redis_key, 1)

    if daycount >= 5:
        await trails_quiz.finish("今日答题次数已满，明天0时重置答题次数，可使用 .kquiz分 查看今日quiz结果。可前往https://trails-game.com/trails-quiz/ 进行答题，不限次数。", at_sender=True)
        return

    curr_question, msg = draw_quiz_question()

    # set time out to be 2 mins
    my_redis.set(str(event.get_user_id()) + "curr_question", json.dumps(curr_question), ex=120)
    my_redis.incr(str(event.get_user_id()) + "total", 1)

    await trails_quiz.send(msg, at_sender=True)
    if "Audio" in curr_question["question"]["t"]:
        title = await get_audio_title(bot, event)
        msg = MessageSegment(
            "music",
            {
                "type": "custom",
                "subtype": "163",
                "url": "https://trails-game.com",
                "audio": curr_question["audioLink"],
                "title": title,
                "content": "",
                "image": "https://cdn.trails-game.com/wp-content/uploads/2021/01/cup-2021-108x108-1.png",
            },
        )
        await trails_quiz.send(msg, at_sender=True)

def check_correctness_with_multi_ans(curr_question, result):
    correct = True
    for r in result:
        if not(int(r) in curr_question["ans"]):
            correct = False
            break
    return correct

@trails_quiz.receive()
async def ans_handle(bot: Bot, event: Event):
    curr_question = my_redis.get(str(event.get_user_id()) + "curr_question")
    if curr_question == None:
        await trails_quiz.finish("题目已过期", at_sender=True)
        return
    
    curr_question = json.loads(curr_question)
    
    userReply = str(event.get_message())

    try:
        # single answer
        result = int(userReply)
    except:
        try:
            # multiple answer
            result = str(userReply).strip().split()
            for r in result:
                r = int(r)
        except:
            await trails_quiz.reject()
            return 
    
    my_redis.delete(str(event.get_user_id()) + "curr_question")

    if "MC" in curr_question["question"]["t"] and "MultiAns" in curr_question["question"]["t"]:
        if len(result) != len(curr_question["ans"]):
            await trails_quiz.finish("回答错误。" + curr_question["explain2"], at_sender=True)
        elif not check_correctness_with_multi_ans(curr_question, result):
            await trails_quiz.finish("回答错误。" + curr_question["explain2"], at_sender=True)
        else:
            my_redis.incr(str(event.get_user_id()) + "correct", 1)
            await trails_quiz.finish("回答正确。" + curr_question["explain"], at_sender=True)
    elif "MC" in curr_question["question"]["t"]:
        if int(result) in curr_question["ans"]:
            my_redis.incr(str(event.get_user_id()) + "correct", 1)
            await trails_quiz.finish("回答正确。" + curr_question["explain"], at_sender=True)
        else:
            await trails_quiz.finish("回答错误。" + curr_question["explain2"], at_sender=True)

@trails_quiz_result.handle()
async def trails_quiz_result_handler(bot: Bot, event: Event):
    if my_redis.get(str(event.get_user_id()) + "total") is None:
            await trails_quiz_result.send("你没有回答过问题", at_sender=True)
    else:
        total_count = int(my_redis.get(str(event.get_user_id()) + "total"))
        correct_count = int(my_redis.get(str(event.get_user_id()) + "correct")) if my_redis.get(str(event.get_user_id()) + "correct") is not None else 0
        ratio = round(correct_count / total_count * 100)
        msg = "\n答题总数: {0}\n正确回答: {1}\n正确率: {2}%".format(total_count, correct_count, ratio)
        await trails_quiz_result.send(msg, at_sender=True)
    return