const addApplicationBtn = document.getElementById("addApplicationBtn");
const applicationForm = document.getElementById("applicationForm");
const jobForm = document.getElementById("jobForm");
const applicationsList = document.getElementById("applicationsList");
const totalApplications = document.getElementById("totalApplications");
const appliedApplications = document.getElementById("appliedApplications");
const interviewApplications = document.getElementById("interviewApplications");
const offerApplications = document.getElementById("offerApplications");
const rejectedApplications = document.getElementById("rejectedApplications");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

// Save and load applications from the browser's localStorage
function saveApplications() {
    localStorage.setItem("applications", JSON.stringify(applications));
}

function loadApplications() {
    try {
        return JSON.parse(localStorage.getItem("applications")) || [];
    } catch (error) {
        return [];
    }
}

let applications = loadApplications();
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
    saveApplications();
    displayApplications();

    jobForm.reset();
    applicationForm.classList.add("hidden");
});

// Display applications
function displayApplications() {
    applicationsList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    const filteredApplications = applications
        .map(function (application, index) {
            return {
                application: application,
                index: index
            };
        })
        .filter(function (item) {
            const application = item.application;

            const matchesSearch =
                application.company.toLowerCase().includes(searchText) ||
                application.position.toLowerCase().includes(searchText);

            const matchesStatus =
                selectedStatus === "all" ||
                application.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

    filteredApplications.forEach(function (item) {
        const application = item.application;
        const originalIndex = item.index;

        const applicationCard = document.createElement("div");

        applicationCard.classList.add("application-card");

        applicationCard.innerHTML = `
            <h3>${application.company}</h3>
            <p><strong>Position:</strong> ${application.position}</p>
            <p><strong>Status:</strong> ${application.status}</p>
            <p><strong>Date:</strong> ${application.date}</p>

            <button onclick="editApplication(${originalIndex})">
                Edit
            </button>

            <button onclick="deleteApplication(${originalIndex})">
                Delete
            </button>
        `;

        applicationsList.appendChild(applicationCard);
    });

        if (filteredApplications.length === 0) {
        applicationsList.innerHTML = "<p>No applications found.</p>";
    }

    updateStats();
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
    saveApplications();

    displayApplications();
    
}

// Search applications
searchInput.addEventListener("input", function () {
    displayApplications();
});

// Filter applications by status
statusFilter.addEventListener("change", function () {
    displayApplications();
});

// Update dashboard statistics (counts ALL applications, not filtered ones)
function updateStats() {
    const counts = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };

    applications.forEach(function (application) {
        if (counts[application.status] !== undefined) {
            counts[application.status]++;
        }
    });

    totalApplications.textContent = applications.length;
    appliedApplications.textContent = counts.Applied;
    interviewApplications.textContent = counts.Interview;
    offerApplications.textContent = counts.Offer;
    rejectedApplications.textContent = counts.Rejected;
}

// Show saved applications when the page loads
displayApplications();