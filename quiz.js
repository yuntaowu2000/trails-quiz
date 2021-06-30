const url="https://api.trails-game.com/"
let data = [];

const shuffle = (f) => f.sort(() => Math.random() - 0.5);
const questionNum = 5;
const timeAllowed = 600;

let timeLeftInSecond = timeAllowed;
const timer = document.getElementById("timer");
function countdown() {
  timeLeftInSecond--;
  let mins = Math.floor(timeLeftInSecond / 60);
  let secs = Math.floor(timeLeftInSecond % 60);

  timer.innerHTML = mins + ":" + secs;
  
  if (timeLeftInSecond <= 0) {
    timer.innerHTML = "Time is up";
    submit();
  }
}
let counter = 0; // setInterval returns a number (ID)

let correctCount = 0;

const quizWrap = document.getElementById("quizWrap");
const submitButton = document.getElementById("submitButton");
let actualQuestions = [];
let userAns = [];
let userResult = [];
let qStats = [];

class Question {
  constructor(data, i) {
    this.currentQuestion = data;
    this.i = i;
  }

  showQuestion() {
    let qdiv = document.createElement("div");
    qdiv.className = "question";
    quizWrap.appendChild(qdiv);

    //create a container for question so that padding can be added.
    let container = document.createElement("div");
    container.className = "qnContainer";
    qdiv.append(container);

    let qnumber = document.createElement("div");
    qnumber.className = "quizNumber";
    qnumber.innerHTML = "第" + (this.i + 1) + "题";

    let question = document.createElement("div");
    question.className = "trailsQuizQn";
    question.id = "trailsQuizQn" + this.i;
    question.innerHTML = this.currentQuestion.question.s;
    question.appendChild(qnumber); 
    container.appendChild(question);

    this.qdiv = qdiv;
    if (this.currentQuestion.question.img.startsWith("https://")) {
      // the current question contains an img for the question
      let qimg = document.createElement("div");
      qimg.className = "trailsQuizQnImg";
      qimg.id = "trailsQuizQnImg" + this.i;
      let imgBlock = document.createElement("img");
      imgBlock.src = this.currentQuestion.question.img;
      qimg.appendChild(imgBlock);
      qdiv.appendChild(qimg);
    }

    let answers = document.createElement("div");
    answers.className = "trailsQuizAns";
    answers.id = "trailsQuizAns" + this.i;
    qdiv.appendChild(answers);

    this.answers = answers;
  }

  getChoices() {
    return this.currentQuestion.options;
  }

  getCorrectResult() {
    return this.currentQuestion.a;
  }
}

class MCWithTextOnly extends Question {
  show() {
    super.showQuestion();

    // shuffle the choices
    shuffle(this.currentQuestion.options);
    for (let a = 0; a < this.currentQuestion.options.length; a++) {
      
      let label = document.createElement("div");
      
      label.innerHTML = this.currentQuestion.options[a].s;

      label.className = "trailsQuizAnsUnselected";
      label.id = "q" + this.i + "a" + this.currentQuestion.options[a].oid;
      
      // we have to record the lambda function for removal
      label.addEventListener("click", () => this.select(this.currentQuestion.options[a].oid));
      this.answers.appendChild(label);
    }
  }

  select(a) {
    if (userAns[this.i] != -1) {
      let prevSelectedId = "q" + this.i + "a" + userAns[this.i];
      document.getElementById(prevSelectedId).className = "trailsQuizAnsUnselected";
    }
    console.log("selected " + a + "for q " + this.i);
    // select the new selection
    let selectedId = "q" + this.i + "a" + a;
    userAns[this.i] = a;
    document.getElementById(selectedId).className = "trailsQuizAnsSelected";
  }

  checkAns() {
    let selectedid = "q" + this.i + "a" + userAns[this.i];
    if (userAns[this.i] == this.getCorrectResult()) {
        document.getElementById(selectedid).className = "trailsQuizAnsCorrect";
        correctCount += 1;
        userResult.push({"qid": this.currentQuestion.question.id, "result" : "c"});
    } else {
        if (userAns[this.i] != -1) {
            document.getElementById(selectedid).className = "trailsQuizAnsWrong";
        }
        userResult.push({"qid": this.currentQuestion.question.id, "result" : "w"});
    }
  }
}

class MCWithImg extends Question {
  show() {
    super.showQuestion();

    // shuffle the choices
    shuffle(this.currentQuestion.options);
    for (let a = 0; a < this.currentQuestion.options.length; a++) {
      
      let label = document.createElement("div");

      // the current choice contains an image
      let img = document.createElement("img");
      img.src = this.currentQuestion.options[a].img;
      label.appendChild(img);

      let wordDes = document.createElement("div");
      wordDes.innerHTML = this.currentQuestion.options[a].s;
      label.appendChild(wordDes);
      
      label.className = "trailsQuizAnsUnselected";
      label.id = "q" + this.i + "a" + this.currentQuestion.options[a].oid;
      
      label.addEventListener("click", () => this.select(this.currentQuestion.options[a].oid));
      this.answers.appendChild(label);
    }
  }

