const regexEmail = /^[A-Za-z0-9._%+-]+@gmail\.com$/ // A-Z: có chữ in hoa | a-z: có chữ thường | 0-9: có số | ._%+-: có kí tự đặc biệt => để hỗ trợ bắt lỗi người dùng nhập khi nhập sai email
const regexPwd = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{6,})$/ // {6,}: nhập từ 6 trở lên | => bắt lỗi người dùng khi nhập sai pwd

import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { styleText } from './function_validate.js';

let buttonSignUp = document.getElementById("btn-SignUp");

buttonSignUp.addEventListener("click", async () => {
    let email = document.getElementById("e-Sign").value;
    let password = document.getElementById("pwd-Sign").value;
    let confirmPwd = document.getElementById("cfPwd-Sign").value;
    let textEmail = document.getElementById("textEmailSignUp");
    let textPWD = document.getElementById("textPwdSignUp");

    styleText(textEmail);
    styleText(textPWD);

    if (!email.match(regexEmail)) {
        textEmail.innerText = "* Email không hợp lệ (cần có @gmail.com)";
        return;
    }
    if (!password.match(regexPwd)) {
        textPWD.innerText = "* Mật khẩu ít nhất 6 ký tự, 1 hoa, 1 thường, 1 số";
        return;
    }
    if (password !== confirmPwd) {
        textPWD.innerText = "* Mật khẩu không khớp";
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Đăng ký thành công!");
    } catch (error) {
        textEmail.innerText = "* Lỗi: " + error.message;
    }
});