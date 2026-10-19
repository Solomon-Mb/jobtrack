const API_URL = API_BASE + "/api/applications";

const addApplicationBtn = document.getElementById("addApplicationBtn");
const applicationForm = document.getElementById("applicationForm");
const jobForm = document.getElementById("jobForm");
const applicationsList = document.getElementById("applicationsList");

const totalApplications = document.getElementById("totalApplications");
const appliedApplications = document.getElementById("appliedApplications");
const interviewApplications = document.getElementById("interviewApplications");
const offerApplications = document.getElementById("offerApplications");
const rejectedApplications = document.getElementById("rejectedApplications");

const detailsOverlay = document.getElementById("detailsOverlay");
const detailsContent = document.getElementById("detailsContent");
const closeDetailsBtn = document.getElementById("closeDetailsBtn");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const sortSelect = document.getElementById("sortSelect");

let applications = [];
let editingId = null;

// ===== Talking to the backend =====

function jsonOptions(method, data) {
    return {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    };
}

async function request(url, options) {
    const response = await fetch(url, withAuth(options));

    if (response.status === 401) {
        logout("Your session expired. Please log in again.");
        throw new Error("Please log in again");
    }

    if (!response.ok) {
        let message = "Request failed";

        try {
            const data = await response.json();
            message = data.error || message;
        } catch (error) {
            // response had no JSON body
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function loadApplications() {
    try {
        applications = await request(API_URL);
        displayApplications();
    } catch (error) {
        applicationsList.textContent =
            "Could not load applications. Is the backend running?";
    }
}

// ===== Helpers =====

// Stops text typed by the user from being treated as HTML
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function findApplication(id) {
    return applications.find(function (application) {
        return application.id === id;
    });
}

// ===== Form =====

// Clears the form and forgets any edit in progress
function resetForm() {
    jobForm.reset();
    editingId = null;
}

// Show/hide application form. Opening it from this button always starts a new, empty application.
addApplicationBtn.addEventListener("click", function () {
    const wasHidden = applicationForm.classList.contains("hidden");

    resetForm();
    applicationForm.classList.toggle("hidden", !wasHidden);
});

// Submit application form
jobForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const application = {
        company: document.getElementById("company").value,
        position: document.getElementById("position").value,
        status: document.getElementById("status").value,
        date: document.getElementById("date").value,
        interviewDate: document.getElementById("interviewDate").value,
        website: document.getElementById("companyWebsite").value,
        location: document.getElementById("companyLocation").value,
        notes: document.getElementById("notes").value
    };

    try {
        if (editingId !== null) {
            await request(API_URL + "/" + editingId, jsonOptions("PUT", application));
            editingId = null;
        } else {
            await request(API_URL, jsonOptions("POST", application));
        }

        await loadApplications();

        jobForm.reset();
        applicationForm.classList.add("hidden");
    } catch (error) {
        alert(error.message);
    }
});

// ===== Display =====

function displayApplications() {
    applicationsList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    const filteredApplications = applications.filter(function (application) {
        const matchesSearch =
            application.company.toLowerCase().includes(searchText) ||
            application.position.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            application.status === selectedStatus;

            return matchesSearch && matchesStatus;
    });

    const sortOrder = sortSelect.value;

    filteredApplications.sort(function (a, b) {
        if (sortOrder === "company") {
            return a.company.localeCompare(b.company);
        }

        // Dates are YYYY-MM-DD text, so comparing them as text sorts them correctly
        const byDate = a.date.localeCompare(b.date);

        if (sortOrder === "oldest") {
            return byDate || a.id - b.id;
        }

        return -byDate || b.id - a.id;
    });

    filteredApplications.forEach(function (application) {

        const applicationCard = document.createElement("div");

        applicationCard.classList.add("application-card");

        applicationCard.innerHTML = `
            <h3>${escapeHtml(application.company)}</h3>
            <p><strong>Position:</strong> ${escapeHtml(application.position)}</p>
            <p><strong>Status:</strong> ${escapeHtml(application.status)}</p>
            <p><strong>Date:</strong> ${escapeHtml(application.date)}</p>

            <button onclick="viewApplication(${application.id})">
                View Details
            </button>

            <button onclick="editApplication(${application.id})">
                Edit
            </button>

            <button onclick="deleteApplication(${application.id})">
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

// ===== Edit and delete =====

function editApplication(id) {
    const application = findApplication(id);

    if (!application) {
        return;
    }

    document.getElementById("company").value = application.company;
    document.getElementById("position").value = application.position;
    document.getElementById("status").value = application.status;
    document.getElementById("date").value = application.date;
    document.getElementById("interviewDate").value = application.interviewDate || "";
    document.getElementById("companyWebsite").value = application.website || "";
    document.getElementById("companyLocation").value = application.location || "";
    document.getElementById("notes").value = application.notes || "";

    editingId = id;

    applicationForm.classList.remove("hidden");
}

async function deleteApplication(id) {
    const application = findApplication(id);
    const name = application ? application.company : "this application";

    if (!confirm("Delete the application to " + name + "? This cannot be undone.")) {
        return;
    }

    try {
        await request(API_URL + "/" + id, { method: "DELETE" });
        await loadApplications();
    } catch (error) {
        alert(error.message);
    }
}

// ===== Details popup =====

function viewApplication(id) {
    const application = findApplication(id);

    if (!application) {
        return;
    }

    detailsContent.innerHTML = "";

    const rows = [
        ["Company", application.company],
        ["Position", application.position],
        ["Status", application.status],
        ["Applied on", application.date],
        ["Interview date", application.interviewDate || "Not set"],
        ["Website", application.website || "Not provided"],
        ["Location", application.location || "Not provided"],
        ["Notes", application.notes || "No notes"]
    ];

    rows.forEach(function (row) {
        const paragraph = document.createElement("p");
        const label = document.createElement("strong");

        label.textContent = row[0] + ": ";
        paragraph.appendChild(label);
        paragraph.appendChild(document.createTextNode(row[1]));

        detailsContent.appendChild(paragraph);
    });

    detailsOverlay.classList.remove("hidden");
}

function closeDetails() {
    detailsOverlay.classList.add("hidden");
}

closeDetailsBtn.addEventListener("click", closeDetails);

// Close when clicking the dark background
detailsOverlay.addEventListener("click", function (event) {
    if (event.target === detailsOverlay) {
        closeDetails();
    }
});

// Close with the Escape key
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeDetails();
    }
});

// ===== Search and filter =====

searchInput.addEventListener("input", displayApplications);
statusFilter.addEventListener("change", displayApplications);
sortSelect.addEventListener("change", displayApplications);
// Wipes the previous user's data from the page when someone logs out
function clearApplications() {
    applications = [];
    editingId = null;
    applicationsList.innerHTML = "";
    jobForm.reset();
    applicationForm.classList.add("hidden");
    closeDetails();
    updateStats();
}
// ===== Start =====

loadApplications();initAuth(loadApplications, clearApplications);