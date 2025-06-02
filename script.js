// DOM Elements
const sidebar = document.querySelector('.sidebar');
const menuIcon = document.querySelector('.menu-icon');
const themeToggle = document.querySelector('.theme-toggle');
const taskList = document.querySelector('.task-list');
const addTaskBtn = document.querySelector('.add-task-btn');
const modal = document.getElementById('taskModal');
const closeModalBtn = document.querySelector('.close-modal');
const cancelBtn = document.querySelector('.cancel-btn');
const taskForm = document.getElementById('taskForm');
const navLinks = document.querySelectorAll('.nav-link');
const summaryCards = document.querySelectorAll('.summary-card .card-info h3');
const progressPercentage = document.querySelector('.progress-percentage');
const welcomeText = document.querySelector('.welcome-text p .highlight');
const mainContent = document.querySelector('.main-content');

// Task storage (fallback to array if localStorage is unavailable)
let tasks = (typeof localStorage !== 'undefined' && localStorage.getItem('tasks') 
    ? JSON.parse(localStorage.getItem('tasks')) 
    : []) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log('Initializing application...');
    setupEventListeners();
    loadUserPreferences();
    renderTasks();
    updateSummaryCards();
    renderTaskProgress();
    renderTaskBreakdown();
}

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Toggle sidebar on mobile
    if (menuIcon) {
        menuIcon.addEventListener('click', toggleSidebar);
    }
    
    // Toggle theme mode
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Modal controls
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', openTaskModal);
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeTaskModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeTaskModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeTaskModal();
        }
    });
    
    // Submit form
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmit);
    }
    
    // Task actions
    if (taskList) {
        taskList.addEventListener('click', handleTaskActions);
    }
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
}

// Toggle sidebar on mobile
function toggleSidebar() {
    console.log('Toggling sidebar...');
    sidebar.classList.toggle('active');
}

// Theme Toggle
function toggleTheme() {
    console.log('Toggling theme...');
    const body = document.body;
    body.classList.toggle('dark-mode');
    
    // Update icon
    const themeIcon = themeToggle.querySelector('i');
    if (body.classList.contains('dark-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('theme', 'dark');
        }
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('theme', 'light');
        }
    }
}

