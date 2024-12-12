"use strict";

//~ Smooth scrolling from intro to project sections

//* Select the elements and store them :
//* Select the button :
const btnScrollTo = document.querySelector("#btn-learn-more");

//* Select the section where the viewport will scroll to :
const section1 = document.querySelector(".section-project-container");

//* Then add the event onClick
btnScrollTo.addEventListener("click", function (e) {
  //* The more modern way, only supported in modern browsers
  section1.scrollIntoView({ behavior: "smooth" });
});
