const addApplicationBtn = document.getElementById("addApplicationBtn");
const applicationForm = document.getElementById("applicationForm");
const jobForm = document.getElementById("jobForm");
const applicationsList = document.getElementById("applicationsList");
const totalApplications = document.getElementById("totalApplications");

let applications = [];

addApplicationBtn.addEventListener("click", function () {
    applicationForm.classList.toggle("hidden");
});

jobForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const company = document.getElementById("company").value;
    const position = document.getElementById("position").value;
    const status = document.getElementById("status").value;
    const date = document.getElementById("date").value;

    const application = {
        company: company,
        position: position,
        status: status,
        date: date
    };

    applications.push(application);

    displayApplications();

    jobForm.reset();
    applicationForm.classList.add("hidden");
});

function displayApplications() {
    applicationsList.innerHTML = "";

    applications.forEach(function (application) {
        const applicationCard = document.createElement("div");

        applicationCard.classList.add("application-card");

        applicationCard.innerHTML = `
            <h3>${application.company}</h3>
            <p><strong>Position:</strong> ${application.position}</p>
            <p><strong>Status:</strong> ${application.status}</p>
            <p><strong>Date:</strong> ${application.date}</p>
        `;

        applicationsList.appendChild(applicationCard);
    });

    totalApplications.textContent = applications.length;
}