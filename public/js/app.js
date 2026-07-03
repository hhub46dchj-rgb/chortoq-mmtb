const API_BASE = '/api';
let currentUser = null;
let token = localStorage.getItem('token');
let allPosts = [];
let categoryChart = null;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
    }, 1500);

    initTheme();
    initNavigation();
    initAuthTabs();
    initFileUpload();
    initSearch();
    initUserMenu();

    if (token) {
        loadUserProfile();
    }

    loadPosts();
    loadStats();
}

// THEME
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('themeToggleHeader').addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const icons = document.querySelectorAll('.theme-toggle i, #themeToggleHeader i');
    icons.forEach(icon => {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
}

// NAVIGATION
function initNavigation() {
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');

    menuBtn.addEventListener('click', () => sidebar.classList.add('active'));
    sidebarClose.addEventListener('click', () => sidebar.classList.remove('active'));

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            showSection(section);
            sidebar.classList.remove('active');
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });

    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
    }

    if (['news', 'leadership', 'facilities', 'statistics', 'vacancies', 'reception', 'gallery', 'contact'].includes(sectionId)) {
        loadPostsByCategory(sectionId);
    }

    if (sectionId === 'statistics') {
        loadStats();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// AUTH TABS
function initAuthTabs() {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.getAttribute('data-tab');
            document.getElementById('loginForm').classList.toggle('hidden', tabName !== 'login');
            document.getElementById('registerForm').classList.toggle('hidden', tabName !== 'register');
        });
    });
}

// USER MENU
function initUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('userDropdown');
    
    userMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
}

// SEARCH
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length > 0) {
            searchPosts(query);
        } else {
            loadPosts();
        }
    });
}

function searchPosts(query) {
    const filtered = allPosts.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query)
    );
    renderPosts('homePosts', filtered);
}

// FILE UPLOAD
function initFileUpload() {
    const fileInput = document.getElementById('postImage');
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    preview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function removeImage() {
    document.getElementById('postImage').value = '';
    document.getElementById('imagePreview').classList.add('hidden');
}

// API CALLS
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Xatolik yuz berdi');
    }
    
    return data;
}

// AUTH
async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
        showToast('Login va parolni kiriting!', 'error');
        return;
    }

    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        token = data.token;
        localStorage.setItem('token', token);
        currentUser = data.user;
        
        updateUserUI();
        showToast(data.message, 'success');
        
        if (currentUser.role === 'admin') {
            showSection('adminDashboard');
            loadAdminPosts();
        } else {
            showSection('userProfile');
            updateProfileUI();
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleRegister() {
    const username = document.getElementById('regUsername').value.trim();
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (!username || !password) {
        showToast('Login va parol shart!', 'error');
        return;
    }

    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, fullName, email })
        });

        token = data.token;
        localStorage.setItem('token', token);
        currentUser = data.user;
        
        updateUserUI();
        showToast(data.message, 'success');
        showSection('userProfile');
        updateProfileUI();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadUserProfile() {
    try {
        const data = await apiCall('/auth/me');
        currentUser = data.user;
        updateUserUI();
    } catch (error) {
        localStorage.removeItem('token');
        token = null;
        currentUser = null;
    }
}

function handleLogout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    updateUserUI();
    showSection('home');
    showToast('Tizimdan chiqdingiz', 'info');
}

function updateUserUI() {
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const authBtn = document.getElementById('authBtn');

    if (currentUser) {
        userName.textContent = currentUser.fullName || currentUser.username;
        userAvatar.innerHTML = `<span>${currentUser.username.charAt(0).toUpperCase()}</span>`;
        authBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Chiqish`;
        authBtn.onclick = handleLogout;
        
        if (currentUser.role === 'admin') {
            document.body.classList.add('admin');
        } else {
            document.body.classList.remove('admin');
        }
    } else {
        userName.textContent = 'Mehmon';
        userAvatar.innerHTML = '<i class="fas fa-user"></i>';
        authBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Kirish`;
        authBtn.onclick = () => showSection('auth');
        document.body.classList.remove('admin');
    }
}

