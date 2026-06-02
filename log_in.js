
import { auth, googleProvider } from "./firebase-config.js";
import { signInWithEmailAndPassword, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const buttonLogIn = document.getElementById("btn-Login");
const icon = document.querySelector(".fa-google-plus-g");
const googleBtn = icon ? icon.parentElement : null;

if (buttonLogIn) {
    buttonLogIn.addEventListener("click", async () => {
        const email = document.getElementById("email-Login").value;
        const password = document.getElementById("pwd-Login").value;
        const textLogin = document.getElementById("textLogin");

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            localStorage.setItem("loggedInEmail", email);
            alert("Đăng nhập thành công!");
            window.location.href = "index.html";
            if (textLogin) textLogin.innerText = "";
        } catch (error) {
            if (textLogin) {
                textLogin.style.color = "red";
                textLogin.innerText = "* Sai tài khoản hoặc mật khẩu";
            }
        }
    });
}

if (googleBtn) {
    googleBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result?.user?.email) {
                localStorage.setItem("loggedInEmail", result.user.email);
            }
            alert("Chào mừng " + result.user.displayName);
        } catch (error) {
            console.error(error);
        }
    });
}


































