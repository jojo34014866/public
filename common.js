// 主题切换功能
function toggleTheme() {
    const body = document.documentElement;
    const themeButton = document.getElementById('themeToggle');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeButton.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeButton.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// 页面加载时检查主题
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const themeButton = document.getElementById('themeToggle');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeButton.textContent = '☀️';
    }
});

// 捐款模态框功能
function showDonation() {
    const modal = document.getElementById('donationModal');
    modal.style.display = 'block';
}

function hideDonation() {
    const modal = document.getElementById('donationModal');
    modal.style.display = 'none';
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('donationModal');
    if (event.target == modal) {
        hideDonation();
    }
} 