  select(a) {
    if (userAns[this.i] != -1) {
      let prevSelectedId = "q" + this.i + "a" + userAns[this.i];
      document.getElementById(prevSelectedId).className = "trailsQuizAnsUnselected";
    }
    console.log("selected " + a + "for q " + this.i);
    // select the new selection
    let selectedId = "q" + this.i + "a" + a;
    userAns[this.i] = a;
    document.getElementById(selectedId).className = "trailsQuizAnsSelected";
  }

  checkAns() {
    let selectedid = "q" + this.i + "a" + userAns[this.i];
    if (userAns[this.i] == this.getCorrectResult()) {
        document.getElementById(selectedid).className = "trailsQuizAnsCorrect";
        correctCount += 1;
        userResult.push({"qid": this.currentQuestion.question.id, "result" : "c"});
    } else {
        if (userAns[this.i] != -1) {
            document.getElementById(selectedid).className = "trailsQuizAnsWrong";
        }
        userResult.push({"qid": this.currentQuestion.question.id, "result" : "w"});
    }
  }
}

class MCWithTextOnlyMultiAns extends MCWithTextOnly{
  select(a) {
    let selectedId = "q" + this.i + "a" + a;
    if (userAns[this.i].indexOf(a) == -1) {
      // user has not selected this option before
      userAns[this.i].push(a);
      document.getElementById(selectedId).className = "trailsQuizAnsSelected";
    } else {
      // remove the selection
      userAns[this.i] = userAns[this.i].filter(data => data !== a);
      document.getElementById(selectedId).className = "trailsQuizAnsUnselected";
    }
    console.log(userAns[this.i]);
  }

  checkAns() {
    let correct = true;
    for (let j = 0; j < userAns[this.i].length; j++) {
      let selectedId = "q" + this.i + "a" + userAns[this.i][j];
      if (this.currentQuestion.a.indexOf(userAns[this.i][j]) == -1) {
        // user choice is not a correct answer
        correct = false;
        document.getElementById(selectedId).className = "trailsQuizAnsWrong";
      } else {
        document.getElementById(selectedId).className = "trailsQuizAnsCorrect";
      }
    }

    if (userAns[this.i].length < this.currentQuestion.a.length) {
      correct = false;
      let missAns = document.createElement("div");
      missAns.innerHTML = "Missing options";
      missAns.className = "trailsQuizExplain";
      this.qdiv.appendChild(missAns);
    }

    if (correct == true) {
      userResult.push({"qid": this.currentQuestion.question.id, "result" : "c"});
      correctCount++;
    } else {
      userResult.push({"qid": this.currentQuestion.question.id, "result" : "w"});
    }
  }
}

class MCWithImgMultiAns extends MCWithImg{
  select(a) {
    let selectedId = "q" + this.i + "a" + a;
    if (userAns[this.i].indexOf(a) == -1) {
      // user has not selected this option before
      userAns[this.i].push(a);
      document.getElementById(selectedId).className = "trailsQuizAnsSelected";
    } else {
      // remove the selection
      userAns[this.i] = userAns[this.i].filter(data => data !== a);
      document.getElementById(selectedId).className = "trailsQuizAnsUnselected";
    }
    console.log(userAns[this.i]);
  }

  checkAns() {
    let correct = true;
    for (let j = 0; j < userAns[this.i].length; j++) {
      let selectedId = "q" + this.i + "a" + userAns[this.i][j];
      if (this.currentQuestion.a.indexOf(userAns[this.i][j]) == -1) {
        // user choice is not a correct answer
        correct = false;
        document.getElementById(selectedId).className = "trailsQuizAnsWrong";
      } else {
        document.getElementById(selectedId).className = "trailsQuizAnsCorrect";
      }
    }

    if (userAns[this.i].length < this.currentQuestion.a.length) {
      correct = false;
      let missAns = document.createElement("div");
      missAns.innerHTML = "Missing options";
      missAns.className = "trailsQuizExplain";
      this.qdiv.appendChild(missAns);
    }

    if (correct == true) {
      userResult.push({"qid": this.currentQuestion.question.id, "result" : "c"});
      correctCount++;
    } else {
      userResult.push({"qid": this.currentQuestion.question.id, "result" : "w"});
    }
  }
}

class TextQuestion extends Question {
  show() {
    super.showQuestion();
    let inputField = document.createElement("input");
    inputField.type = "text";
    inputField.id = "q" + this.i + "input";
    inputField.value = "";
    inputField.addEventListener('change', () => this.updateAns(this.i));
    this.inputField = inputField;
    this.answers.appendChild(inputField);
  }

