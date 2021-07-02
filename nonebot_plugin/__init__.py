import time
import datetime
import redis
from nonebot import on_command
from nonebot.adapters.cqhttp import Bot, Event
from .data_source import draw_quiz_question

redis = redis.Redis(host='localhost', port=6379, db=0)

trails_quiz = on_command(".kquiz", aliases={".trailsquiz", ".tQuiz", ".trailsQuiz"})
trails_quiz_result = on_command(".kquiz分")
user_question_dict = {}

@trails_quiz.handle()
async def trails_quiz_handler(bot: Bot, event: Event):
    today = datetime.datetime.today()
    daycount = 0
    if redis.get(today + str(event.get_user_id())) is None:
        tomorrow = today + datetime.timedelta(days=1)
        reset_time = datetime.datetime(year=tomorrow.year, month=tomorrow.month, day=tomorrow.day, hour=12)
        ttl = (reset_time - datetime.datetime.now()).total_seconds()
        redis.set(today + str(event.get_user_id()), 1, ex=ttl, keepttl=True)
    else:
        daycount = redis.get(today + str(event.get_user_id()))
        redis.incr(today + str(event.get_user_id()), 1)

    if daycount >= 5:
        await trails_quiz.finish("今日答题次数已满，明天0时重置答题次数，可使用 .kquiz分 查看今日quiz结果。请期待网站正式版quiz上线，不限次数。", at_sender=True)
        return

    curr_question, msg = draw_quiz_question()
    user_question_dict[str(event.get_user_id()) + "question"] = curr_question
    redis.incr(str(event.get_user_id()) + "total", 1)

    await trails_quiz.send(msg, at_sender=True)

def check_correctness_with_multi_ans(curr_question, result):
    correct = True
    for r in result:
        if not(int(r) in curr_question["ans"]):
            correct = False
            break
    return correct

def check_timestamp():
    curr_time = time.time
    for user in user_question_dict.keys():
        if curr_time - user_question_dict[user]["timestamp"] > 600:
            user_question_dict.pop(user)

@trails_quiz.receive()
async def ans_handle(bot: Bot, event: Event):
    curr_question = user_question_dict[str(event.get_user_id()) + "question"]
    if curr_question == None:
        await trails_quiz.finish("目前没有题目", at_sender=True)
        return
    
    userReply = str(event.get_message())
    user_question_dict.pop(str(event.get_user_id()) + "question")

    # check_timestamp()

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
            return 
    
    if "MC" in curr_question["question"]["t"] and "MultiAns" in curr_question["question"]["t"]:
        if len(result) != len(curr_question["ans"]):
            await trails_quiz.finish("回答错误。" + curr_question["explain"], at_sender=True)
        elif not check_correctness_with_multi_ans(curr_question, result):
            await trails_quiz.finish("回答错误。" + curr_question["explain"], at_sender=True)
        else:
            redis.incr(str(event.get_user_id()) + "correct", 1)
            await trails_quiz.finish("回答正确。" + curr_question["explain"], at_sender=True)
    elif "MC" in curr_question["question"]["t"]:
        if int(result) in curr_question["ans"]:
            redis.incr(str(event.get_user_id()) + "correct", 1)
            await trails_quiz.finish("回答正确。" + curr_question["explain"], at_sender=True)
        else:
            await trails_quiz.finish("回答错误。" + curr_question["explain"], at_sender=True)

@trails_quiz_result.handle()
async def trails_quiz_result_handler(bot: Bot, event: Event):
    if redis.get(str(event.get_user_id()) + "total") is None:
            await trails_quiz_result.send("你没有回答过问题", at_sender=True)
    else:
        total_count = int(redis.get(str(event.get_user_id()) + "total"))
        correct_count = int(redis.get(str(event.get_user_id()) + "correct")) if redis.get(str(event.get_user_id()) + "correct") is not None else 0
        ratio = round(correct_count / total_count * 100)
        await trails_quiz_result.send("你回答了 {0}个问题，其中正确回答了 {1}个问题，正确率为 {2}%".format(total_count, correct_count, ratio), at_sender=True)
    return