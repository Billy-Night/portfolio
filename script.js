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

//~ Tabbed Component
//* Tabbed Component
const tabs = document.querySelectorAll(".offers__tab");
const tabsContainer = document.querySelector(".offers__tab-container");
const tabsContent = document.querySelectorAll(".offers__content");

//* Event delegations
tabsContainer.addEventListener("click", function (e) {
  const clicked = e.target.closest(".offers__tab");
  console.log(clicked);
  //* Guard clause, if return gets executed no code will run after
  if (!clicked) return;

  //* Remove active classes
  tabs.forEach((t) => t.classList.remove("offers__tab--active"));
  tabsContent.forEach((c) => c.classList.remove("offers__content--active"));
  clicked.classList.add("offers__tab--active");

  //* Activate content area
  console.log(clicked.dataset.tab);
  document
    .querySelector(`.offers__content--${clicked.dataset.tab}`)
    .classList.add("offers__content--active");
});
