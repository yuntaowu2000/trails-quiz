const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const URL = require('url').URL;
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
sqlite3.verbose();

const app = express();
const port = process.env.PORT || 5000;

// const limiter = rateLimit({
//     windowMs: 60 * 1000,
//     max: 1
// });

// app.use(limiter);
app.listen(port, () => console.log(`Listening on port ${port}...`));

// connect to database
let db;
sqlite.open({
    filename: 'quiz-database.db',
    driver: sqlite3.Database
}).then((d)=>{
    db = d;
    console.log(db);
    db.run('CREATE TABLE IF NOT EXISTS singleQuestionData (qid INT PRIMARY KEY, correct INT, wrong INT)');
    db.run('CREATE TABLE IF NOT EXISTS overallUserData (ipTimeStamp TEXT PRIMARY KEY, score INT, userResult TEXT)');
});

let data = fs.readFileSync("out.json");
data = JSON.parse(data);

app.get("/quiz-questions", (req, res) => {
    let url = new URL(req.originalUrl, `http://${req.headers.host}`);
    let numQuestions = url.searchParams.get("qn");

    let result = [];
    let qn = [];
    while (qn.length < numQuestions) {
        let newidx = Math.floor(Math.random() * data.length);
        if (qn.indexOf(newidx) == -1) {
            qn.push(newidx);
        }
    }

    for (let i of qn) {
        result.push(data[i]);
    }

    res.setHeader("Access-Control-Allow-Origin", "https://trails-game.com");
    res.setHeader("content-type", "application/json");
    res.send(result);

});

app.get("/quiz-stats", async (req, res) => {
    let url = new URL(req.originalUrl, `http://${req.headers.host}`);
    let userResultStr = url.searchParams.get("userResult");
    userResult = JSON.parse(userResultStr);

    let totalQ = userResult.length;
    let correctCount = 0;
    let ret = [];
    for (let r of userResult) {
        let qid = r["qid"];
        let result = r["result"];

        const sqlr = await db.get('SELECT correct, wrong FROM singleQuestionData WHERE qid = ?', [qid]);

        let qCorrectCount = 0;
        let qWrongCount = 0;

        if (typeof sqlr !== 'undefined' && sqlr !== null && sqlr.correct != null && sqlr.wrong != null) {
            qCorrectCount = sqlr.correct;
            qWrongCount = sqlr.wrong;
        }
        if (result == "c") {
            correctCount++;
            qCorrectCount++;
        } else {
            qWrongCount++;
        }

        await db.run('INSERT OR REPLACE INTO singleQuestionData(qid, correct, wrong) VALUES (:qid, :correct, :wrong)', {
            ':qid': qid,
            ':correct': qCorrectCount,
            ':wrong': qWrongCount
        });

        ret.push(Math.round(qCorrectCount / (qCorrectCount + qWrongCount) * 100));
    }

    let currIpTimeStamp = req.ip + "-" + new Date().toISOString();
    let score = Math.round(correctCount / totalQ * 100);
    await db.run('INSERT INTO overallUserData(ipTimeStamp, score, userResult) VALUES (:ipTimeStamp, :score, :userResult)', {
        ':ipTimeStamp': currIpTimeStamp,
        ':score': score,
        ':userResult': userResultStr
    });

    let totalUsers = await db.get('SELECT COUNT(*) FROM overallUserData');
    let surpassUsers = await db.get('SELECT COUNT(*) FROM overallUserData WHERE score < ?', [score]);

    ret.push(Math.round(surpassUsers["COUNT(*)"] / totalUsers["COUNT(*)"] * 100));

    res.setHeader("Access-Control-Allow-Origin", "https://trails-game.com");
    res.setHeader("content-type", "application/json");
    res.send(ret);
});