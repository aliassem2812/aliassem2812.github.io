AOS.init();

// MOOCs Cards

// MOOCs Cards
const moocs = document.querySelector(".moocs");
const moocscards = [
  {
    title: "WISS University Zürich",
    cardImage: "assets/images/education-page/wiss.png",
  },
];

const showCards = () => {
  let output = "";
  moocscards.forEach(
    ({ title, cardImage }) =>
      (output += `
        <div class="col-6 col-md-3 col-sm-4 column">
            <div class="card mb-3 mx-auto">
               <div class="content">
                    <img src=${cardImage} class="card-img-top content-image">
                </div>
                <div class="card-body">
                    <h6 class="mt-0 py-2 text-center font-weight-bold mooc-title" style="font-size:12px;">${title}</h6>
                </div>
            </div>
        </div>        
      `)
  );
  moocs.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards);
