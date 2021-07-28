import pandas as pd
import json
import requests
import threading

def header_check(text, link, failed_links: dict):
    try:
        result = requests.head(link)
        if result.status_code != 200 and result.status_code != 301:
            failed_links[text] = "{0}, code: {1}".format(link, result.status_code)
    except:
        failed_links[text] = "{0}, invalid link".format(link)

def parse_explanation(v, curr_question):
    curr_question["explain"] = str(v["回答正确时注释"]) if str(v["回答正确时注释"]).lower() != "nan" else ""
    curr_question["explain2"] = str(v["回答错误时注释"]) if str(v["回答错误时注释"]).lower() != "nan" else ""

def parse_question_img(v, curr_question, thread_list, failed_links):
    if "题目图片链接" in v.keys() and str(v["题目图片链接"]).lower() != "nan":
        t = threading.Thread(target=lambda:header_check(str(v["ID"]) + "题目图片", str(v["题目图片链接"]), failed_links))
        t.start()
        thread_list.append(t)
        curr_question["question"]["img"] = str(v["题目图片链接"]) 
    else:
        curr_question["question"]["img"] = ""

def parse_text_single_choice(result, sheet, thread_list, failed_links):
    values = sheet["文字单选"].to_dict(orient="records")
    for v in values:
        if v["题目"] is None or str(v["题目"]).lower() == "nan" or str(v["选项A"]).lower() == "nan":
            continue
        curr_question = {}
        curr_question["question"] = {"id": v["ID"], "t": "MCWithTextOnly", "s": str(v["题目"]), "img":""}

        parse_question_img(v, curr_question, thread_list, failed_links)

        curr_question["a"] = 0
        parse_explanation(v, curr_question)

        options = []
        options.append({"oid":0, "s": str(v["选项A"]), "img":""})
        options.append({"oid":1, "s": str(v["选项B"]), "img":""})
        options.append({"oid":2, "s": str(v["选项C"]), "img":""})
        options.append({"oid":3, "s": str(v["选项D"]), "img":""})
        curr_question["options"] = options
        result.append(curr_question)

def parse_img_single_choice(result, sheet, thread_list, failed_links):
    values = sheet["图片单选"].to_dict(orient="records")
    for v in values:
        if v["题目"] is None or str(v["题目"]).lower() == "nan" or str(v["选项A"]).lower() == "nan":
            continue
        curr_question = {}
        curr_question["question"] = {"id": v["ID"], "t": "MCWithImg", "s": str(v["题目"]), "img":""}
        
        parse_question_img(v, curr_question, thread_list, failed_links)

        curr_question["a"] = 0
        parse_explanation(v, curr_question)

        options = []
        options.append({"oid":0, "s": str(v["选项A"]), "img":str(v["选项A图片链接"])})
        options.append({"oid":1, "s": str(v["选项B"]), "img":str(v["选项B图片链接"])})
        options.append({"oid":2, "s": str(v["选项C"]), "img":str(v["选项C图片链接"])})
        options.append({"oid":3, "s": str(v["选项D"]), "img":str(v["选项D图片链接"])})
        for c in ["选项A", "选项B", "选项C", "选项D"]:
            t = threading.Thread(target=lambda:header_check(str(v["ID"]) + str(v[c]), str(v[c + "图片链接"]), failed_links))
            t.start()
            thread_list.append(t)

        curr_question["options"] = options
        result.append(curr_question)

def parse_text(result, sheet, thread_list, failed_links):
    values = sheet["文字问答"].to_dict(orient="records")
    for v in values:
        if v["题目"] is None or str(v["题目"]).lower() == "nan":
            continue
        curr_question = {}
        curr_question["question"] = {"id": v["ID"], "t": "Text", "s": v["题目"], "img":""}
        
        parse_question_img(v, curr_question, thread_list, failed_links)
        
        curr_question["a"] = []
        parse_explanation(v, curr_question)

        for key in v.keys():
            if "正确答案" in key and v[key] is not None and str(v[key]).lower() != "nan":
                curr_question["a"].append(str(v[key]).lower())

        result.append(curr_question)

def parse_audio(result, sheet, thread_list, failed_links):
    values = sheet["音频单选"].to_dict(orient="records")
    for v in values:
        if v["题目"] is None or str(v["题目"]).lower() == "nan" or v["题目音频链接"] is None or str(v["题目音频链接"]).lower() == "nan" or str(v["选项A"]).lower() == "nan":
            continue
        curr_question = {}
        curr_question["question"] = {"id": v["ID"], "t": "MCWithAudio", "s": v["题目"], "img":""}

        parse_question_img(v, curr_question, thread_list, failed_links)
        
        t = threading.Thread(target=lambda:header_check(str(v["ID"]) + "题目音频链接", str(v["题目音频链接"]), failed_links))
        t.start()
        thread_list.append(t)
        curr_question["audioLink"] = str(v["题目音频链接"])

        curr_question["a"] = 0
        parse_explanation(v, curr_question)

        options = []
        options.append({"oid":0, "s": str(v["选项A"]), "img":""})
        options.append({"oid":1, "s": str(v["选项B"]), "img":""})
        options.append({"oid":2, "s": str(v["选项C"]), "img":""})
        options.append({"oid":3, "s": str(v["选项D"]), "img":""})
        curr_question["options"] = options
        result.append(curr_question)

def run():
    sheet = pd.read_excel("C:\\Users\\yunta\\Desktop\\trails-game\\trails-quiz\\backend\\quiz.xlsx", None)
    result = []
    thread_list = []
    failed_links = {}

    parse_text_single_choice(result, sheet, thread_list, failed_links)
    parse_img_single_choice(result, sheet, thread_list, failed_links)
    parse_audio(result, sheet, thread_list, failed_links)

    for t in thread_list:
        t.join()

    if len(failed_links) > 0:
        raise ValueError("failed. failed_links: {0}".format(failed_links))

    with open("quiz.json", "w") as f:
        f.write(json.dumps(result, sort_keys=True, indent=4, ensure_ascii=False))
    
    parse_text(result, sheet, thread_list, failed_links)
    with open("out.json", "w") as f:
        f.write(json.dumps(result, sort_keys=True, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    run()