const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const URL = require('url').URL;
const sqlite = require('sqlite');

const app = express();
const port = process.env.PORT || 5000;

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1
});

app.use(limiter);
app.listen(port, () => console.log(`Listening on port ${port}...`));

// connect to database
const db = await open({
    filename: '~/trails-quiz/database.db',
    driver: sqlite.Database
})

try {
    await db.exec('CREATE TABLE IF NOT EXISTS singleQuestionData (qid INT PRIMARY KEY, correct INT, wrong INT)');
    await db.exec('CREATE TABLE IF NOT EXISTS overallUserData (ipTimeStamp VARCHAR(255) PRIMARY KEY, score INT, userResult VARCHAR(255))');
} catch(err) {
    console.log(err);
}

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

    console.log(result);
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

        if (result == "c") {
            correctCount++;
            await db.exec(SQL`INSERT INTO singleQuestionData SET qid=${qid}, correct=1, wrong=0 ON DUPLICATE KEY UPDATE correct=correct+1`);
        } else {
            await db.exec(SQL`INSERT INTO singleQuestionData SET qid=${qid}, correct=0, wrong=1 ON DUPLICATE KEY UPDATE wrong=wrong+1`);
        }

        let correctCount = await db.get(SQL`SELECT correct FROM singleQuestionData WHERE qid=${qid}`);
        let wrongCount = await db.get(SQL`SELECT wrong FROM singleQuestionData WHERE qid=${qid}`);

        ret.push(Math.round(correctCount / (correctCount + wrongCount)));
    }
    let currIpTimeStamp = req.ip + "-" + new Date().toISOString();
    console.log(currIpTimeStamp);
    
    let score = Math.round(correctCount / totalQ);
    await db.exec(SQL`INSERT INTO overallUserData SET ipTimeStamp = ${currIpTimeStamp}, score=${score}, userResult=${userResultStr}`);

    let totalUsers = await db.exec(SQL`SELECT COUNT(*) FROM overallUserData`);
    let surpassUsers = await db.exec(SQL`SELECT COUNT(*) FROM overallUserData WHERE score < ${score}`);

    ret.push(Math.round(surpassUsers / totalUsers));

    console.log(ret);
    res.setHeader("Access-Control-Allow-Origin", "https://trails-game.com");
    res.setHeader("content-type", "application/json");
    res.send(ret);
});