// Style for Text
export const styleText = (key) => {
    key.style.color = "red"
    key.style.fontStyle = "italic"
    key.style.fontSize = "14px"
} // => làm chữ báo lỗi và hiện màu đỏ, in nghiêng, size 14px

// check email duplicated: kiểm tra xem có tài khoản trước đó không
export const validateEmail = (email) => {
    // Lấy userList từ localStorage
    const getLocalStorage = localStorage.getItem("userList")
    let users = JSON.parse(getLocalStorage) // lấy 
    // Lặp qua từng phần từ bên trong mảng
    for (let data of users) {
        // Kiểm tra email người dùng nhập vào có tồn tại trong local hay chưa
        if (email === data.email) {
            // Nếu tồn tại thì hàm trả về True
            return true // email đã tồn tại
        }
    }
    // Lặp qua không thấy hết thì trả về false
    return false // email chưa tồn tại -> có thể đăng ký được
}

// check password duplicated: hỗ trợ kiểm tra có trùng với nhập lại password không
export const validatePassword = (pwd) => {
    // get value of Local Storage
    let getLocalStorage = localStorage.getItem('userList')

    let users = JSON.parse(getLocalStorage)

    for (let data of users) {
        if (pwd === data.password) {
            return true
        }
    }
    return false
}

























