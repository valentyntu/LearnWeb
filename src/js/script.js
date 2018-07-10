let databaseURL = "http://localhost:4000/";
let entityHeader = document.getElementById("entityHeader");

window.onload = function () {
    loadProjects();
};

function loadEmployees() {
    return load("employees");
}

function loadProjects() {
    return load("projects");
}

function loadAssignments() {
    return load("assignments");
}

function get(entities) {
    return fetch(databaseURL + entities + "/")
        .then(r => r.json());
}

function load(entities) {
    get(entities).then(r => show(entities, r));
}

function showJumbotron() {
    document.getElementById("entityJumbotron").removeAttribute("hidden");
}

function show(entityName, collection) {
    entityHeader.innerText = getCapitalized(entityName);

    showJumbotron();

    let entitiesView = document.getElementById("entities");
    let template = document.getElementById(entityName + "Template").content;

    entitiesView.innerHTML = "";
    for (let entity of collection) {
        let templateClone = template.querySelector("." + getSingleFromPlural(entityName)).cloneNode(true);
        templateClone.querySelector(".id").innerText = entity.id;
        updateTemplate(templateClone, entity, entityName);
        entitiesView.appendChild(templateClone);
    }
}

function getCurrentAssignments(employee) {
    return fetch(databaseURL + "assignments/?employee_id=" + employee.id)
        .then(r => r.json());
}

function getCurrentProjects(employee) {
    return getCurrentAssignments(employee)
        .then(a => fetch(databaseURL + "projects/?id=" + a.project_id))
        .then(p => p.json());
}

function updateEmployeeTemplate(template, entity) {
    let entityName = template.querySelector(".name");
    entityName.innerText = entity.name;

    let technologies = template.querySelector(".technologies");
    technologies.innerText += entity.technologies;
}

function updateProjectTemplate(template, entity) {
    let entityName = template.querySelector(".name");
    entityName.innerText = entity.name;

    let technologies = template.querySelector(".technologies");
    technologies.innerText += entity.technologies;

    let description = template.querySelector(".description");
    description.innerText += entity.description;

    let logo = template.querySelector(".logo");
    logo.setAttribute("src", entity.image);
}

function updateAssignmentTemplate() {

}

let help = [
    "",
    "Here you can see all current projects. To see detailed info and assign new employees press 'Manage' button.",
    ""
];

function updateTemplate(template, entity, entityName) {
    let entityId = template.querySelector(".id");
    entityId.innerText = entity.id;

    switch (entityName) {
        case "assignments": {
            updateAssignmentTemplate();
            document.getElementById("entityLead").innerText = help[2];
            break;
        }
        case "employees": {
            updateEmployeeTemplate(template, entity);
            document.getElementById("entityLead").innerText = help[0];
            break;
        }
        case "projects": {
            updateProjectTemplate(template, entity);
            document.getElementById("entityLead").innerText = help[1];
            break;
        }
        default : {

        }
    }
}

function getSingleFromPlural(pluralNoun) {
    if (pluralNoun.endsWith("ies")) {
        return pluralNoun.replace("ies", "y");
    } else {
        return pluralNoun.substring(0, pluralNoun.length - 1);
    }
}

function getCapitalized(string) {
    return string.substring(0, 1).toUpperCase() + string.substring(1);
}