// Load user preferences (theme)
function loadUserPreferences() {
    console.log('Loading user preferences...');
    if (typeof localStorage !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            const themeIcon = themeToggle.querySelector('i');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
}

// Task Modal Functions
function openTaskModal() {
    console.log('Opening task modal...');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeTaskModal() {
    console.log('Closing task modal...');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    taskForm.reset(); // Clear form
}

// Open edit modal with task data
function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskDate').value = task.date;
    document.getElementById('taskTime').value = task.time;
    document.getElementById('taskCategory').value = task.category;
    document.querySelector(`input[name="priority"][value="${task.priority}"]`).checked = true;
    document.getElementById('editTaskId').value = task.id;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    navLinks.forEach(link => link.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const section = e.currentTarget.querySelector('span').textContent;
    if (section === 'Dashboard') {
        location.reload();
    } else if (section === 'Calendar') {
        renderCalendarSection();
    } else if (section === 'Tasks') {
        mainContent.innerHTML = `
            <div class="header"><button class="menu-icon"><i class="fas fa-bars"></i></button><div class="profile"></div></div>
            <div class="tasks-section">
                <div class="card-header"><h3>All Tasks</h3></div>
                <div class="task-list"></div>
            </div>
        `;
        document.querySelector('.menu-icon').addEventListener('click', toggleSidebar);
        // Render all tasks in the new section
        const newTaskList = document.querySelector('.task-list');
        tasks.forEach(task => {
            const percent = task.status === 'completed' ? 100 : 0;
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.setAttribute('data-id', task.id);
            taskItem.innerHTML = `
                <div class="task-status ${task.status}"></div>
                <div class="task-content">
                    <h3>${task.title}</h3>
                    <p>${task.description || 'No description'}</p>
                    <div class="task-meta">
                        <span class="task-tag ${task.category}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                        <span class="task-time">${task.date}${task.time ? ' ' + task.time : ''}</span>
                        <span class="task-priority">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                    </div>
                    <div class="task-progress-bar-bg"><div class="task-progress-bar-fill" style="width:${percent}%;"></div></div>
                    <div class="task-progress-label">Completed: ${percent}%</div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn" title="Edit Task"><i class="fas fa-edit"></i></button>
                    <button class="task-action-btn complete-btn" title="Mark as ${task.status === 'completed' ? 'Pending' : 'Completed'}"><i class="fas fa-check"></i></button>
                    <button class="task-action-btn delete-btn" title="Delete Task"><i class="fas fa-trash"></i></button>
                </div>
            `;
            newTaskList.appendChild(taskItem);
        });
        newTaskList.addEventListener('click', handleTaskActions);
    } else if (section === 'Analytics') {
        renderAnalyticsSection();
    } else if (section === 'Settings') {
        renderSettingsSection();
    }
}

// Calendar UI: show tasks by date
function renderCalendarSection() {
    // Group tasks by date
    const tasksByDate = {};
    tasks.forEach(task => {
        if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
        tasksByDate[task.date].push(task);
    });
    // Get sorted dates
    const sortedDates = Object.keys(tasksByDate).sort();
    let calendarHtml = `<div class="header"><button class="menu-icon"><i class="fas fa-bars"></i></button><div class="profile"></div></div>`;
    calendarHtml += `<div class="calendar-section">
        <h2>Calendar</h2>
        <div class="calendar-list">`;
    if (sortedDates.length === 0) {
        calendarHtml += `<div class="calendar-placeholder">No tasks scheduled.</div>`;
    } else {
        sortedDates.forEach(date => {
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            calendarHtml += `<div class="calendar-date-block">
                <div class="calendar-date-title">${formattedDate}</div>
                <ul class="calendar-task-list">`;
            tasksByDate[date].forEach(task => {
                calendarHtml += `<li class="calendar-task-item">
                    <span class="calendar-task-title">${task.title}</span>
                    <span class="calendar-task-time">${task.time || ''}</span>
                    <span class="calendar-task-status ${task.status}">${task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                </li>`;
            });
            calendarHtml += `</ul></div>`;
        });
    }
    calendarHtml += `</div></div>`;
    mainContent.innerHTML = calendarHtml;
    document.querySelector('.menu-icon').addEventListener('click', toggleSidebar);
}

// Handle task submission
function handleTaskSubmit(e) {
    e.preventDefault();
    console.log('Handling task submission...');
    const title = document.getElementById('taskTitle').value;
    const date = document.getElementById('taskDate').value;
    if (!title || !date) {
        alert('Please fill in the task title and due date.');
        return;
    }
    const description = document.getElementById('taskDescription').value;
    const time = document.getElementById('taskTime').value;
    const category = document.getElementById('taskCategory').value;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    const editId = document.getElementById('editTaskId').value;
    if (editId) {
        // Edit existing task
        tasks = tasks.map(task => {
            if (task.id == editId) {
                return { ...task, title, description, date, time, category: category !== 'default' ? category : 'uncategorized', priority };
            }
            return task;
        });
    } else {
        // Add new task
        const status = 'pending';
        const taskId = Date.now();
        const task = { id: taskId, title, description, date, time, category: category !== 'default' ? category : 'uncategorized', priority, status };
        tasks.push(task);
    }
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    renderTasks();
    updateSummaryCards();
    renderTaskProgress();
    renderTaskBreakdown();
    closeTaskModal();
    document.getElementById('modalTitle').textContent = 'Add New Task';
    document.getElementById('editTaskId').value = '';
}

// Render tasks
function renderTasks() {
    console.log('Rendering tasks...');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const percent = typeof task.percent === 'number' ? task.percent : (task.status === 'completed' ? 100 : 0);
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.setAttribute('data-id', task.id);
        taskItem.innerHTML = `
            <div class="task-status ${task.status}"></div>
            <div class="task-content">
                <h3>${task.title}</h3>
                <p>${task.description || 'No description'}</p>
                <div class="task-meta">
                    <span class="task-tag ${task.category}">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                    <span class="task-time">${task.date}${task.time ? ' ' + task.time : ''}</span>
                    <span class="task-priority">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                </div>
                <div class="task-progress-bar-bg"><div class="task-progress-bar-fill" style="width:${percent}%;"></div></div>
                <div class="task-progress-label">Completed: <span class="task-percent-value">${percent}</span>% <button class="task-action-btn percent-edit-btn" title="Edit Completion"><i class="fas fa-pen"></i></button></div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" title="Edit Task"><i class="fas fa-edit"></i></button>
                <button class="task-action-btn complete-btn" title="Mark as ${task.status === 'completed' ? 'Pending' : 'Completed'}"><i class="fas fa-check"></i></button>
                <button class="task-action-btn delete-btn" title="Delete Task"><i class="fas fa-trash"></i></button>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
    renderTaskBreakdown();
}

// Analytics UI
function renderAnalyticsSection() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const percent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    mainContent.innerHTML = `
        <div class="header"><button class="menu-icon"><i class="fas fa-bars"></i></button><div class="profile"></div></div>
        <div class="analytics-section amazing-analytics">
            <h2>Analytics</h2>
            <div class="analytics-cards">
                <div class="analytics-card total">
                    <i class="fas fa-tasks"></i>
                    <div>
                        <h3>${totalTasks}</h3>
                        <p>Total Tasks</p>
                    </div>
                </div>
                <div class="analytics-card completed">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <h3>${completedTasks}</h3>
                        <p>Completed</p>
                    </div>
                </div>
                <div class="analytics-card in-progress">
                    <i class="fas fa-spinner"></i>
                    <div>
                        <h3>${inProgressTasks}</h3>
                        <p>In Progress</p>
                    </div>
                </div>
                <div class="analytics-card pending">
                    <i class="fas fa-clock"></i>
                    <div>
                        <h3>${pendingTasks}</h3>
                        <p>Pending</p>
                    </div>
                </div>
            </div>
            <div class="analytics-progress">
                <div class="analytics-progress-label">Overall Completed: <span>${percent}%</span></div>
                <div class="analytics-progress-bar-bg"><div class="analytics-progress-bar-fill" style="width:${percent}%;"></div></div>
            </div>
        </div>
    `;
    document.querySelector('.menu-icon').addEventListener('click', toggleSidebar);
}

// Render weekly progress bar
function renderWeeklyProgressBar() {
    // Get tasks per weekday (0=Sunday, 1=Monday, ...)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekCounts = [0, 0, 0, 0, 0, 0, 0];
    tasks.forEach(task => {
        if (task.date) {
            const d = new Date(task.date);
            if (!isNaN(d)) {
                weekCounts[d.getDay()]++;
            }
        }
    });
    // Find max for scaling
    const maxCount = Math.max(...weekCounts, 1);
    // Build HTML
    const barHtml = `
        <div class="weekly-progress-bar">
            ${weekCounts.map((count, i) => `
                <div class="weekly-bar-item">
                    <div class="weekly-bar" style="height:${(count/maxCount)*100}%" title="${weekDays[i]}: ${count} tasks"></div>
                    <div class="weekly-label">${weekDays[i]}</div>
                </div>
            `).join('')}
        </div>
    `;
    // Insert into analytics section (after .progress-card)
    const analyticsSection = document.querySelector('.task-analytics');
    if (analyticsSection && !document.querySelector('.weekly-progress-bar')) {
        const progressCard = analyticsSection.querySelector('.progress-card');
        if (progressCard) {
            progressCard.insertAdjacentHTML('afterend', `
                <div class="weekly-progress-section">
                    <div class="card-header"><h3>Weekly Task Progress</h3></div>
                    ${barHtml}
                </div>
            `);
        }
    }
}

// Call after rendering analytics
function renderTaskProgress() {
    console.log('Rendering task progress...');
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    
    const completedPercentage = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
    const inProgressPercentage = totalTasks ? (inProgressTasks / totalTasks) * 100 : 0;
    const pendingPercentage = totalTasks ? (pendingTasks / totalTasks) * 100 : 0;
    
    // Update donut chart
    const donutChart = document.querySelector('.donut-chart');
    if (donutChart) {
        donutChart.style.background = `conic-gradient(
            var(--primary-color) 0% ${completedPercentage}%,
            var(--warning-color) ${completedPercentage}% ${completedPercentage + inProgressPercentage}%,
            var(--danger-color) ${completedPercentage + inProgressPercentage}% 100%
        )`;
    }
    
    // Update progress percentage
    if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(completedPercentage)}%`;
    }
    renderWeeklyProgressBar();
}

// Settings UI with signup/login
function renderSettingsSection() {
    const userData = getUserData();
    mainContent.innerHTML = `
        <div class="settings-modern">
            <h1 class="settings-title">Settings</h1>
            <div class="settings-content">
                <div class="settings-user-info">
                    <p><strong>Username:</strong> ${userData?.username || userData?.name || ''}</p>
                    <p><strong>Email:</strong> ${userData?.email || ''}</p>
                </div>
                <button class="settings-logout-btn btn btn-secondary" style="margin-top:2rem;width:100%;font-size:1.1rem;">Logout</button>
            </div>
        </div>
    `;
    document.querySelector('.settings-logout-btn').addEventListener('click', function() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
        }
        window.location.href = 'login.html';
    });
}

