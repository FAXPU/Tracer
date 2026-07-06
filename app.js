(function () {
  const STORAGE_KEY = 'tracer-tasks';

  let tasks = loadTasks();
  let idCounter = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  let currentFilter = 'all';
  let searchTerm = '';

  const taskList = document.getElementById('task-list');
  const taskInput = document.getElementById('task-input');
  const priorityInput = document.getElementById('priority-input');
  const todoForm = document.getElementById('todo-form');
  const searchInput = document.getElementById('search-input');
  const taskCount = document.getElementById('task-count');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');
  const themeToggle = document.getElementById('theme-toggle');

  const priorityRank = { high: 0, medium: 1, low: 2 };

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load tasks from localStorage', e);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  }

  function render() {
    let visible = tasks.filter(t => {
      if (currentFilter === 'active' && t.completed) return false;
      if (currentFilter === 'completed' && !t.completed) return false;
      if (searchTerm && !t.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    visible = visible.slice().sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return priorityRank[a.priority] - priorityRank[b.priority];
    });

    taskList.innerHTML = '';

    if (visible.length === 0) {
      const emptyMsg = document.createElement('li');
      emptyMsg.className = 'empty-message';
      emptyMsg.textContent = tasks.length === 0
        ? 'No tasks yet. Add one above to get started.'
        : 'No tasks match your current view.';
      taskList.appendChild(emptyMsg);
    } else {
      visible.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' completed' : '');
        li.dataset.id = task.id;

        const left = document.createElement('div');
        left.className = 'task-left';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', 'Mark task complete');
        checkbox.addEventListener('change', () => toggleComplete(task.id));

        const span = document.createElement('span');
        span.textContent = task.text;

        left.appendChild(checkbox);
        left.appendChild(span);

        const badge = document.createElement('span');
        badge.className = 'priority-badge ' + task.priority;
        badge.textContent = task.priority;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.setAttribute('aria-label', 'Delete task');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        li.appendChild(left);
        li.appendChild(badge);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
      });
    }

    const activeCount = tasks.filter(t => !t.completed).length;
    taskCount.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} left`;
  }

  function addTask(text, priority) {
    tasks.push({ id: idCounter++, text: text.trim(), priority, completed: false });
    saveTasks();
    render();
  }

  function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) task.completed = !task.completed;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
  }

  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;
    addTask(text, priorityInput.value);
    taskInput.value = '';
    taskInput.focus();
  });

  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    render();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
      localStorage.setItem('tracer-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
      localStorage.setItem('tracer-theme', 'dark');
    }
  });

  // Restore saved theme on load
  if (localStorage.getItem('tracer-theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  }

  render();
})();
