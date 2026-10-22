AOS.init();
/* Project Cards */

const projectcards = document.querySelector(".projectcards");

// Array of object for projects
const projects = [
  {
    title: "Grenzlager GmbH<br><span style='font-size:15px;'>Warehouse Management Web Application</span><br><br><span style='font-size:13px;'>Developed a web application for Grenzlager GmbH, a package reception service near the Swiss border. The system is now in use by the company to manage customer parcels, notifications, and collections. Extended it with automated reminders and storage fee management through email and WhatsApp. <b>Project value: five figures (CHF).</b></span>",
    cardImage: "assets/images/project-page/aliboss-web.jpg",
    description: "",
    tagimg: "",
    Previewlink: "https://grenzlager.ch",
    Githublink: "https://github.com/aliassem2812/grenzlager-gmbh",
  },
  {
    title: "IPA Final Project<br><span style='font-size:15px;'>Grenzlager GmbH | Automated Parcel Reminders and Fee Management</span><br><br><span style='font-size:13px;'>Designed and implemented an extension to Grenzlager GmbH’s warehouse management system that sends collection reminders by email and WhatsApp, calculates storage fees, and tracks overdue parcels and notifications. <b>Assessed by cantonal examination experts as part of the Swiss vocational qualification process; passed.</b></span>",
    cardImage: "assets/images/project-page/ali-web.jpg",
    description: "",
    tagimg: "",
    Previewlink: "",
    Githublink: "https://github.com/aliassem2812/grenzlager-ipa",
  },
  {
    title: "AI Guide<br><span style='font-size:15px;'>Personal AI Chat for Recruiters</span><br><br><span style='font-size:13px;'>The AI guide on this website: visitors ask about my experience and projects and get live answers from a language model, built with Node.js and WebSockets (locally with Ollama, online through the Groq API). It only uses facts I have approved, blocks prompt injection and off-topic requests, and checks every answer before it is shown. <b>Answers in English and German.</b></span>",
    cardImage: "assets/images/project-page/ai-chat.svg",
    description: "",
    tagimg: "",
    Previewlink: "",
    Githublink: "https://github.com/aliassem2812/ai-chat",
  },
  {
    title: "Person Manager <br><br><br><br><span style='font-size:14px;'>Java application for managing and displaying personal data. It includes a graphical user interface (GUI) for viewing and editing personal data, navigation between different entries and editing functions.</span>",
    cardImage: "assets/images/project-page/format.png",
    description: "",
    tagimg: "https://cdn.iconscout.com/icon/free/png-512/react-1-282599.png",
    Previewlink: "",
    Githublink: "https://github.com/aliassem2812/Formatierte-Eingaben",
  },
  {
    title: "Chess<br> <br><br><br><span style='font-size:15px;'>A classic Chess-Game implemented in Java.</span>",
    cardImage: "assets/images/project-page/chess.png",
    description: "A classic Chess-Game implemented in Java.",
    tagimg: "https://image.flaticon.com/icons/png/512/643/643350.png",
    Previewlink: "",
    Githublink: "https://github.com/aliassem2812/Chess",
  },
  {
    title: "Flappy Bird<br> <br><br><br><span style='font-size:15px;'>A Flappy Bird game in React involves tapping on the screen to navigate a bird through pipes.</span>",
    cardImage: "assets/images/project-page/flap.png",
    description: "",
    tagimg: "",
    Previewlink: "",
    Githublink: "https://github.com/aliassem2812/flappy-bird",
  },
];

// function for rendering project cards data
const showCards = () => {
  let output = "";
  projects.forEach(({ title, cardImage, Previewlink, Githublink }) => {
    output += `       
        <div class="column skill-card card" style="margin: 15px"data-aos="zoom-in-up" data-aos-easing="linear" data-aos-delay="300" data-aos-duration="600" >
          <div class="wrapper" style="background: url(${cardImage}) center / cover no-repeat;">
            <div class="header">
            </div>
            <div class="data">
              <div class="content">
              <div class="title-div">
                <h1 class="title"><a href="#">${title}</a></h1>
                </div>
            <ul class="menu-content"><br>
                  ${Previewlink ? `<li><a href="${Previewlink}" target="_blank" rel="noopener" class="social-icon" aria-label="Live preview"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 30 28" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-monitor"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg></a></li>` : ""}
                  ${Githublink ? `<li><a href="${Githublink}" target="_blank" rel="noopener" class="social-icon" aria-label="GitHub repository"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 30 28" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-github"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a></li>` : ""}
                </ul>
              </div>
            </div>
          </div>
        </div>`;
  });
  projectcards.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards);

function myFunction() {
  // Declare variables
  var input, button, i, skillcard, card, title;
  input = document.getElementById("myInput").value;
  input = input.toUpperCase();
  skillcard = document.getElementsByClassName("skill-card");
  card = document.getElementsByClassName("card");
  title = document.getElementsByClassName("title");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < button.length; i++) {
    if (
      button[i].innerHTML.toUpperCase().includes(input) ||
      title[i].innerHTML.toUpperCase().includes(input)
    ) {
      skillcard[i].style.display = "";
      card[i].style.display = "";
    } else {
      skillcard[i].style.display = "none";
      card[i].style.display = "none";
    }
  }
}
