const addApplicationBtn = document.getElementById("addApplicationBtn");
const applicationForm = document.getElementById("applicationForm");
const jobForm = document.getElementById("jobForm");
const applicationsList = document.getElementById("applicationsList");
const totalApplications = document.getElementById("totalApplications");

let applications = [];
let editingIndex = null;

// Show/hide application form
addApplicationBtn.addEventListener("click", function () {
    applicationForm.classList.toggle("hidden");
});

// Submit application form
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

    // Edit existing application
    if (editingIndex !== null) {
        applications[editingIndex] = application;
        editingIndex = null;
    } else {
        // Add new application
        applications.push(application);
    }

    displayApplications();

    jobForm.reset();
    applicationForm.classList.add("hidden");
});

// Display applications
function displayApplications() {
    applicationsList.innerHTML = "";

    applications.forEach(function (application, index) {
        const applicationCard = document.createElement("div");

        applicationCard.classList.add("application-card");

        applicationCard.innerHTML = `
            <h3>${application.company}</h3>
            <p><strong>Position:</strong> ${application.position}</p>
            <p><strong>Status:</strong> ${application.status}</p>
            <p><strong>Date:</strong> ${application.date}</p>

            <button onclick="editApplication(${index})">Edit</button>
            <button onclick="deleteApplication(${index})">Delete</button>
        `;

        applicationsList.appendChild(applicationCard);
    });

    totalApplications.textContent = applications.length;
}

// Edit application
function editApplication(index) {
    const application = applications[index];

    document.getElementById("company").value = application.company;
    document.getElementById("position").value = application.position;
    document.getElementById("status").value = application.status;
    document.getElementById("date").value = application.date;

    editingIndex = index;

    applicationForm.classList.remove("hidden");
}

// Delete application
function deleteApplication(index) {
    applications.splice(index, 1);

    displayApplications();
}