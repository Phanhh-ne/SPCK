import { styleText, validateEmail, validatePassword } from "./function_validate.js";

let buttonLogIn = document.getElementById("btn-Login")

buttonLogIn.addEventListener("click", () => {
    let emailLogin = document.getElementById("email-Login").value
    let pwdLogin = document.getElementById("pwd-Login").value

    let textLogin = document.getElementById("textLogin")
    styleText(textLogin) // giúp chia file và tối ưu code hơn

    let getLocalStorage = localStorage.getItem("userList")
    if (getLocalStorage === null || getLocalStorage.length === undefined) {
        textLogin.innerText = "* Tài khoản không tồn tại"
    } else {
        let isvalueEmail = validateEmail(emailLogin)
        let isvaluepwd = validatePassword(pwdLogin)
        
        if (isvalueEmail && isvaluepwd) { // nếu 2 cái đó true
            window.location.href = "index.html"
            textLogin.innerText = ""
        } else {
            textLogin.innerText = "* Vui lòng kiểm tra lại tài khoản hoặc mật khẩu"
        }
    }
})




































