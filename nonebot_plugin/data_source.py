import os
import random
import nonebot
import json
import time
from nonebot.adapters.cqhttp import MessageSegment

driver: nonebot.Driver = nonebot.get_driver()
cachepath = "/home/ubuntu/ELF_RSS/src/plugins/Quiz/"
config: dict

def draw_quiz_question():
    with open(os.path.join(cachepath, "quiz.json"), "r", encoding="utf-8") as f:
        questions = json.loads(f.read())
        f.close()

    curr_question = questions[random.randint(0, len(questions) - 1)]
    while not "MC" in curr_question["question"]["t"]:
        curr_question = questions[random.randint(0, len(questions) - 1)]
    msg = ""
    if "MC" in curr_question["question"]["t"] and "MultiAns" in curr_question["question"]["t"]:
        msg += "多选题（选项使用空格隔开）： "
    elif "MC" in curr_question["question"]["t"]:
        msg += "单选题： "
    msg += curr_question["question"]["s"] + "\n"

    if "https://" in curr_question["question"]["img"]:
        msg += MessageSegment.image(file=curr_question["question"]["img"]) + "\n"

    ans = []
    options = curr_question["options"]
    random.shuffle(options)
    i = 1
    for option in options:
        if (type(curr_question["a"]) == int and option["oid"] == curr_question["a"]):
            ans.append(i)
        elif (type(curr_question["a"]) == list and option["oid"] in curr_question["a"]):
            ans.append(i)
        msg += "{0}. {1} \n".format(i, option["s"])
        if "https://" in option["img"]:
            msg += MessageSegment.image(file=option["img"]) + "\n"
        i += 1
    curr_question["ans"] = ans
    curr_question["timestamp"] = int(time.time())
    return curr_question, msg
    
