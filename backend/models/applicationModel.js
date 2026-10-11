let applications = [];
let nextId = 1;

function getAll() {
    return applications;
}

function getById(id) {
    return applications.find(function (application) {
        return application.id === id;
    });
}

function create(data) {
    const application = Object.assign({ id: nextId++ }, data);
    applications.push(application);
    return application;
}

function update(id, data) {
    const index = applications.findIndex(function (application) {
        return application.id === id;
    });

    if (index === -1) {
        return null;
    }

    applications[index] = Object.assign({}, data, { id: id });
    return applications[index];
}

function remove(id) {
    const index = applications.findIndex(function (application) {
        return application.id === id;
    });

    if (index === -1) {
        return false;
    }

    applications.splice(index, 1);
    return true;
}

module.exports = { getAll, getById, create, update, remove };
