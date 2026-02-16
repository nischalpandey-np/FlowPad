const STORAGE_KEY = "tasks";
const isTouchPrimaryInput = window.matchMedia("(pointer: coarse)").matches;

const columnMap = {
  todo: document.querySelector("#todo"),
  progress: document.querySelector("#progress"),
  done: document.querySelector("#done")
};

const columns = Object.values(columnMap).filter(Boolean);
let tasksData = {
  todo: [],
  progress: [],
  done: []
};
let draggedElement = null;

const toggleModalButton = document.querySelector("#toggle-modal");
const modal = document.querySelector(".modal");
const modalBg = document.querySelector(".modal .bg");
const addTaskButton = document.querySelector("#add-new-task");
const taskTitleInput = document.querySelector("#task-title-input");
const taskDescriptionInput = document.querySelector("#task-description-input");

function createButton({ label, className, onClick }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function updateTaskButtons(task, columnId) {
  const actionContainer = task.querySelector(".task-actions");
  if (!actionContainer) {
    return;
  }

  actionContainer.innerHTML = "";
  actionContainer.appendChild(
    createButton({
      label: "Delete",
      className: "delete-btn",
      onClick: () => {
        task.remove();
        updateTaskCount();
      }
    })
  );

  if (columnId === "todo") {
    actionContainer.appendChild(
      createButton({
        label: "Move to In Progress",
        className: "move-btn",
        onClick: () => moveTask(task, "progress")
      })
    );
  }

  if (columnId === "progress") {
    actionContainer.appendChild(
      createButton({
        label: "Back to To Do",
        className: "move-btn",
        onClick: () => moveTask(task, "todo")
      })
    );
    actionContainer.appendChild(
      createButton({
        label: "Mark as Completed",
        className: "complete-btn",
        onClick: () => moveTask(task, "done")
      })
    );
  }

  if (columnId === "done") {
    actionContainer.appendChild(
      createButton({
        label: "Move to In Progress",
        className: "move-btn",
        onClick: () => moveTask(task, "progress")
      })
    );
  }
}

function addDragEventsOnTask(task) {
  if (!task.draggable) {
    return;
  }

  task.addEventListener("dragstart", () => {
    draggedElement = task;
    task.classList.add("dragging");
  });

  task.addEventListener("dragend", () => {
    draggedElement = null;
    task.classList.remove("dragging");
    columns.forEach((column) => column.classList.remove("hover-over"));
  });
}

function addTask(title, desc, column) {
  if (!column) {
    return null;
  }

  const safeTitle = typeof title === "string" ? title.trim() : "";
  if (!safeTitle) {
    return null;
  }

  const safeDesc = typeof desc === "string" ? desc.trim() : "";
  const task = document.createElement("article");
  const taskTitle = document.createElement("h2");
  const taskDescription = document.createElement("p");
  const taskActions = document.createElement("div");

  task.classList.add("task");
  task.draggable = !isTouchPrimaryInput;

  taskTitle.textContent = safeTitle;
  taskDescription.textContent = safeDesc;
  taskActions.className = "task-actions";

  task.appendChild(taskTitle);
  task.appendChild(taskDescription);
  task.appendChild(taskActions);
  column.appendChild(task);

  addDragEventsOnTask(task);
  updateTaskButtons(task, column.id);

  return task;
}

function updateTaskCount() {
  tasksData = {
    todo: [],
    progress: [],
    done: []
  };

  columns.forEach((column) => {
    const tasks = Array.from(column.querySelectorAll(".task"));
    const countElement = column.querySelector(".count-value") || column.querySelector(".right");

    if (countElement) {
      countElement.textContent = String(tasks.length);
    }

    tasksData[column.id] = tasks.map((task) => ({
      title: task.querySelector("h2")?.textContent || "",
      desc: task.querySelector("p")?.textContent || ""
    }));
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksData));
}

function moveTask(task, targetColumnId) {
  const targetColumn = columnMap[targetColumnId];
  if (!task || !targetColumn) {
    return;
  }

  targetColumn.appendChild(task);
  updateTaskButtons(task, targetColumnId);
  updateTaskCount();
}

function addDragEventsOnColumn(column) {
  column.addEventListener("dragenter", (event) => {
    event.preventDefault();
    if (!draggedElement) {
      return;
    }
    column.classList.add("hover-over");
  });

  column.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  column.addEventListener("dragleave", () => {
    column.classList.remove("hover-over");
  });

  column.addEventListener("drop", (event) => {
    event.preventDefault();
    column.classList.remove("hover-over");

    if (!draggedElement) {
      return;
    }

    moveTask(draggedElement, column.id);
    draggedElement = null;
  });
}

function loadTasksFromStorage() {
  const storedTasks = localStorage.getItem(STORAGE_KEY);
  if (!storedTasks) {
    return;
  }

  let parsedTasks = null;
  try {
    parsedTasks = JSON.parse(storedTasks);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  Object.keys(columnMap).forEach((columnId) => {
    const column = columnMap[columnId];
    const items = Array.isArray(parsedTasks?.[columnId]) ? parsedTasks[columnId] : [];

    items.forEach((item) => {
      addTask(item?.title || "", item?.desc || "", column);
    });
  });
}

function openModal() {
  if (!modal) {
    return;
  }
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  taskTitleInput?.focus();
}

function closeModal() {
  if (!modal) {
    return;
  }
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
}

function handleAddTask() {
  const taskTitle = taskTitleInput?.value || "";
  const taskDescription = taskDescriptionInput?.value || "";
  const newTask = addTask(taskTitle, taskDescription, columnMap.todo);

  if (!newTask) {
    taskTitleInput?.focus();
    return;
  }

  updateTaskCount();
  if (taskTitleInput) {
    taskTitleInput.value = "";
  }
  if (taskDescriptionInput) {
    taskDescriptionInput.value = "";
  }
  closeModal();
}

columns.forEach(addDragEventsOnColumn);
loadTasksFromStorage();
updateTaskCount();

toggleModalButton?.addEventListener("click", openModal);
modalBg?.addEventListener("click", closeModal);
addTaskButton?.addEventListener("click", handleAddTask);

taskTitleInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleAddTask();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.classList.contains("active")) {
    closeModal();
  }
});