function updateProfileUI() {
    if (currentUser) {
        document.getElementById('profileFullName').textContent = currentUser.fullName || 'Belgilanmagan';
        document.getElementById('profileUsername').textContent = `@${currentUser.username}`;
        document.getElementById('profileEmail').textContent = currentUser.email || 'Email kiritilmagan';
    }
}

// POSTS
async function loadPosts() {
    try {
        const data = await apiCall('/posts');
        allPosts = data.posts;
        
        renderPosts('homePosts', allPosts.slice(0, 6));
        
        document.getElementById('statPosts').textContent = allPosts.length;
    } catch (error) {
        console.error('Postlarni yuklashda xatolik:', error);
    }
}

async function loadPostsByCategory(section) {
    const categoryMap = {
        'news': 'yangiliklar',
        'leadership': 'rahbariyat',
        'facilities': 'muassasalar',
        'statistics': 'statistika',
        'vacancies': 'vakansiyalar',
        'reception': 'virtual-qabulxona',
        'gallery': 'galereya',
        'contact': null
    };

    const category = categoryMap[section];
    
    if (section === 'contact') {
        renderPosts('contactPosts', []);
        return;
    }

    try {
        const data = await apiCall(`/posts?category=${category}`);
        renderPosts(`${section}Posts`, data.posts);
    } catch (error) {
        console.error('Postlarni yuklashda xatolik:', error);
    }
}

