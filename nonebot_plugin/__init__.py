import time
from nonebot import on_command
from nonebot import require
from nonebot.adapters.cqhttp import Bot, Event
from .data_source import draw_quiz_question

trails_quiz = on_command(".kquiz", aliases={".trailsquiz", ".tQuiz", ".trailsQuiz"})
trails_quiz_result = on_command(".kquiz分")
user_question_dict = {}
user_question_count = {}

scheduler = require('nonebot_plugin_apscheduler').scheduler
@scheduler.scheduled_job("cron", hour="0", minute="0", second="0", id="1")
def clear_count():
    print("called")
    user_question_count.clear()

@trails_quiz.handle()
async def trails_quiz_handler(bot: Bot, event: Event):
    if str(event.get_user_id()) in user_question_count.keys() and user_question_count[str(event.get_user_id())]["total"] == 10:
        await trails_quiz.finish("今日答题次数已满，明天0时重置答题次数，可使用 .kquiz分 查看今日quiz结果", at_sender=True)
        return

    curr_question, msg = draw_quiz_question()
    user_question_dict[str(event.get_user_id()) + "question"] = curr_question
    if str(event.get_user_id()) not in user_question_count.keys():
        user_question_count[str(event.get_user_id())] = {"total" : 1, "correct" : 0}
    else:
        user_question_count[str(event.get_user_id())]["total"] += 1
    print(user_question_count)
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
            user_question_count[str(event.get_user_id())]["correct"] += 1
            await trails_quiz.finish("回答正确。" + curr_question["explain"], at_sender=True)
    elif "MC" in curr_question["question"]["t"]:
        if int(result) in curr_question["ans"]:
            user_question_count[str(event.get_user_id())]["correct"] += 1
            await trails_quiz.finish("回答正确。" + curr_question["explain"], at_sender=True)
        else:
            await trails_quiz.finish("回答错误。" + curr_question["explain"], at_sender=True)

@trails_quiz_result.handle()
async def trails_quiz_result_handler(bot: Bot, event: Event):
    if str(event.get_user_id()) not in user_question_count.keys():
            await trails_quiz_result.send("今日你没有回答过问题", at_sender=True)
    else:
        user_result = user_question_count[str(event.get_user_id())]
        await trails_quiz_result.send("今日你回答了 {0}个问题，其中正确回答了 {1}个问题".format(user_result["total"], user_result["correct"]), at_sender=True)
    return