// Auth logic
function showAuthPage() {
    const authContainer = document.getElementById('authContainer');
    const userData = getUserData();
    if (!userData || !userData.signedUp) {
        // Show signup
        authContainer.innerHTML = `
            <div class="auth-card">
                <h2>Sign Up</h2>
                <form id="signupForm">
                    <input type="text" id="signupName" placeholder="Name" required class="form-control">
                    <input type="email" id="signupEmail" placeholder="Email" required class="form-control">
                    <input type="password" id="signupPassword" placeholder="Password" required class="form-control">
                    <button type="submit" class="btn btn-primary">Sign Up</button>
                </form>
            </div>
        `;
        document.getElementById('signupForm').addEventListener('submit', handleSignup);
    } else {
        // Show login
        authContainer.innerHTML = `
            <div class="auth-card">
                <h2>Login</h2>
                <form id="loginForm">
                    <input type="email" id="loginEmail" placeholder="Email" required class="form-control">
                    <input type="password" id="loginPassword" placeholder="Password" required class="form-control">
                    <button type="submit" class="btn btn-primary">Login</button>
                </form>
            </div>
        `;
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const userData = { username: name, email, password, signedUp: true };
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(userData));
    }
    // Optionally save to Login .json
    try {
        fetch('Login .json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
    } catch {}
    alert('Signup successful! Please login.');
    signupCard.style.display = 'none';
    loginCard.style.display = 'flex';
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.email === email && userData.password === password) {
        // Set session and redirect to dashboard
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'index1.html';
    } else {
        alert('Invalid credentials!');
    }
}

