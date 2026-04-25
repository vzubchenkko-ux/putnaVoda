document.addEventListener('DOMContentLoaded', async () => {
    // Перевірка прав адміністратора
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    await loadAdminDashboard();
});

async function loadAdminDashboard() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Завантаження статистики
        const statsResponse = await fetch('/api/admin/statistics', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            updateDashboardStats(stats);
        }

        // Завантаження останньої активності
        const activityResponse = await fetch('/api/admin/activity', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (activityResponse.ok) {
            const activities = await activityResponse.json();
            updateActivityList(activities);
        }
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
        showError('Помилка завантаження даних панелі адміністратора');
    }
}

function updateDashboardStats(stats) {
    document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
    document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
    document.getElementById('monthlyRevenue').textContent = 
        `${(stats.monthlyRevenue || 0).toLocaleString()} ₴`;
}

function updateActivityList(activities) {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';

    if (activities.length === 0) {
        activityList.innerHTML = '<p>Немає нової активності</p>';
        return;
    }

    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <p><strong>${activity.type}</strong>: ${activity.description}</p>
            <small>${new Date(activity.timestamp).toLocaleString()}</small>
        `;
        activityList.appendChild(activityItem);
    });
}

function showError(message) {
    // Можна додати власну реалізацію показу помилок
    alert(message);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
} 