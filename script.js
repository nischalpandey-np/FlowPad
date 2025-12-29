let tasksData = {}
const todo = document.querySelector('#todo');
const progress = document.querySelector('#progress');
const done = document.querySelector('#done');

const columns = [todo, progress, done];
let dragElemet = null;

/* 
   TASK
    */

function addTask(title, desc, column) {
    const div = document.createElement("div");
    const columnId = column.id;
    
    div.classList.add("task");
    div.setAttribute("draggable", "true");

    div.innerHTML = `
        <h2>${title}</h2>
        <p>${desc}</p>
        <button class="delete-btn">Delete</button>
    `;

    // Add column-specific buttons
    if(columnId == "todo"){
        div.insertAdjacentHTML("beforeend", `<button class="move-btn">Move to In Progress</button>`);
    }
    else if (columnId == "progress"){
        div.insertAdjacentHTML("beforeend", `<button class="complete-btn">Mark as Completed</button>`);
    }

    column.appendChild(div);

    // Drag
    div.addEventListener("dragstart", () => {
        dragElemet = div;
    });

    // Delete
    const deleteButton = div.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => {
        div.remove();
        updateTaskCount();
    });

    // Move to Progress button
    if(columnId == "todo") {
        const moveBtn = div.querySelector(".move-btn");
        moveBtn.addEventListener("click", () => {
            progress.appendChild(div);
            // Remove old button and add new one
            moveBtn.remove();
            div.insertAdjacentHTML("beforeend", `<button class="complete-btn">Mark as Completed</button>`);
            
            // Add event listener to new button
            const completeBtn = div.querySelector(".complete-btn");
            completeBtn.addEventListener("click", () => {
                done.appendChild(div);
                completeBtn.remove();
                updateTaskCount();
            });
            
            updateTaskCount();
        });
    }
    
    // Mark as Completed button
    if(columnId == "progress") {
        const completeBtn = div.querySelector(".complete-btn");
        completeBtn.addEventListener("click", () => {
            done.appendChild(div);
            completeBtn.remove();
            updateTaskCount();
        });
    }

    return div;
}

/* 
   SYNC + COUNT
    */

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

/* 
   DRAG & DROP
    */

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

        const oldColumn = dragElemet.parentElement;
        column.appendChild(dragElemet);
        column.classList.remove('hover-over');
        
        // Update buttons when dragged to different column
        updateTaskButtons(dragElemet, column.id);
        updateTaskCount();
    });
}

// Helper function to update buttons based on column
function updateTaskButtons(task, columnId) {
    // Remove existing action buttons (keep delete button)
    const moveBtn = task.querySelector(".move-btn");
    const completeBtn = task.querySelector(".complete-btn");
    if(moveBtn) moveBtn.remove();
    if(completeBtn) completeBtn.remove();
    
    // Add appropriate button
    if(columnId == "todo") {
        task.insertAdjacentHTML("beforeend", `<button class="move-btn">Move to In Progress</button>`);
        const newMoveBtn = task.querySelector(".move-btn");
        newMoveBtn.addEventListener("click", () => {
            progress.appendChild(task);
            updateTaskButtons(task, "progress");
            updateTaskCount();
        });
    }
    else if(columnId == "progress") {
        task.insertAdjacentHTML("beforeend", `<button class="complete-btn">Mark as Completed</button>`);
        const newCompleteBtn = task.querySelector(".complete-btn");
        newCompleteBtn.addEventListener("click", () => {
            done.appendChild(task);
            updateTaskButtons(task, "done");
            updateTaskCount();
        });
    }
}

/* 
   LOAD FROM STORAGE
    */

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

/* 
   INIT
    */

addDragEventsOnColumn(todo);
addDragEventsOnColumn(progress);
addDragEventsOnColumn(done);

/* 
   MODAL
    */

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