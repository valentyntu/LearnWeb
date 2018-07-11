let databaseURL = "http://localhost:4000/";

let project;

window.onload = function () {
    renderProjects();

    let form = document.getElementById("assignEmployeeForm");
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        let assignment = {
            employee_id: 0,
            dateFrom: "",
            dateTo: ""
        };
        assignment.employee_id = parseInt(form.querySelector("#selectEmployee").value);
        assignment.dateFrom = form.querySelector("#dateStart").value;
        assignment.dateTo = form.querySelector("#dateEnd").value;
        project.assignments.push(assignment);
        $("[data-dismiss=modal]").trigger({type: "click"});
        updateProject(project)
            .then(p => p.json())
            .then(p => switchToProjectDetails(p.id));
    });

};

function updateProject(project) {
    return fetch(databaseURL + "projects/" + project.id, {
        method: 'PATCH',
        body: JSON.stringify(project),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

function removeAssignment(project, employee_id) {
    project.assignments = project.assignments.filter(a => a.employee_id != employee_id);
    return updateProject(project);
}

function renderEmployees() {
    return render("employees");
}

function renderProjects() {
    return render("projects");
}

function get(entities) {
    return fetch(databaseURL + entities + "/")
        .then(r => r.json());
}

function render(entities) {
    showJumbotron();
    hideProjectDetails();
    get(entities).then(r => show(entities, r));
}

function showJumbotron() {
    document.getElementById("entityJumbotron").classList.remove("hidden");
}

function show(entityName, collection) {
    let entitiesView = document.getElementById("entities");
    let template = document.getElementById(entityName + "Template").content;

    entitiesView.innerHTML = "";
    for (let entity of collection) {
        let templateClone = template.querySelector("." + getSingleFromPlural(entityName)).cloneNode(true);
        templateClone.querySelector(".id").innerText = entity.id;
        updateTemplate(templateClone, entity, entityName);
        entitiesView.appendChild(templateClone);
    }
    switch (entityName) {
        case "assignments": {
            updateEntityHeadings(entityName, 2);
            break;
        }
        case "employees": {
            updateEntityHeadings(entityName, 0);
            setEntityCardFlexDirection("column");
            break;
        }
        case "projects": {
            updateEntityHeadings(entityName, 1);
            setEntityCardFlexDirection("row");
            break;
        }
        default : {

        }
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

function updateEmployeeTemplate(template, employee) {
    let entityName = template.querySelector(".employeeName");
    entityName.innerText = employee.name;

    let technologies = template.querySelector(".technologies");
    technologies.innerText += employee.technologies;
}

function updateProjectTemplate(template, project) {
    let entityName = template.querySelector(".name");
    entityName.innerText = project.name;

    let technologies = template.querySelector(".technologies");
    technologies.innerText += project.technologies;

    let description = template.querySelector(".description");
    description.innerText += project.description;

    let logo = template.querySelector(".logo");
    logo.setAttribute("src", project.image);
}

let help = [
    "This is the list of all employees of the company.",
    "Here you can see all current projects. To see detailed info and assign new employees press 'Manage' button.",
    ""
];

let entityLead = document.getElementById("entityLead");

function updateEntityLead(lead) {
    entityLead.innerText = help[lead];
}

let entityHeader = document.getElementById("entityHeader");

function updateEntityHeader(header) {
    entityHeader.innerText = header;
}

function updateEntityHeadings(entityName, lead) {
    updateEntityHeader(getCapitalized(entityName));
    updateEntityLead(lead);
}

function updateTemplate(template, entity, entityName) {
    let entityId = template.querySelector(".id");
    entityId.innerText = entity.id;

    switch (entityName) {
        case "assignments": {
            updateAssignmentTemplate();
            break;
        }
        case "employees": {
            updateEmployeeTemplate(template, entity);
            break;
        }
        case "projects": {
            updateProjectTemplate(template, entity);
            break;
        }
        default : {

        }
    }
}

function setEntityCardFlexDirection(direction) {
    let entityContainer = document.getElementById("entities");
    let rowAttributes = ["row", "justify-content-between", "align-items-stretch"];
    let columnAttributes = ["column"];
    if (direction === "column") {
        removeAllClasses(entityContainer.classList, rowAttributes);
        addAllClasses(entityContainer.classList, columnAttributes);
    } else {
        removeAllClasses(entityContainer.classList, columnAttributes);
        addAllClasses(entityContainer.classList, rowAttributes);
    }
}

function removeAllClasses(from, items) {
    for (let item of items) {
        from.remove(item);
    }
}

function addAllClasses(target, items) {
    for (let item of items) {
        target.add(item);
    }
}

function hideJumbotron() {
    document.getElementById("entityJumbotron").classList.add("hidden");
}

async function getEmployees(project) {
    let assignments = project.assignments;
    let employees = [];
    if (assignments.length > 0) {
        for (let assignment of assignments) {
            employees.push(await fetch(databaseURL + "employees/" + assignment.employee_id)
                .then(r => (r.json())));
        }
    }
    return employees;
}

function getProjectById(id) {
    return fetch(databaseURL + "projects/" + id).then(r => r.json());
}

async function getNotEmployedEmployees(project) {
    let alreadyAssignedEmployeesIds = project.assignments.map(a => a.employee_id);
    let allEmployees = await get("employees");

    let result = [];
    for (let e of allEmployees) {
        if (!alreadyAssignedEmployeesIds.includes(e.id)) {
            result.push(e);
        }
    }
    return result;
}

async function updateModal(project) {
    let notEmployedEmployees = await getNotEmployedEmployees(project);

    let projectName = document.getElementById("assignEmployeeModal").querySelector(".projectName");
    projectName.innerText = "\"" + project.name + "\".";

    let template = document.getElementById("optionTemplate").content;
    let select = document.getElementById("assignEmployeeModal").querySelector(".select");
    select.innerHTML = "";

    for (let e of notEmployedEmployees) {
        let templateClone = template.cloneNode(true);
        templateClone.querySelector("option").setAttribute("value", e.id);
        templateClone.querySelector(".name").innerText = e.name;
        templateClone.querySelector(".technologies").innerText = e.technologies;
        select.appendChild(templateClone);
    }
}

async function switchToProjectDetails(id) {
    hideJumbotron();
    showProjectDetails();

    let projectDetails = document.getElementById("projectDetails");
    projectDetails.innerHTML = "";
    let template = document.getElementById("projectDetailsTemplate").content;
    let templateClone = template.querySelector(".projectDetails").cloneNode(true);
    project = await getProjectById(id);
    let employees = await getEmployees(project);
    templateClone.querySelector(".id").innerText = id;
    updateProjectDetailsTemplate(templateClone, project, employees);
    updateModal(project);
    projectDetails.appendChild(templateClone);
}

function updateProjectDetailsTemplate(template, project, employees) {
    let entityName = template.querySelector(".name");
    entityName.innerText = project.name;

    let technologies = template.querySelector(".technologies");
    technologies.innerText += project.technologies;

    let description = template.querySelector(".description");
    description.innerText += project.description;

    let employeesTable = template.querySelector(".employees");
    let employeeTemplate = document.getElementById("employeeRowTemplate").content;

    for (let employee of employees) {
        let templateClone = employeeTemplate.querySelector(".employeeRow").cloneNode(true);
        updateEmployeeTableRowTemplate(templateClone, employee, project);
        employeesTable.querySelector(".tableBody").appendChild(templateClone);
    }
}

function updateEmployeeTableRowTemplate(templateClone, employee, project) {
    templateClone.querySelector(".name").innerText = employee.name;
    templateClone.querySelector(".technologies").innerText = employee.technologies;
    templateClone.querySelector(".btn-danger").addEventListener('click', ev => removeAssignment(project, employee.id)
        .then(a => a.json())
        .then(switchToProjectDetails(project.id)));
    let options = {year: 'numeric', month: 'long', day: 'numeric'};
    for (let a of project.assignments) {
        if (a.employee_id === employee.id) {
            if (a.dateFrom == "") {
                templateClone.querySelector(".dateFrom").innerText = "NOT SET"
            } else {
                let dateFrom = new Date(a.dateFrom);
                templateClone.querySelector(".dateFrom").innerText = dateFrom.toLocaleDateString("en-US", options);
            }

            if (a.dateTo == "") {
                templateClone.querySelector(".dateTo").innerText = "NOT SET"
            } else {
                let dateTo = new Date(a.dateTo);
                templateClone.querySelector(".dateTo").innerText = dateTo.toLocaleDateString("en-US", options);
            }

        }
    }
}

function showProjectDetails() {
    document.getElementById("projectDetails").classList.remove("hidden");
}

function hideProjectDetails() {
    document.getElementById("projectDetails").classList.add("hidden");
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
