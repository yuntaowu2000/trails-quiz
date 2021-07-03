import pandas as pd
import json

def parse_text_single_choice(result, sheet):
    values = sheet["文字单选"].to_dict(orient="records")
    for v in values:
        if v["题目"] is None or str(v["题目"]).lower() == "nan":
            continue
        curr_question = {}
        curr_question["question"] = {"id": v["ID"], "t": "MCWithTextOnly", "s": str(v["题目"]), "img":""}
        curr_question["a"] = 0
        curr_question["explain"] = str(v["注释"]) if str(v["注释"]).lower() != "nan" else ""
        options = []
        options.append({"oid":0, "s": str(v["选项A"]), "img":""})
        options.append({"oid":1, "s": str(v["选项B"]), "img":""})
        options.append({"oid":2, "s": str(v["选项C"]), "img":""})
        options.append({"oid":3, "s": str(v["选项D"]), "img":""})
        curr_question["options"] = options
        result.append(curr_question)

def parse_text(result, sheet):
    values = sheet["文字问答"].to_dict(orient="records")
    for v in values:
        if v["题目"] is None or str(v["题目"]).lower() == "nan":
            continue
        curr_question = {}
        curr_question["question"] = {"id": v["ID"], "t": "Text", "s": v["题目"], "img":""}
        curr_question["a"] = []
        curr_question["explain"] = str(v["注释"]) if str(v["注释"]).lower() != "nan" else ""
        for key in v.keys():
            if "正确答案" in key and v[key] is not None and str(v[key]).lower() != "nan":
                curr_question["a"].append(str(v[key]).lower())

        result.append(curr_question)

def run():
    sheet = pd.read_excel("C:\\Users\\yunta\\Desktop\\trails-game\\trails-quiz\\backend\\quiz.xlsx", None)
    result = []
    parse_text_single_choice(result, sheet)
    with open("quiz.json", "w") as f:
        f.write(json.dumps(result, sort_keys=True, indent=4, ensure_ascii=False))
    
    parse_text(result, sheet)
    with open("out.json", "w") as f:
        f.write(json.dumps(result, sort_keys=True, indent=4, ensure_ascii=False))

if __name__ == "__main__":
    run()