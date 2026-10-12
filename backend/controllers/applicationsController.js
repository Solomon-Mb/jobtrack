const Application = require("../models/applicationModel");

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isText(value) {
    return typeof value === "string" && value.trim() !== "";
}

// Returns an error message, or null if the data is valid
function validate(body) {
    if (!isText(body.company)) return "Company is required";
    if (!isText(body.position)) return "Position is required";
    if (!isText(body.date)) return "Date is required";
    if (!DATE_PATTERN.test(body.date)) return "Date must be in YYYY-MM-DD format";
    if (body.interviewDate && !DATE_PATTERN.test(body.interviewDate)) {
        return "Interview date must be in YYYY-MM-DD format";
    }
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

// Returns a usable id, or null when the id in the URL is not valid
function parseId(req) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
        return null;
    }

    return id;
}

// req.userId is set by the requireAuth middleware

async function getApplications(req, res, next) {
    try {
        res.json(await Application.getAll(req.userId));
    } catch (error) {
        next(error);
    }
}

async function getApplication(req, res, next) {
    try {
        const id = parseId(req);
        const application = id === null ? null : await Application.getById(id, req.userId);

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        res.json(application);
    } catch (error) {
        next(error);
    }
}

async function createApplication(req, res, next) {
    try {
        const body = req.body || {};
        const error = validate(body);

        if (error) {
            return res.status(400).json({ error: error });
        }

        const application = await Application.create(req.userId, pickFields(body));
        res.status(201).json(application);
    } catch (error) {
        next(error);
    }
}

async function updateApplication(req, res, next) {
    try {
        const body = req.body || {};
        const error = validate(body);

        if (error) {
            return res.status(400).json({ error: error });
        }

        const id = parseId(req);
        const application = id === null
            ? null
            : await Application.update(id, req.userId, pickFields(body));

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        res.json(application);
    } catch (error) {
        next(error);
    }
}

async function deleteApplication(req, res, next) {
    try {
        const id = parseId(req);
        const removed = id === null ? false : await Application.remove(id, req.userId);

        if (!removed) {
            return res.status(404).json({ error: "Application not found" });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication
};
