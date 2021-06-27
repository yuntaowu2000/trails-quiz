import pandas as pd
import json

def run():
    sheet = pd.read_excel("quiz.xlsx", None)
    values = sheet["工作表1"].to_dict(orient="records")
    result = []
    qid = 0
    for v in values:
        curr_question = {}
        curr_question["question"] = {"id": qid, "t": "MCWithTextOnly", "s": v["问题"], "img":""}
        curr_question["a"] = 0
        curr_question["explain"] = v["注释"]
        options = []
        options.append({"oid":0, "s": v["选项A"], "img":""})
        options.append({"oid":1, "s": v["选项B"], "img":""})
        options.append({"oid":2, "s": v["选项C"], "img":""})
        options.append({"oid":3, "s": v["选项D"], "img":""})
        curr_question["options"] = options
        result.append(curr_question)
        qid += 1
    with open("out.json", "w") as f:
        f.write(json.dumps(result, sort_keys=True, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    run()