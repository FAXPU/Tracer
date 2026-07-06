const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const priorityInput = document.getElementById('priority-input');
const searchInput = document.getElementById('search-input');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const themeToggle = document.getElementById('theme-toggle');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  render();
  initTheme();
});

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  const priority = priorityInput.value;
  if (text) {
    const tasks = getTasksFromStorage();
    // Unique ID allows us to safely find items even while filtering or searching
    tasks.push({ id: Date.now(), text, completed: false, priority });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    taskInput.value = '';
    render();
  }
});

// Real-time Search Engine logic
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  render();
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

function render() {
  taskList.innerHTML = '';
  const tasks = getTasksFromStorage();
  let activeCount = 0;

  tasks.forEach(task => {
    if (!task.completed) activeCount++;

    // 1. Filter Logic
    if (currentFilter === 'active' && task.completed) return;
    if (currentFilter === 'completed' && !task.completed) return;

    // 2. Search Logic
    if (searchQuery && !task.text.toLowerCase().includes(searchQuery)) return;

    createTaskRow(task);
  });

  taskCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} left`;
  
  if (taskList.children.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'empty-message';
    msg.textContent = searchQuery ? "No matches found for your search." : "No trace of objectives here.";
    taskList.appendChild(msg);
  }
}

function createTaskRow(task) {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''}`;

  const leftDiv = document.createElement('div');
  leftDiv.className = 'task-left';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleTask(task.id));

  const span = document.createElement('span');
  span.textContent = task.text;

  leftDiv.appendChild(checkbox);
  leftDiv.appendChild(span);

  // Priority Badge Injection
  const badge = document.createElement('span');
  badge.className = `priority-badge ${task.priority}`;
  badge.textContent = task.priority;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  li.appendChild(leftDiv);
  li.appendChild(badge);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}

function toggleTask(id) {
  const tasks = getTasksFromStorage();
  const task = tasks.find(t => t.id === id);
  if (task) task.completed = !task.completed;
  localStorage.setItem('tasks', JSON.stringify(tasks));
  render();
}

function deleteTask(id) {
  let tasks = getTasksFromStorage();
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  render();
}

function getTasksFromStorage() {
  return localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [];
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}
