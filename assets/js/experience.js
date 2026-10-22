AOS.init();

//  Work experience cards

const experiencecards = document.querySelector(".experience-cards");
const exp = [
  {
    title: "HTML",
    cardImage: "assets/images/experience-page/css.png  ",
    place: "Zürich",
    time: "(2022-2026)",
    desp: "<li>Streamlined website maintenance by structuring HTML code for easy readability and future scalability .</li> <li>Improved the look and feel of websites by designing attractive and easy-to-use layouts using CSS.</li>",
  },
  {
    title: "C++",
    cardImage: "assets/images/experience-page/cplusplus.png",
    place: "Zürich",
    time: "(2022-2026)",
    desp: "<li>Participated in C++ projects, focusing on understanding the syntax and program structure.</li><li>Implemented object-oriented programming principles in C++ to develop robust and scalable software applications.</li>",
  },
  {
    title: "SQL",
    cardImage: "assets/images/experience-page/data.png",
    place: "Zürich",
    time: "(2022-2026)",
    desp: "<li>Developed efficient SQL scripts to automate data processing tasks, enhancing productivity and accuracy.</li><li>Implemented error handling and transaction control in SQL scripts to maintain data consistency and reliability.</li>",
  },


  
];

const showCards2 = () => {
  let output = "";
  exp.forEach(
    ({ title, cardImage, place, time, desp }) =>
      (output += `        
    <div class="col gaap" data-aos="fade-up" data-aos-easing="linear" data-aos-delay="100" data-aos-duration="400"> 
      <div class="card card1">
        <img src="${cardImage}" class="featured-image"/>
        <article class="card-body">
          <header>
            <div class="title">
              <h3>${title}</h3>
            </div>
            <p class="meta">
              <span class="pre-heading">${place}</span><br>
              <span class="author">${time}</span>
            </p>
            <ol>
              ${desp}
            </ol>
          </header>
        </article>
      </div>
    </div>
      `)
  );
  experiencecards.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards2);

// Volunteership Cards

const volunteership = document.querySelector(".volunteership");
const volunteershipcards = [
  {
    title: "php",
    cardImage: "assets/images/experience-page/php.png",
    description:
      "Expanded my PHP skills by developing dynamic web applications, working with databases, and implementing server-side scripting.",
  },
  {
    title: "Javascript",
    cardImage: "assets/images/experience-page/js.png",
    description:
      "Improved my JavaScript proficiency by creating functional website features and exploring essential topics like events and basic animations.",
  },
  {
    title: "Java",
    cardImage: "assets/images/experience-page/java.png",
    description:
      "Advanced my Java skills by successfully implementing complex data structures and algorithms in various projects.",
  },
  {
    title: "C#",
    cardImage: "assets/images/experience-page/csharp.png",
    description:
      "Started my journey in C# by building basic applications and learning core concepts.",
  },
];

const showCards = () => {
  let output = "";
  volunteershipcards.forEach(
    ({ title, cardImage, description }) =>
      (output += `        
      <div class="card volunteerCard" data-aos="fade-down" data-aos-easing="linear" data-aos-delay="100" data-aos-duration="600" style="height: 550px;width:400px">
      
      <img src="${cardImage}" height="250" width="65" class="card-img" style="border-radius:10px">
      <div class="content">
          <h2 class="volunteerTitle">${title}</h2><br>
          <p class="copy">${description}</p></div>
      
      </div>
      `)
  );
  volunteership.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards);

