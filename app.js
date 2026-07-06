const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const themeToggle = document.getElementById('theme-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  initTheme();
});

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (text) {
    addTask(text, false);
    saveTaskToLocalStorage(text, false);
    taskInput.value = '';
    render();
  }
});

clearCompletedBtn.addEventListener('click', () => {
  let tasks = getTasksFromStorage();
  tasks = tasks.filter(t => !t.completed);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  render();
});

themeToggle.addEventListener('click', () => {
  const mode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', mode);
  themeToggle.textContent = mode === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', mode);
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    filterBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.getAttribute('data-filter');
    render();
  });
});

// Primary UI Controller
function render() {
  taskList.innerHTML = '';
  const tasks = getTasksFromStorage();
  let activeCount = 0;

  tasks.forEach((task, index) => {
    if (!task.completed) activeCount++;

    // Apply Filter Logic
    if (currentFilter === 'active' && task.completed) return;
    if (currentFilter === 'completed' && !task.completed) return;

    createTaskRow(task, index);
  });

  taskCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} left`;
  
  // Empty State Logic
  if (taskList.children.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'empty-message';
    msg.textContent = currentFilter === 'completed' ? "No completed items yet." : "Clean slate. Trace a new objective.";
    taskList.appendChild(msg);
  }
}

function createTaskRow(task, index) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''}`;

  const leftDiv = document.createElement('div');
  leftDiv.className = 'task-left';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleTask(index));

  const span = document.createElement('span');
  span.textContent = task.text;

  leftDiv.appendChild(checkbox);
  leftDiv.appendChild(span);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteTask(index));

  li.appendChild(leftDiv);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}

// Data Utility Methods
function addTask(text, completed) {
  const tasks = getTasksFromStorage();
  tasks.push({ text, completed });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function toggleTask(index) {
  const tasks = getTasksFromStorage();
  tasks[index].completed = !tasks[index].completed;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  render();
}

function deleteTask(index) {
  const tasks = getTasksFromStorage();
  tasks.splice(index, 1);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  render();
}

function getTasksFromStorage() {
  return localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
}

function loadTasks() { render(); }

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}
