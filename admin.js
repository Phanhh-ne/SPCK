import { db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const CLOUDINARY_CLOUD_NAME = "dfueejn5s";
const CLOUDINARY_UPLOAD_PRESET = "dfueejn5s";

const productForm = document.getElementById("productForm");
const productName = document.getElementById("name");
const productPrice = document.getElementById("price");
const productCategory = document.getElementById("category");
const productDescription = document.getElementById("description");
const productList = document.getElementById("productList");
const imageFile = document.getElementById("image-file");

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        { method: "POST", body: formData }
    );
    if (!response.ok) {
        throw new Error("Upload Cloudinary thất bại");
    }
    const data = await response.json();
    return data.secure_url;
}

function clearErrors() {
    document.getElementById("error-name").textContent = "";
    document.getElementById("error-price").textContent = "";
    document.getElementById("error-image").textContent = "";
    document.getElementById("error-description").textContent = "";
    productName.classList.remove("is-invalid");
    productPrice.classList.remove("is-invalid");
    productDescription.classList.remove("is-invalid");
    hideFormAlert();
}

function hideFormAlert() {
    const alertEl = document.getElementById("form-alert");
    if (alertEl) {
        alertEl.classList.add("d-none");
        alertEl.textContent = "";
    }
}

function showFormAlert(missingFields) {
    const alertEl = document.getElementById("form-alert");
    const message = "Vui lòng điền đầy đủ thông tin: " + missingFields.join(", ") + ".";

    if (alertEl) {
        alertEl.textContent = "⚠️ " + message;
        alertEl.classList.remove("d-none");
    }

    alert("⚠️ " + message);
    alertEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.querySelector(".admin-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function validateProduct() {
    clearErrors();
    let isValid = true;
    const missingFields = [];

    if (!productName.value.trim()) {
        document.getElementById("error-name").textContent = "❌ Vui lòng nhập tên sản phẩm";
        productName.classList.add("is-invalid");
        missingFields.push("Tên sản phẩm");
        isValid = false;
    }

    if (!productPrice.value || isNaN(productPrice.value) || productPrice.value <= 0) {
        document.getElementById("error-price").textContent = "❌ Vui lòng nhập giá hợp lệ (số dương)";
        productPrice.classList.add("is-invalid");
        missingFields.push("Giá sản phẩm");
        isValid = false;
    }

    if (!imageFile || imageFile.files.length === 0) {
        document.getElementById("error-image").textContent = "❌ Vui lòng chọn ảnh sản phẩm";
        missingFields.push("Ảnh sản phẩm");
        isValid = false;
    }

    if (!productDescription.value.trim()) {
        document.getElementById("error-description").textContent = "❌ Vui lòng nhập mô tả sản phẩm";
        productDescription.classList.add("is-invalid");
        missingFields.push("Mô tả sản phẩm");
        isValid = false;
    }

    if (!isValid) {
        showFormAlert(missingFields);
    }

    return isValid;
}

productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateProduct()) {
        return;
    }

    try {
        const image = await uploadToCloudinary(imageFile.files[0]);

        const newProduct = {
            name: productName.value.trim(),
            price: productPrice.value,
            image: image,
            category: productCategory.value,
            description: productDescription.value.trim()
        };

        const docRef = await addDoc(collection(db, "products"), newProduct);

        let products = JSON.parse(localStorage.getItem("products")) || [];
        products.push({ ...newProduct, id: docRef.id });
        localStorage.setItem("products", JSON.stringify(products));

        clearErrors();
        alert("✅ Đã thêm sản phẩm thành công");
        productForm.reset();
        renderProducts();
    } catch (error) {
        console.error("Lỗi thêm sản phẩm:", error);
        alert("❌ Lỗi thêm sản phẩm: " + error.message);
    }
});

async function renderProducts() {
    if (!productList) return;
    productList.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "products"));

        if (querySnapshot.empty) {
            productList.innerHTML = '<p class="text-muted">Chưa có sản phẩm nào.</p>';
            return;
        }

        const cardsHtml = [];
        querySnapshot.forEach((docItem) => {
            const product = docItem.data();
            const card = `
                <div class="card">
                    <div class="card__img">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    </div>
                    <div class="card-body">
                        <div class="card-2t">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text price"><ion-icon name="pricetags-outline"></ion-icon>${product.price}₫</p>
                            <div class="description-container">
                                <p class="card-text short shoppingcard-text">Mô tả: ${product.description}</p>
                                <button type="button" class="btn btn-outline-secondary btn-sm read-more-btn">Xem thêm</button>
                            </div>
                        </div>
                        <div class="admin-card-footer d-flex flex-column gap-2">
                            <span class="admin-category">${product.category}</span>
                            <div class="d-flex gap-2 flex-wrap align-items-center">
                                <button class="btn btn-danger delete-btn" onclick="deleteProduct('${docItem.id}')">Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            cardsHtml.push(card);
        });

        productList.innerHTML = cardsHtml.join("");
    } catch (err) {
        console.error("Lỗi hiển thị sản phẩm:", err);
        productList.innerHTML = `<p class="text-danger">Lỗi tải sản phẩm: ${err.message}</p>`;
    }
}

window.deleteProduct = async function (id) {
    try {
        await deleteDoc(doc(db, "products", id));
        alert("Đã xóa");
        renderProducts();
    } catch (err) {
        console.error("Lỗi xóa sản phẩm:", err);
        alert("Lỗi xóa sản phẩm: " + err.message);
    }
};

renderProducts();

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".read-more-btn");
    if (!btn) return;
    const desc = btn.closest(".card-body")?.querySelector(".card-text.short");
    if (!desc) return;
    const expanded = desc.classList.toggle("expanded");
    btn.textContent = expanded ? "Thu gọn" : "Xem thêm";
});