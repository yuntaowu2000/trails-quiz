const express = require('express');
const fs = require('fs');
const URL = require('url').URL;

// used for server

const app = express();
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}...`));

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
    res.send(result);

});