function getUserData() {
    if (typeof localStorage !== 'undefined') {
        return JSON.parse(localStorage.getItem('userData'));
    }
    return null;
}

// Save user to a separate JSON file (simulate by localStorage and also write to json file)
function saveUserToJson(user) {
    if (typeof localStorage !== 'undefined') {
        let users = JSON.parse(localStorage.getItem('usersJson') || '[]');
        users.push(user);
        localStorage.setItem('usersJson', JSON.stringify(users));
        // Also save to json file (for desktop app/electron/Node.js, here we simulate by sending to backend or writing to file)
        fetch('json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users)
        }).catch(() => {});
    }
}

// Render Task Breakdown
function renderTaskBreakdown() {
    const breakdownEl = document.querySelector('.task-breakdown');
    if (!breakdownEl) return;
    // New categories
    const categories = ['personal', 'study', 'health', 'other'];
    const categoryCounts = {};
    categories.forEach(cat => categoryCounts[cat] = 0);
    tasks.forEach(task => {
        const cat = categories.includes(task.category) ? task.category : 'other';
        categoryCounts[cat]++;
    });
    // Count by priority
    const priorities = ['low', 'medium', 'high'];
    const priorityCounts = { low: 0, medium: 0, high: 0 };
    tasks.forEach(task => {
        if (priorities.includes(task.priority)) priorityCounts[task.priority]++;
    });
    // Count by status
    const statuses = ['completed', 'in-progress', 'pending'];
    const statusCounts = { completed: 0, 'in-progress': 0, pending: 0 };
    tasks.forEach(task => {
        if (statuses.includes(task.status)) statusCounts[task.status]++;
    });
    // Build HTML
    breakdownEl.innerHTML = `
        <div class="card-header"><h3>Task Breakdown</h3></div>
        <div class="breakdown-section">
            <div class="breakdown-group">
                <h4>By Category</h4>
                <ul>
                    <li>Personal: <b>${categoryCounts.personal}</b></li>
                    <li>Study: <b>${categoryCounts.study}</b></li>
                    <li>Health: <b>${categoryCounts.health}</b></li>
                    <li>Other: <b>${categoryCounts.other}</b></li>
                </ul>
            </div>
            <div class="breakdown-group">
                <h4>By Priority</h4>
                <ul>
                    <li>Low: <b>${priorityCounts.low}</b></li>
                    <li>Medium: <b>${priorityCounts.medium}</b></li>
                    <li>High: <b>${priorityCounts.high}</b></li>
                </ul>
            </div>
            <div class="breakdown-group">
                <h4>By Status</h4>
                <ul>
                    <li>Completed: <b>${statusCounts.completed}</b></li>
                    <li>In Progress: <b>${statusCounts['in-progress']}</b></li>
                    <li>Pending: <b>${statusCounts.pending}</b></li>
                </ul>
            </div>
        </div>
    `;
}

