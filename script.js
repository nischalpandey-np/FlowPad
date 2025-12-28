let tasksData = {}
const todo = document.querySelector('#todo');
const progress = document.querySelector('#progress');
const done = document.querySelector('#done');

const columns = [todo, progress, done];
let dragElemet = null;

/* =========================
   TASK
   ========================= */

function addTask(title, desc, column) {
    const div = document.createElement("div");
    div.classList.add("task");
    div.setAttribute("draggable", "true");

    div.innerHTML = `
        <h2>${title}</h2>
        <p>${desc}</p>
        <button>Delete</button>
    `;

    column.appendChild(div);

    // Drag
    div.addEventListener("dragstart", () => {
        dragElemet = div;
    });

    // Delete
    const deleteButton= div.querySelector("button")
    deleteButton.addEventListener("click", () => {
        div.remove();
        updateTaskCount();
    });

    return div;
}

/* =========================
   SYNC + COUNT
   ========================= */

function updateTaskCount() {
    columns.forEach(col => {
        const tasks = col.querySelectorAll(".task");
        const count = col.querySelector(".right");

        tasksData[col.id] = Array.from(tasks).map(t => ({
            title: t.querySelector("h2").innerText,
            desc: t.querySelector("p").innerText
        }));

        if (count) count.innerText = tasks.length;
    });

    localStorage.setItem("tasks", JSON.stringify(tasksData));
}

/* =========================
   DRAG & DROP
   ========================= */

function addDragEventsOnColumn(column) {
    column.addEventListener("dragenter", e => {
        e.preventDefault();
        column.classList.add('hover-over');
    });

    column.addEventListener("dragleave", () => {
        column.classList.remove("hover-over");
    });

    column.addEventListener("dragover", e => {
        e.preventDefault();
    });

    column.addEventListener("drop", e => {
        e.preventDefault();
        if (!dragElemet) return;

        column.appendChild(dragElemet);
        column.classList.remove('hover-over');
        updateTaskCount();
    });
}

/* =========================
   LOAD FROM STORAGE
   ========================= */

if (localStorage.getItem("tasks")) {
    const data = JSON.parse(localStorage.getItem("tasks"));

    for (const col in data) {
        const column = document.querySelector(`#${col}`);
        data[col].forEach(task => {
            addTask(task.title, task.desc, column);
        });
    }

    updateTaskCount();
}

/* =========================
   INIT
   ========================= */

addDragEventsOnColumn(todo);
addDragEventsOnColumn(progress);
addDragEventsOnColumn(done);

/* =========================
   MODAL
   ========================= */

const toggleModalButton = document.querySelector("#toggle-modal");
const modalBg = document.querySelector(".modal .bg");
const modal = document.querySelector(".modal");
const addTaskButton = document.querySelector("#add-new-task");

toggleModalButton.addEventListener("click", () => {
    modal.classList.toggle("active");
});

modalBg.addEventListener("click", () => {
    modal.classList.remove("active");
});

addTaskButton.addEventListener("click", () => {
    const taskTitle = document.querySelector("#task-title-input").value;
    const taskDescription = document.querySelector("#task-description-input").value;


    if (!taskTitle) return;

    addTask(taskTitle, taskDescription, todo);
    updateTaskCount();
  
    //reset placeholder
    document.querySelector("#task-title-input").value="";
    document.querySelector("#task-description-input").value="";
    modal.classList.remove("active");
});
