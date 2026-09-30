const addApplicationBtn = document.getElementById("addApplicationBtn");
const applicationForm = document.getElementById("applicationForm");
const jobForm = document.getElementById("jobForm");

addApplicationBtn.addEventListener("click", function () {
    applicationForm.classList.toggle("hidden");
});

jobForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const company = document.getElementById("company").value;
    const position = document.getElementById("position").value;
    const status = document.getElementById("status").value;
    const date = document.getElementById("date").value;

    console.log("New Application:");
    console.log("Company:", company);
    console.log("Position:", position);
    console.log("Status:", status);
    console.log("Date:", date);

    alert("Application saved!");

    jobForm.reset();
    applicationForm.classList.add("hidden");
});