// Handle task actions (complete, delete, edit, percent-edit)
function handleTaskActions(e) {
    console.log('Handling task actions...');
    const taskId = parseInt(e.target.closest('.task-item')?.dataset.id);
    if (!taskId) return;
    if (e.target.closest('.edit-btn')) {
        openEditTaskModal(taskId);
        return;
    }
    if (e.target.closest('.percent-edit-btn')) {
        editTaskPercent(taskId, e.target.closest('.task-item'));
        return;
    }
    if (e.target.closest('.complete-btn')) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                task.status = task.status === 'completed' ? 'pending' : 'completed';
                if (task.status === 'completed') task.percent = 100;
                else if (typeof task.percent === 'number') task.percent = 0;
            }
            return task;
        });
    } else if (e.target.closest('.delete-btn')) {
        tasks = tasks.filter(task => task.id !== taskId);
    }
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    renderTasks();
    updateSummaryCards();
    renderTaskProgress();
    renderTaskBreakdown();
}

// Edit task percent inline
function editTaskPercent(taskId, taskItemEl) {
    const percentSpan = taskItemEl.querySelector('.task-percent-value');
    const oldValue = percentSpan.textContent;
    percentSpan.innerHTML = `<input type='number' min='0' max='100' value='${oldValue}' style='width:50px;'>`;
    const input = percentSpan.querySelector('input');
    input.focus();
    input.addEventListener('blur', () => saveTaskPercent(taskId, input.value));
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            saveTaskPercent(taskId, input.value);
        }
    });
}
function saveTaskPercent(taskId, value) {
    let percent = parseInt(value);
    if (isNaN(percent) || percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            task.percent = percent;
            task.status = percent === 100 ? 'completed' : (percent === 0 ? 'pending' : 'in-progress');
        }
        return task;
    });
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    renderTasks();
    updateSummaryCards();
    renderTaskProgress();
}

// On load, show signup/login if not signed up
window.addEventListener('DOMContentLoaded', () => {
    const userData = getUserData();
    if (!userData || !userData.signedUp) {
        renderSettingsSection();
    } else {
        init();
    }
});

// On index1.html, redirect to login if not logged in
if (window.location.pathname.endsWith('index1.html')) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
}

// Update summary cards
function updateSummaryCards() {
    console.log('Updating summary cards...');
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const dueToday = tasks.filter(task => {
        const today = new Date().toISOString().split('T')[0];
        return task.date === today;
    }).length;
    
    // Update summary card values
    if (summaryCards[0]) summaryCards[0].textContent = totalTasks;
    if (summaryCards[1]) summaryCards[1].textContent = completedTasks;
    if (summaryCards[2]) summaryCards[2].textContent = inProgressTasks;
    if (summaryCards[3]) summaryCards[3].textContent = pendingTasks;
    if (welcomeText) welcomeText.textContent = dueToday;
}

// Render task progress
function renderTaskProgress() {
    console.log('Rendering task progress...');
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    
    const completedPercentage = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
    const inProgressPercentage = totalTasks ? (inProgressTasks / totalTasks) * 100 : 0;
    const pendingPercentage = totalTasks ? (pendingTasks / totalTasks) * 100 : 0;
    
    // Update donut chart
    const donutChart = document.querySelector('.donut-chart');
    if (donutChart) {
        donutChart.style.background = `conic-gradient(
            var(--primary-color) 0% ${completedPercentage}%,
            var(--warning-color) ${completedPercentage}% ${completedPercentage + inProgressPercentage}%,
            var(--danger-color) ${completedPercentage + inProgressPercentage}% 100%
        )`;
    }
    
    // Update progress percentage
    if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(completedPercentage)}%`;
    }
    renderWeeklyProgressBar();
}

// Login/Signup page logic for login.html
if (window.location.pathname.endsWith('login.html')) {
    document.body.classList.add('login-page');
    // Toggle between login and signup
    const loginCard = document.querySelector('.auth-card');
    const signupCard = document.getElementById('signupCard');
    document.getElementById('showSignup').onclick = function(e) {
        e.preventDefault();
        loginCard.style.display = 'none';
        signupCard.style.display = 'flex';
    };
    document.getElementById('showLogin').onclick = function(e) {
        e.preventDefault();
        signupCard.style.display = 'none';
        loginCard.style.display = 'flex';
    };
    // Signup logic
    document.getElementById('signupForm').onsubmit = function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const userData = { username: name, email, password, signedUp: true };
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('userData', JSON.stringify(userData));
        }
        // Optionally save to Login .json
        try {
            fetch('Login .json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        } catch {}
        alert('Signup successful! Please login.');
        signupCard.style.display = 'none';
        loginCard.style.display = 'flex';
    };
    // Login logic
    document.getElementById('loginForm').onsubmit = function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData.email === email && userData.password === password) {
            // Set session and redirect to dashboard
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'index1.html';
        } else {
            alert('Invalid credentials!');
        }
    };
}