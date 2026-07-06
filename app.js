// Grab DOM elements
const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Event Listener for adding a task
todoForm.addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent page reload
  
  const taskText = taskInput.value.trim();
  if (taskText !== '') {
    addTask(taskText);
    taskInput.value = ''; // Clear the input
  }
});

// Function to build and inject the HTML for a single task
function addTask(text) {
  const li = document.createElement('li');
  li.classList.add('task-item');

  const span = document.createElement('span');
  span.textContent = text;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.classList.add('delete-btn');

  // Delete button logic
  deleteBtn.addEventListener('click', function() {
    li.remove();
  });

  li.appendChild(span);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}
