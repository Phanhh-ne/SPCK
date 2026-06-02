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
    if (!getLocalStorage) return false
    let users;
    try {
        users = JSON.parse(getLocalStorage) || []
    } catch (e) {
        return false
    }
    for (let data of users) {
        if (email === data.email) {
            return true
        }
    }
    return false
}

// check password duplicated: hỗ trợ kiểm tra có trùng với nhập lại password không
export const validatePassword = (pwd) => {
    // get value of Local Storage
    let getLocalStorage = localStorage.getItem('userList')
    if (!getLocalStorage) return false
    let users
    try {
        users = JSON.parse(getLocalStorage) || []
    } catch (e) {
        return false
    }
    for (let data of users) {
        if (pwd === data.password) {
            return true
        }
    }
    return false
}

























