let url="https://api.trails-game.com/"
let data = [];

let shuffle = (f) => f.sort(() => Math.random() - 0.5);

let quizWrap = document.getElementById("quizWrap");
let submitButton = document.getElementById("submitButton");
let actualQuestions = [];
let userChoice = [-1, -1, -1, -1, -1];

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
      label.addEventListener("click", () => select(this.i, this.currentQuestion.options[a].oid));
      this.answers.appendChild(label);
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
      
      label.addEventListener("click", () => select(this.i, this.currentQuestion.options[a].oid));
      this.answers.appendChild(label);
    }
  }
}

function select(i, a) {

  // unselect the previous selection if there is one.
  if (userChoice[i] != -1) {
      let prevSelectedId = "q" + i + "a" + userChoice[i];
      document.getElementById(prevSelectedId).className = "trailsQuizAnsUnselected";
  }

  console.log("selected " + a + "for q " + i);
  // select the new selection
  let selectedId = "q" + i + "a" + a;
  userChoice[i] = a;
  document.getElementById(selectedId).className = "trailsQuizAnsSelected";
}

function submit() {

  // remove listeners for all selections
  for (let i = 0; i < data.length; i++) {
    for (let a = 0; a < data[i].options.length; a++) {
      let id = "q" + i + "a" + data[i].options[a].oid;
      let currElem = document.getElementById(id);
      currElem.className = "unselectedAnswer";
      currElem.replaceWith(currElem.cloneNode(true));
    }
  }

  let correctCount = 0;
  let qs = document.getElementsByClassName("question");

  // check if the user got all the correct result
  for (let i = 0; i < userChoice.length; i++) {
      let selectedid = "q" + i + "a" + userChoice[i];
      if (userChoice[i] == actualQuestions[i].getCorrectResult()) {
          document.getElementById(selectedid).className = "trailsQuizAnsCorrect";
          correctCount += 1;
      } else {
          // let correctid = "q" + i + "a" + data2[i].a;
          if (userChoice[i] != -1) {
              document.getElementById(selectedid).className = "trailsQuizAnsWrong";
          }
          // document.getElementById(correctid).className = "trailsQuizAnsCorrect";
      }
      
      let explaindiv = document.createElement("div");
      explaindiv.innerHTML = data[i].explain;
      explaindiv.className = "trailsQuizExplain";
      qs[i].appendChild(explaindiv);
  }

  let result = document.createElement("div");
  result.innerHTML = "You got " + correctCount + " correct out of 5";
  result.className = "trailsQuizExplain";
  quizWrap.appendChild(result);

  submitButton.removeEventListener("click", submit);
  submitButton.addEventListener("click", start);
  submitButton.innerHTML = "retry";
}

function setupPage() {
  for (let i = 0; i < userChoice.length; i++) {
    userChoice[i] = -1;
  }
  quizWrap.querySelectorAll('*').forEach(n => n.remove());

  shuffle(data);
  for (let i = 0; i < data.length; i++) {
    switch (data[i].question.t) {
      case "MCWithTextOnly":
        let newMCTextq = new MCWithTextOnly(data[i], i);
        newMCTextq.show();
        actualQuestions.push(newMCTextq);

        break;
      case "MCWithImg":
        let newMCImgq = new MCWithImg(data[i], i);
        newMCImgq.show();
        actualQuestions.push(newMCImgq);

        break;
      default:
        // do nothing to show error
        break;
    }
  }
  submitButton.innerHTML = "submit";
  submitButton.removeEventListener("click", start);
  submitButton.addEventListener("click", submit);
}

function start() {
  let questionNum = 5;
  fetch(url + "quiz-questions?qn=" + questionNum).then((result) => {
    console.log(result);
    result.json().then((d) => {
      data = d;
      setupPage();
    });
  });
}

start();