function renderPosts(containerId, posts) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Hozircha ma'lumotlar yo'q</p>
            </div>
        `;
        return;
    }

    container.innerHTML = posts.map(post => createPostCard(post)).join('');
}

function createPostCard(post) {
    const imageUrl = post.image || 'https://via.placeholder.com/400x200?text=CHORTOQMMTB';
    const excerpt = post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content;
    const date = new Date(post.createdAt).toLocaleDateString('uz-UZ');
    const categoryNames = {
        'yangiliklar': 'Yangiliklar',
        'rahbariyat': 'Rahbariyat',
        'muassasalar': 'Muassasalar',
        'statistika': 'Statistika',
        'vakansiyalar': 'Vakansiyalar',
        'virtual-qabulxona': 'Virtual Qabulxona',
        'galereya': 'Galereya'
    };

    const deleteBtn = currentUser && currentUser.role === 'admin' 
        ? `<button class="post-card-delete" onclick="deletePost('${post._id}', event)"><i class="fas fa-trash"></i></button>`
        : '';

    return `
        <div class="post-card animate-in" onclick="openPost('${post._id}')">
            ${deleteBtn}
            <img src="${imageUrl}" alt="${post.title}" class="post-card-image">
            <div class="post-card-body">
                <span class="post-card-category">${categoryNames[post.category] || post.category}</span>
                <h3 class="post-card-title">${post.title}</h3>
                <p class="post-card-excerpt">${excerpt}</p>
                <div class="post-card-footer">
                    <span class="post-card-author">
                        <i class="fas fa-user"></i> ${post.author?.fullName || post.author?.username || 'Admin'}
                    </span>
                    <span class="post-card-views">
                        <i class="fas fa-eye"></i> ${post.views || 0}
                    </span>
                </div>
            </div>
        </div>
    `;
}

async function openPost(id) {
    try {
        const post = await apiCall(`/posts/${id}`);
        
        document.getElementById('detailTitle').textContent = post.title;
        document.getElementById('detailAuthor').textContent = post.author?.fullName || post.author?.username || 'Admin';
        document.getElementById('detailDate').textContent = new Date(post.createdAt).toLocaleDateString('uz-UZ');
        document.getElementById('detailViews').textContent = post.views;
        document.getElementById('detailImage').src = post.image || 'https://via.placeholder.com/800x400?text=CHORTOQMMTB';
        document.getElementById('detailContent').textContent = post.content;
        
        showSection('postDetail');
    } catch (error) {
        showToast('Ma\'lumotni yuklashda xatolik', 'error');
    }
}

function goBack() {
    showSection('home');
}

// ADMIN
async function loadAdminPosts() {
    try {
        const data = await apiCall('/posts');
        renderAdminPosts(data.posts);
        loadStats();
    } catch (error) {
        console.error('Admin postlarni yuklashda xatolik:', error);
    }
}

function renderAdminPosts(posts) {
    const container = document.getElementById('adminPostsList');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Hozircha ma'lumotlar yo'q</p>
            </div>
        `;
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="admin-post-item">
            <div class="admin-post-info">
                <div class="admin-post-title">${post.title}</div>
                <div class="admin-post-category">${post.category}</div>
            </div>
            <div class="admin-post-actions">
                <button class="edit-btn" onclick="editPost('${post._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deletePost('${post._id}', event)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function savePost() {
    const category = document.getElementById('postCategory').value;
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    const imageFile = document.getElementById('postImage').files[0];
    const tags = document.getElementById('postTags').value;

    if (!title || !content) {
        showToast('Sarlavha va matn shart!', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('title', title);
    formData.append('content', content);
    if (imageFile) {
        formData.append('image', imageFile);
    }
    if (tags) {
        formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim())));
    }

    try {
        const response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        showToast(data.message, 'success');
        
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
        document.getElementById('postImage').value = '';
        document.getElementById('postTags').value = '';
        document.getElementById('imagePreview').classList.add('hidden');

        loadAdminPosts();
        loadPosts();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deletePost(id, event) {
    event.stopPropagation();
    
    document.getElementById('confirmModal').classList.add('show');
    document.getElementById('confirmBtn').onclick = async () => {
        try {
            await apiCall(`/posts/${id}`, { method: 'DELETE' });
            showToast("Ma'lumot o'chirildi!", 'success');
            loadAdminPosts();
            loadPosts();
        } catch (error) {
            showToast(error.message, 'error');
        }
        closeModal();
    };
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

// STATS
async function loadStats() {
    try {
        const data = await apiCall('/stats');
        
        document.getElementById('totalPosts').textContent = data.totalPosts;
        document.getElementById('totalViews').textContent = data.totalViews;
        document.getElementById('totalUsers').textContent = data.totalUsers;
        document.getElementById('statUsers').textContent = '1,250';
        document.getElementById('statTeachers').textContent = '85';
        
        if (currentUser && currentUser.role === 'admin') {
            document.getElementById('adminTotalPosts').textContent = data.totalPosts;
            document.getElementById('adminTotalViews').textContent = data.totalViews;
            document.getElementById('adminTotalUsers').textContent = data.totalUsers;
        }

        renderCategoryChart(data.postsByCategory);
        renderTopPosts(data.topViewedPosts);
    } catch (error) {
        console.error('Statistikani yuklashda xatolik:', error);
    }
}

function renderCategoryChart(data) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (categoryChart) {
        categoryChart.destroy();
    }

    const categoryNames = {
        'yangiliklar': 'Yangiliklar',
        'rahbariyat': 'Rahbariyat',
        'muassasalar': 'Muassasalar',
        'statistika': 'Statistika',
        'vakansiyalar': 'Vakansiyalar',
        'virtual-qabulxona': 'Virtual Qabulxona',
        'galereya': 'Galereya'
    };

    const labels = data.map(item => categoryNames[item._id] || item._id);
    const values = data.map(item => item.count);
    const colors = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 16,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function renderTopPosts(posts) {
    const container = document.getElementById('topPostsList');
    if (!container) return;

    container.innerHTML = posts.map((post, index) => `
        <div class="top-post-item">
            <div class="top-post-rank">${index + 1}</div>
            <div class="top-post-info">
                <div class="top-post-title">${post.title}</div>
                <div class="top-post-views">${post.views} marta ko'rilgan</div>
            </div>
        </div>
    `).join('');
}

// TOAST
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    toastIcon.className = `toast-icon ${icons[type]}`;

    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
