let databaseURL = "http://localhost:4000/";

window.onload = function () {
    load("projects");
}

function load(entity) {
    get(entity).then(show);

}

function get(entity) {
    return fetch(databaseURL + entity).then(r => r.json());
}

function show(entityName, collection) {
    let entitiesView = document.getElementById("entities");
    let template = document.getElementById(entityName + "Template").content;

    entitiesView.innerHTML = "";
    for (let entity of collection) {
        let templateClone = template.querySelector(getSingleFromPlural(entityName)).cloneNode(true);

        updateTemplate(templateClone, entity);
        entitiesView.appendChild(templateClone);
    }
}

function getSingleFromPlural(pluralNoun) {
    return pluralNoun.substring(0, pluralNoun.length - 1);
}

function updateTemplate(template, entity) {
    switch (entity) {
        case "assignments": {

            break;
        }
        default : {
            let studentName = template.querySelector(".name");
            studentName.innerText = entity.name;
            let studentGrade = template.querySelector(".technologies");
            studentGrade.innerText = entity.technologies;
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
