const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

function updateNavbarAuth() {
    const nameElement = document.getElementById('nameuser');
    const logoutNavItem = document.getElementById('logoutNavItem');
    const email = localStorage.getItem('loggedInEmail');

    if (nameElement) {
        if (email) {
            nameElement.textContent = email;
            nameElement.style.cursor = 'default';
            nameElement.onclick = null;
        } else {
            nameElement.textContent = 'Đăng nhập';
            nameElement.style.cursor = 'pointer';
            nameElement.onclick = () => {
                window.location.href = 'formRegister.html';
            };
        }
    }

    if (logoutNavItem) {
        logoutNavItem.style.display = email ? '' : 'none';
    }
}

async function handleLogout() {
    try {
        const { auth } = await import('./firebase-config.js');
        const { signOut } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js');
        await signOut(auth);
    } catch (error) {
        console.warn('Đăng xuất Firebase:', error);
    }

    localStorage.removeItem('loggedInEmail');
    window.location.href = 'formRegister.html';
}

document.addEventListener('DOMContentLoaded', () => {
    if (signUpButton && signInButton && container) {
        signUpButton.addEventListener('click', () => {
            container.classList.add('right-panel-active');
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove('right-panel-active');
        });
    }

    updateNavbarAuth();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});