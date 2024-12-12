"use strict";

//~ Smooth scrolling from intro to project sections

//* First select the elements and store them :
//* The button :
const btnScrollTo = document.querySelector("#btn-learn-more");

//* The section where the viewport will scroll to :
const section1 = document.querySelector(".section-project-container");

//* Then add the event onClick
btnScrollTo.addEventListener("click", function (e) {
  //* The more modern way, only supported in modern browsers
  section1.scrollIntoView({ behavior: "smooth" });
});
