let url="https://api.trails-game.com/"
let data = [];

let shuffle = (f) => f.sort(() => Math.random() - 0.5);
let questionNum = 5;
let correctCount = 0;

let quizWrap = document.getElementById("quizWrap");
let submitButton = document.getElementById("submitButton");
let actualQuestions = [];
let userAns = [];

class Question {
  constructor(data, i) {
    this.currentQuestion = data;
    this.i = i;
  }

  showQuestion() {
    let qdiv = document.createElement("div");
    qdiv.className = "question";
    quizWrap.appendChild(qdiv);

    let question = document.createElement("div")
    question.className = "trailsQuizQn";
    question.id = "trailsQuizQn" + this.i;
    question.innerHTML = "#" + (this.i + 1) + ". " + this.currentQuestion.question.s;
    qdiv.appendChild(question);

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
    } else {
        if (userAns[this.i] != -1) {
            document.getElementById(selectedid).className = "trailsQuizAnsWrong";
        }
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
    } else {
        if (userAns[this.i] != -1) {
            document.getElementById(selectedid).className = "trailsQuizAnsWrong";
        }
    }
  }
}

function removeChoiceListeners() {
  for (let i = 0; i < data.length; i++) {
    for (let a = 0; a < data[i].options.length; a++) {
      let id = "q" + i + "a" + data[i].options[a].oid;
      let currElem = document.getElementById(id);
      currElem.className = "unselectedAnswer";
      currElem.replaceWith(currElem.cloneNode(true));
    }
  }
}

function showExplanationAndResult() {
  let qs = document.getElementsByClassName("question");
  for (let i = 0; i < data.length; i++) {
    let explaindiv = document.createElement("div");
      explaindiv.innerHTML = data[i].explain;
      explaindiv.className = "trailsQuizExplain";
      qs[i].appendChild(explaindiv);
  }

  let result = document.createElement("div");
  result.innerHTML = "You got " + correctCount + " correct out of 5";
  result.className = "trailsQuizExplain";
  quizWrap.appendChild(result);
}

function submit() {

  removeChoiceListeners();

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
      default:
        // do nothing to show error
        break;
    }
  }
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