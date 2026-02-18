
// Mock Database Initialization
const initializeDB = () => {
    if (!localStorage.getItem('users')) {
        const users = [
            { id: 1, name: 'Admin User', email: 'admin@ocps.edu', password: 'admin123', role: 'admin' },
            { id: 2, name: 'Student One', email: 'student@ocps.edu', password: 'student123', role: 'student' }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
    if (!localStorage.getItem('content')) {
        const content = [
            { id: 1, type: 'recording', title: 'Calculus I - Week 1', url: 'https://example.com/rec1', date: '2026-02-10' },
            { id: 2, type: 'assignment', title: 'Essay on Macroeconomics', url: 'https://example.com/assign1', date: '2026-02-12' }
        ];
        localStorage.setItem('content', JSON.stringify(content));
    }
};

initializeDB();

// Global Functions
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    return user;
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');

    // Update Sidebar Active State
    document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + sectionId).classList.add('active');

    // Refresh Data if needed
    if (sectionId === 'manage-students') loadStudents();
    if (sectionId === 'manage-content') loadContentAdmin();
    if (sectionId === 'recordings' || sectionId === 'assignments' || sectionId === 'student-home') loadStudentContent();
}

/* -------------------
   Login Logic
------------------- */
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const role = 'admin';
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const alertBox = document.getElementById('alert-box');

        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === email && u.password === password && u.role === role);

        if (user) {
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            alertBox.classList.add('hidden');
            window.location.href = 'admin_dashboard.html';
        } else {
            alertBox.innerText = 'Invalid admin credentials.';
            alertBox.classList.remove('hidden');
            alertBox.classList.add('alert-error');
        }
    });
}

const studentLoginForm = document.getElementById('studentLoginForm');
if (studentLoginForm) {
    studentLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const role = 'student';
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const alertBox = document.getElementById('alert-box');

        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === email && u.password === password && u.role === role);

        if (user) {
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            alertBox.classList.add('hidden');
            window.location.href = 'student_dashboard.html';
        } else {
            alertBox.innerText = 'Invalid student credentials.';
            alertBox.classList.remove('hidden');
            alertBox.classList.add('alert-error');
        }
    });
}

/* -------------------
   Admin Logic
------------------- */
// Add Student
const addStudentForm = document.getElementById('addStudentForm');
if (addStudentForm) {
    addStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-student-name').value;
        const email = document.getElementById('new-student-email').value;
        const pass = document.getElementById('new-student-pass').value;

        const users = JSON.parse(localStorage.getItem('users'));
        if (users.find(u => u.email === email)) {
            alert('User already exists!');
            return;
        }

        const newUser = { id: Date.now(), name, email, password: pass, role: 'student' };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        loadStudents();
        addStudentForm.reset();
    });
}

function loadStudents() {
    const listBody = document.getElementById('student-list-body');
    if (!listBody) return;

    const users = JSON.parse(localStorage.getItem('users')).filter(u => u.role === 'student');
    listBody.innerHTML = '';

    users.forEach(u => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td><button class="action-btn btn-danger" onclick="removeStudent(${u.id})">Remove</button></td>
        `;
        listBody.appendChild(row);
    });

    // Update dashboard count
    const countDisplay = document.getElementById('student-count');
    if (countDisplay) countDisplay.innerText = users.length;
}

window.removeStudent = function (id) {
    if (!confirm('Are you sure you want to remove this student?')) return;
    let users = JSON.parse(localStorage.getItem('users'));
    users = users.filter(u => u.id !== id);
    localStorage.setItem('users', JSON.stringify(users));
    loadStudents();
}

// Add Content
const addContentForm = document.getElementById('addContentForm');
if (addContentForm) {
    addContentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('content-type').value;
        const title = document.getElementById('content-title').value;
        const url = document.getElementById('content-url').value;

        const content = JSON.parse(localStorage.getItem('content')) || [];
        const newItem = { id: Date.now(), type, title, url, date: new Date().toISOString().split('T')[0] };
        content.push(newItem);
        localStorage.setItem('content', JSON.stringify(content));

        loadContentAdmin();
        addContentForm.reset();
    });
}

function loadContentAdmin() {
    const listBody = document.getElementById('content-list-admin');
    if (!listBody) return;

    const content = JSON.parse(localStorage.getItem('content')) || [];
    listBody.innerHTML = '';

    content.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="status-badge status-active">${c.type.toUpperCase()}</span></td>
            <td>${c.title}</td>
            <td><a href="${c.url}" target="_blank">Link</a></td>
            <td><button class="action-btn btn-danger" onclick="removeContent(${c.id})">Delete</button></td>
        `;
        listBody.appendChild(row);
    });

    // Update dashboard count
    const countDisplay = document.getElementById('content-count');
    if (countDisplay) countDisplay.innerText = content.length;
}

window.removeContent = function (id) {
    if (!confirm('Delete this content?')) return;
    let content = JSON.parse(localStorage.getItem('content'));
    content = content.filter(c => c.id !== id);
    localStorage.setItem('content', JSON.stringify(content));
    loadContentAdmin();
}

/* -------------------
   Student Logic
------------------- */
function loadStudentContent() {
    const listRecs = document.getElementById('recordings-list');
    const listAssign = document.getElementById('assignments-list');

    // Only run if elements exist
    if (!listRecs && !listAssign) return;

    const content = JSON.parse(localStorage.getItem('content')) || [];
    const recordings = content.filter(c => c.type === 'recording');
    const assignments = content.filter(c => c.type === 'assignment');

    if (listRecs) {
        if (recordings.length === 0) listRecs.innerHTML = '<p>No recordings yet.</p>';
        else {
            listRecs.innerHTML = recordings.map(r => `
                <div class="feature-card" style="text-align: left; border-left: 5px solid #0074D9;">
                    <h3>${r.title}</h3>
                    <p>Date: ${r.date}</p>
                    <a href="${r.url}" target="_blank" class="btn-login" style="display:inline-block; margin-top:0.5rem;">Watch Video</a>
                </div>
            `).join('');
        }
    }

    if (listAssign) {
        if (assignments.length === 0) listAssign.innerHTML = '<p>No assignments yet.</p>';
        else {
            listAssign.innerHTML = assignments.map(a => `
                <div class="feature-card" style="text-align: left; border-left: 5px solid #FF851B;">
                    <h3>${a.title}</h3>
                    <p>Date: ${a.date}</p>
                    <a href="${a.url}" target="_blank" class="btn-login" style="display:inline-block; margin-top:0.5rem; background-color:#FF851B;">View Assignment</a>
                </div>
            `).join('');
        }
    }

    // Update Dashboard Counts
    const recCount = document.getElementById('new-recordings-count');
    const assignCount = document.getElementById('new-assignments-count');
    if (recCount) recCount.innerText = recordings.length;
    if (assignCount) assignCount.innerText = assignments.length;
}

// Initial Loads
document.addEventListener('DOMContentLoaded', () => {
    // Determine page and load relevant data
    if (document.getElementById('admin-body')) {
        loadStudents();
        loadContentAdmin();
    }
    if (document.getElementById('student-body')) {
        loadStudentContent();
    }
});
