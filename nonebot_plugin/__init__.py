from nonebot import on_command
from nonebot.adapters.cqhttp import Bot, Event
from .data_source import draw_quiz_question

trails_quiz = on_command(".kquiz", aliases={"trailsquiz", "tQuiz", "trailsQuiz"})
user_question_dict = {}

@trails_quiz.handle()
async def trails_quiz_handler(bot: Bot, event: Event):
    curr_question, msg = draw_quiz_question()
    user_question_dict[str(event.get_user_id()) + "question"] = curr_question
    await trails_quiz.send(msg, at_sender=True)

def checkCorrectness(curr_question, result):
    correct = True
    for r in result:
        if not(int(r) in curr_question["ans"]):
            correct = False
            break
    return correct

@trails_quiz.receive()
async def ans_handle(bot: Bot, event: Event):
    curr_question = user_question_dict[str(event.get_user_id()) + "question"]
    if curr_question == None:
        await trails_quiz.finish("目前没有题目", at_sender=True)
        return
    
    userReply = str(event.get_message())
    user_question_dict.pop(str(event.get_user_id()) + "question")

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
        elif not checkCorrectness(curr_question, result):
            await trails_quiz.finish("回答错误。" + curr_question["explain"], at_sender=True)
        else:
            await trails_quiz.finish("回答正确。" + curr_question["explain"], at_sender=True)
    elif "MC" in curr_question["question"]["t"]:
        if int(result) in curr_question["ans"]:
            await trails_quiz.finish("回答正确。" + curr_question["explain"], at_sender=True)
        else:
            await trails_quiz.finish("回答错误。" + curr_question["explain"], at_sender=True)



