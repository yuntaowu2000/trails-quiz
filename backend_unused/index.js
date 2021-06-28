const fs = require('fs');

//used on ali cloud function compute

exports.handler = (req, res, context) => {
    let queries = req.queries;
    let numQuestions = queries["qn"];
    let data = fs.readFileSync("out.json");
    data = JSON.parse(data);

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

    res.send(JSON.stringify(result));
}