  updateAns(i) {
    userAns[i] = this.inputField.value;
    console.log(userAns[i]);
  }

  checkAns() {
    if (userAns[this.i] == this.currentQuestion.a) {
      this.answers.className = "trailsQuizAnsCorrect";
      userResult.push({"qid": this.currentQuestion.question.id, "result" : "c"});
      correctCount++;
    } else if (typeof this.currentQuestion.a === 'object'
        && this.currentQuestion.a.indexOf(userAns[this.i].toLowerCase()) !== -1) {
      this.answers.className = "trailsQuizAnsCorrect";
      userResult.push({"qid": this.currentQuestion.question.id, "result" : "c"});
      correctCount++;
    } else {
      this.answers.className = "trailsQuizAnsCorrect";
      userResult.push({"qid": this.currentQuestion.question.id, "result" : "w"});
    }
  }
}

function removeInputListeners() {
  for (let i = 0; i < data.length; i++) {
    if (data[i].question.t != "Text") {
      for (let a = 0; a < data[i].options.length; a++) {
        let id = "q" + i + "a" + data[i].options[a].oid;
        let currElem = document.getElementById(id);
        currElem.className = "unselectedAnswer";
        currElem.replaceWith(currElem.cloneNode(true));
      }
    } else {
      let id = "q" + i + "input";
      document.getElementById(id).disabled = true;
    }
  }
}

async function showExplanationAndResult() {
  console.log("user result: " + JSON.stringify(userResult));
  let qstatsdata = await fetch(url + "quiz-stats?userResult=" + JSON.stringify(userResult));
  qStats = await qstatsdata.json();
  console.log(qStats);

  let qs = document.getElementsByClassName("question");
  for (let i = 0; i < data.length; i++) {
    let explaindiv = document.createElement("div");
    explaindiv.innerHTML = data[i].explain;
    explaindiv.className = "trailsQuizExplain";
    qs[i].appendChild(explaindiv);

    let qStatsdiv = document.createElement("div");
    qStatsdiv.innerHTML = qStats[i] + "% people got right on this question";
    qStatsdiv.className = "trailsQuizExplain";
    qs[i].appendChild(qStatsdiv);
  }

  let result = document.createElement("div");
  result.innerHTML = "<p>You got " + correctCount + " correct out of 5</p>" + "<p>You have beaten "+ qStats[qStats.length - 1] + "% of the quiz takers</p>";
  result.className = "trailsQuizExplain";
  quizWrap.appendChild(result);
}

function submit() {

  removeInputListeners();
  clearInterval(counter);

  // check if the user got all the correct result
  for (let i = 0; i < data.length; i++) {
      actualQuestions[i].checkAns();
  }

  showExplanationAndResult();

  submitButton.removeEventListener("click", submit);
  submitButton.addEventListener("click", start);
  submitButton.innerHTML = "Retry";
}

function setupPage() {
  correctCount = 0;
  userAns = [];
  userResult = [];
  qStats = [];
  quizWrap.querySelectorAll('*').forEach(n => n.remove());

  shuffle(data);
  for (let i = 0; i < data.length; i++) {
    switch (data[i].question.t) {
      case "MCWithTextOnly":
        let newMCTextq = new MCWithTextOnly(data[i], i);
        newMCTextq.show();
        actualQuestions.push(newMCTextq);
        userAns.push(-1);

        break;
      case "MCWithImg":
        let newMCImgq = new MCWithImg(data[i], i);
        newMCImgq.show();
        actualQuestions.push(newMCImgq);
        userAns.push(-1);

        break;
      case "MCWithTextOnlyMultiAns":
        let newMCTMA = new MCWithTextOnlyMultiAns(data[i], i);
        newMCTMA.show();
        actualQuestions.push(newMCTMA);
        userAns.push([]);

        break;
      case "MCWithImgMultiAns":
        let newMCIMA = new MCWithImgMultiAns(data[i], i);
        newMCIMA.show();
        actualQuestions.push(newMCIMA);
        userAns.push([]);

        break;
      case "Text":
        let newText = new TextQuestion(data[i], i);
        newText.show();
        actualQuestions.push(newText);
        userAns.push("");

        break;
      default:
        // do nothing to show error
        break;
    }
  }
  let elementorDiv = document.getElementsByClassName("elementor-section-height-full");
  for (let e of elementorDiv) {
    e.style.height = "100%";
  }

  //set up counter
  timeLeftInSecond = timeAllowed;
  counter = setInterval(countdown, 1000);

  submitButton.innerHTML = "Submit";
  submitButton.removeEventListener("click", start);
  submitButton.addEventListener("click", submit);
}


async function start() {
  let result = await fetch(url + "quiz-questions?qn=" + questionNum);
  console.log(result);
  data = await result.json();
  setupPage();
}

submitButton.addEventListener("click", start);