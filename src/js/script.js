let databaseURL = "http://localhost:4000/";
let entityHeader = document.getElementById("entityHeader");

window.onload = function () {
    entityHeader.innerText = "";
};

function load(entities) {
    get(entities).then(r => show(entities, r));
}

function get(entities) {
    return fetch(databaseURL + entities + "/").then(r => r.json());
}

function show(entityName, collection) {

    entityHeader.innerText = getCapitalized(entityName);
    entityHeader.removeAttribute("hidden");

    let entitiesView = document.getElementById("entities");
    let template = document.getElementById(entityName + "Template").content;

    entitiesView.innerHTML = "";
    for (let entity of collection) {
        let templateClone = template.querySelector("." + getSingleFromPlural(entityName)).cloneNode(true);

        updateTemplate(templateClone, entity, entityName);
        entitiesView.appendChild(templateClone);
    }
}

function getSingleFromPlural(pluralNoun) {
    let result = pluralNoun.substring(0, pluralNoun.length - 1);
    return result;
}

function getCapitalized(string) {
    return string.substring(0, 1).toUpperCase() + string.substring(1);
}

function updateTemplate(template, entity, entityName) {
    let entityId = template.querySelector(".id");
    entityId.innerText = entity.id;

    switch (entityName) {
        case "assignments": {

            break;
        }
        case "employees": {
            let entityName = template.querySelector(".name");
            entityName.innerText = entity.name;
            let technologies = template.querySelector(".technologies");
            technologies.innerText = entity.technologies;
            break;
        }
        case "projects": {
            let entityName = template.querySelector(".name");
            entityName.innerText = entity.name;
            let technologies = template.querySelector(".technologies");
            technologies.innerText = entity.technologies;
            break;
        }
        default : {

        }
    }
}

function addStudent(student) {
    return fetch(employeesURL, {
        method: 'POST',
        body: JSON.stringify(student),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

function extracted(form) {
    form.addEventListener("submit", ev => {
        ev.preventDefault();
        let name = document.getElementById("nameInput").value;
        let grade = document.getElementById("gradeInput").value;
        addStudent({fullName: name, grade: grade}).then(load(e));
    });

}
