import { styleText, validateEmail } from './function_validate.js' // dùng để dùng function được viết bên file kia
const regexEmail = /^[A-Za-z0-9._%+-]+@gmail\.com$/ // A-Z: có chữ in hoa | a-z: có chữ thường | 0-9: có số | ._%+-: có kí tự đặc biệt => để hỗ trợ bắt lỗi người dùng nhập khi nhập sai email
const regexPwd = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})$/ // {8,}: nhập từ 8 trở lên | => bắt lỗi người dùng khi nhập sai pwd

// Chứa array gồm nhiều obj chứa email và pwd
let userList = new Array()

// Truy cập vào file html lấy nút có id là btn-signup
let buttonSignUp = document.getElementById("btn-SignUp")

// Thêm event click vào nút có id là btn-signup
buttonSignUp.addEventListener("click", () => {
    let emailSignUp = document.getElementById("e-Sign").value
    let passwordSignUp = document.getElementById("pwd-Sign").value
    let cofirmpasswordSignUp = document.getElementById("cfPwd-Sign").value
    
    let textEmail = document.getElementById("textEmailSignUp")
    let textPWD = document.getElementById("textPwdSignUp")
    styleText(textEmail)
    styleText(textPWD)

    // Tạo object chứa email và pwd
    let user = {
        email: emailSignUp,
        password: passwordSignUp
    }

    // Lấy dữ liệu tài khoản từ localStorage
    let getLocalStorage = localStorage.getItem("userList")

    // localStorage không có dữ liệu tài khoản
    if (getLocalStorage === null || getLocalStorage.length === undefined) {  // TH chưa có email tồn tại | localstorage tồn tại rồi nhưng không có tài khoản nào trong đó
        if (emailSignUp.match(regexEmail)) {
            textEmail.innerText = "" // nhập đúng nên xóa thông báo lỗi
            if (passwordSignUp.match(regexPwd)) {
                textPWD.innerText = ""
                if (passwordSignUp !== cofirmpasswordSignUp) { // kiểm tra 2 mật khẩu giống nhau không
                    textPWD.innerText = "* Mật khẩu nhập không khớp"
                } else {
                    // Nếu pass đúng thì thêm dữ liệu người
                    // dùng nhập vào mảng chứa tất cả tài khoản
                    textPWD.innerText = ""
                    userList.push(JSON.stringify(user))
                    localStorage.setItem("userList", `[` + userList + `]`)
                    // window.location.href = "../index.html"
                    window.location.href = "index.html"
                }
            } else {
                textPWD.innerText = "* Vui lòng nhập ít nhất 8 ký tự (bao gồm: chữ thường, in hoa, số)"
                // text 
            }
        } else {
            textEmail.innerText = "* Email nhập không hợp lệ"
        }
    }

    else {  // TH có email tồn tại
        let isValueEmail = validateEmail(emailSignUp) // lấy từ file function => trả ra true hoặc false
        if (emailSignUp.match(regexEmail)) { // kiểm tra có tương thích với nhau hay không
            textEmail.innerText = ""
            if (isValueEmail === true) { // if (isValueEmail) vẫn giống nhau vì trong if mặc định đã đúng
                textEmail.innerText = "* Email đã tồn tại"
            } else {
                textEmail.innerText = "" // có thể đăng ký
                if (passwordSignUp.match(regexPwd)) {
                    textPWD.innerText = ""
                    if (passwordSignUp !== cofirmpasswordSignUp) {
                        textPWD.innerText = "* Mật khẩu không khớp"
                    } else {
                        textPWD.innerText = ""
                        userList.push(JSON.stringify(user))
                        localStorage.setItem("userList", `[` + userList + `]`)
                        window.location.href = "index.html" // Vào trực tiếp trang chủ sau khi đăng nhập
                    }
                } else {
                    textPWD.innerText = "* Vui lòng nhập ít nhất 8 ký tự (bao gồm: chữ thường, in hoa, số)"
                }
            }
        } else {
            textEmail.innerText = "* Email nhập không hợp lệ"
        }
    }

}
)


