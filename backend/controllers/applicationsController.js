const Application = require("../models/applicationModel");

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

function isText(value) {
    return typeof value === "string" && value.trim() !== "";
}

// Returns an error message, or null if the data is valid
function validate(body) {
    if (!isText(body.company)) return "Company is required";
    if (!isText(body.position)) return "Position is required";
    if (!isText(body.date)) return "Date is required";
    if (!STATUSES.includes(body.status)) {
        return "Status must be one of: " + STATUSES.join(", ");
    }
    return null;
}

// Keep only the fields we expect
function pickFields(body) {
    return {
        company: body.company.trim(),
        position: body.position.trim(),
        status: body.status,
        date: body.date,
        interviewDate: body.interviewDate || "",
        website: body.website || "",
        location: body.location || "",
        notes: body.notes || ""
    };
}

function getApplications(req, res) {
    res.json(Application.getAll());
}

function getApplication(req, res) {
    const application = Application.getById(Number(req.params.id));

    if (!application) {
        return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
}

function createApplication(req, res) {
    const body = req.body || {};
    const error = validate(body);

    if (error) {
        return res.status(400).json({ error: error });
    }

    const application = Application.create(pickFields(body));
    res.status(201).json(application);
}

function updateApplication(req, res) {
    const body = req.body || {};
    const error = validate(body);

    if (error) {
        return res.status(400).json({ error: error });
    }

    const application = Application.update(Number(req.params.id), pickFields(body));

    if (!application) {
        return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
}

function deleteApplication(req, res) {
    const removed = Application.remove(Number(req.params.id));

    if (!removed) {
        return res.status(404).json({ error: "Application not found" });
    }

    res.status(204).send();
}

module.exports = {
    getApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication
};
