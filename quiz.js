let data = [
  {
    question : {
      id: 0,
      t: "MCWithImg",
      s: "创之轨迹SPD最高的角色（250级）？",
      img: "https://cdn.trails-game.com/wp-content/uploads/2020/08/icon_584-150x150.jpg"
    },
    options: [
      {
        oid: 0,
        s: "菲",
        img: "https://cdn.trails-game.com/wp-content/uploads/2020/08/icon_584-150x150.jpg"
      },
      {
        oid: 1,
        s: "杜芭莉",
        img: "https://cdn.trails-game.com/wp-content/uploads/2020/08/icon_595-150x150.jpg"
      },
      {
        oid: 2,
        s: "约修亚",
        img: "https://cdn.trails-game.com/wp-content/uploads/2020/08/icon_607-150x150.jpg"
      },
      {
        oid: 3,
        s: "亚里欧斯",
        img: "https://cdn.trails-game.com/wp-content/uploads/2020/09/iconArios-150x150.jpg"
      }
    ],
    a: 0,
    explain: "菲的SPD为121，其余三位为119或117"
  },
  {
    question : {
      id: 1,
      t: "MCWithTextOnly",
      s: "玛因兹矿山镇在克洛斯贝尔的位置？",
      img: ""
    },
    options : [
      {
        oid: 0,
        s: "西北",
        img: ""
      },
      {
        oid: 1,
        s: "东北",
        img: ""
      },
      {
        oid: 2,
        s: "西南",
        img: ""
      },
      {
        oid: 3,
        s: "东南",
        img: ""
      }
    ],
    a: 0,
    explain: "位于克洛斯贝尔西北部的山岳地带"
  },
  {
    question : {
      id: 2,
      t: "MCWithTextOnly",
      s: "埃雷波尼亚帝国第3机甲师团的指挥官？",
      img: ""
    },
    options : [
      {
        oid: 0,
        s: "赛克斯·范德尔",
        img: ""
      },
      {
        oid: 1,
        s: "瓦特尔",
        img: ""
      },
      {
        oid: 2,
        s: "奥拉夫·克雷格",
        img: ""
      },
      {
        oid: 3,
        s: "鲁道夫·亚兰德尔",
        img: ""
      }
    ],
    a: 0,
    explain: "瓦特尔（5）、奥拉夫·克雷格（4）、鲁道夫·亚兰德尔（前13）"
  },
  {
    question : {
      id: 3,
      t: "MCWithTextOnly",
      s: "「闪之轨迹」主角黎恩姓什么？",
      img: ""
    },
    options : [
      {
        oid: 0,
        s: "舒华泽",
        img: ""
      },
      {
        oid: 1,
        s: "舒华兹",
        img: ""
      },
      {
        oid: 2,
        s: "舒派泽",
        img: ""
      },
      {
        oid: 3,
        s: "舒华塔",
        img: ""
      }
    ],
    a: 0,
    explain: "要是他不是养子，全名就是「黎恩・奥斯本」吧"
  },
  {
    question : {
      id: 4,
      t: "MCWithTextOnly",
      s: "以粉色头发给人留下深刻印象的女孩・悠娜，她的妹妹叫什么？",
      img: ""
    },
    options : [
      {
        oid: 1,
        s: "娜娜",
        img: ""
      },
      {
        oid: 0,
        s: "莉娜",
        img: ""
      },
      {
        oid: 2,
        s: "蕾娜",
        img: ""
      },
      {
        oid: 3,
        s: "肯恩",
        img: ""
      }
    ],
    a: 1,
    explain: "肯恩和娜娜是对天真又有点成熟的可爱双胞胎呢"
  }
];

let quizWrap = document.getElementById("quizWrap");
let submitButton = document.getElementById("submitButton");
let actualQuestions = [];
let userChoice = [-1, -1, -1, -1, -1];
let selectFunctions = [];

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
    this.currentQuestion.options.sort(() => Math.random() - 0.5);
    for (let a = 0; a < this.currentQuestion.options.length; a++) {
      
      let label = document.createElement("div");
      
      label.innerHTML = this.currentQuestion.options[a].s;

      label.className = "trailsQuizAnsUnselected";
      label.id = "q" + this.i + "a" + this.currentQuestion.options[a].oid;
      
      // we have to record the lambda function for removal
      let func = () => select(this.i, this.currentQuestion.options[a].oid);
      selectFunctions.push(func);
      label.addEventListener("click", func);
      this.answers.appendChild(label);
    }
  }
}

class MCWithImg extends Question {
  show() {
    super.showQuestion();
    // shuffle the choices
    this.currentQuestion.options.sort(() => Math.random() - 0.5);
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
      
      // we have to record the lambda function for removal
      let func = () => select(this.i, this.currentQuestion.options[a].oid);
      selectFunctions.push(func);
      label.addEventListener("click", func);
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
  let k = 0;

  // remove listeners for all selections
  for (let i = 0; i < data.length; i++) {
    for (let a = 0; a < data[i].options.length; a++) {
      let id = "q" + i + "a" + data[i].options[a].oid;
      document.getElementById(id).className = "unselectedAnswer";
      document.getElementById(id).removeEventListener("click", selectFunctions[k]);
      k++;
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

function start() {
  selectFunctions = [];
  for (let i = 0; i < userChoice.length; i++) {
    userChoice[i] = -1;
  }
  quizWrap.querySelectorAll('*').forEach(n => n.remove());

  data.sort(() => Math.random() - 0.5);
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

start();