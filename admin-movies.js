import { db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const CLOUDINARY_CLOUD_NAME = "dfueejn5s";
const CLOUDINARY_UPLOAD_PRESET = "dfueejn5s";

const movieForm = document.getElementById("movieForm");
const movieList = document.getElementById("movieList");

const movieName = document.getElementById("name");
const movieTrailer = document.getElementById("trailer");
const movieCategory = document.getElementById("category");
const movieDescription = document.getElementById("description");
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
    document.getElementById("error-image").textContent = "";
    document.getElementById("error-trailer").textContent = "";
    document.getElementById("error-description").textContent = "";
    movieName.classList.remove("is-invalid");
    movieTrailer.classList.remove("is-invalid");
    movieDescription.classList.remove("is-invalid");
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

function validateMovie() {
    clearErrors();
    let isValid = true;
    const missingFields = [];

    if (!movieName.value.trim()) {
        document.getElementById("error-name").textContent = "❌ Vui lòng nhập tên phim";
        movieName.classList.add("is-invalid");
        missingFields.push("Tên phim");
        isValid = false;
    }

    if (!imageFile || imageFile.files.length === 0) {
        document.getElementById("error-image").textContent = "❌ Vui lòng chọn poster phim";
        missingFields.push("Poster phim");
        isValid = false;
    }

    if (!movieTrailer.value.trim()) {
        document.getElementById("error-trailer").textContent = "❌ Vui lòng nhập URL trailer";
        movieTrailer.classList.add("is-invalid");
        missingFields.push("Link trailer");
        isValid = false;
    } else if (!movieTrailer.value.toLowerCase().startsWith("http")) {
        document.getElementById("error-trailer").textContent = "❌ URL phải bắt đầu bằng http:// hoặc https://";
        movieTrailer.classList.add("is-invalid");
        missingFields.push("Link trailer hợp lệ (http/https)");
        isValid = false;
    }

    if (!movieDescription.value.trim()) {
        document.getElementById("error-description").textContent = "❌ Vui lòng nhập mô tả phim";
        movieDescription.classList.add("is-invalid");
        missingFields.push("Mô tả phim");
        isValid = false;
    }

    if (!isValid) {
        showFormAlert(missingFields);
    }

    return isValid;
}

function getCategoryLabel(category) {
    const labels = {
        hoathinh: "Hoạt hình",
        anime: "Anime",
        haihuoc: "Hài hước"
    };
    return labels[category] || category || "Không xác định";
}

if (movieForm) {
    movieForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validateMovie()) {
            return;
        }

        const name = movieName.value.trim();
        const trailer = movieTrailer.value.trim();
        const category = movieCategory.value;
        const description = movieDescription.value.trim();

        try {
            const image = await uploadToCloudinary(imageFile.files[0]);

            await addDoc(collection(db, "movies"), {
                name,
                image,
                trailer,
                category,
                description
            });

            alert("✅ Thêm phim thành công");
            clearErrors();
            movieForm.reset();
            renderMovies();
        } catch (error) {
            console.error("Lỗi thêm phim:", error);
            alert("❌ Lỗi thêm phim: " + error.message);
        }
    });
}

async function renderMovies() {
    if (!movieList) return;
    movieList.innerHTML = "";
    try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        if (querySnapshot.empty) {
            movieList.innerHTML = '<p class="text-muted">Chưa có phim nào.</p>';
            return;
        }

        const cardsHtml = [];
        querySnapshot.forEach((docItem) => {
            const movie = docItem.data();
            const categoryLabel = getCategoryLabel(movie.category);
            const card = `
                <div class="card" style="width: 18rem;">
                    <div class="card__img">
                        <img src="${movie.image}" class="card-img-top" alt="${movie.name}">
                    </div>
                    <div class="card-body">
                        <div class="card-2t">
                            <h5 class="card-title">${movie.name}</h5>
                            <p class="card-text short movie-description">${movie.description}</p>
                        </div>
                        <p class="card-text text-break"><strong>Trailer:</strong> <a href="${movie.trailer}" target="_blank">Xem trailer</a></p>
                        <div class="admin-card-footer d-flex flex-column gap-2">
                            <span class="admin-category">Thể loại: ${categoryLabel}</span>
                            <div class="d-flex gap-2 flex-wrap align-items-center">
                                <a href="${movie.trailer}" target="_blank" class="btn btn-primary">Xem ngay</a>
                                <button type="button" class="btn btn-outline-secondary btn-sm read-more-btn">Xem thêm</button>
                                <a href="movie-detail.html?id=${docItem.id}" class="btn btn-outline-primary btn-sm">Tìm hiểu thêm</a>
                                <button class="btn btn-danger delete-btn" onclick="deleteMovie('${docItem.id}')">Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            cardsHtml.push(card);
        });

        movieList.innerHTML = `<div class="d-flex flex-wrap gap-3 justify-content-center">${cardsHtml.join("")}</div>`;
    } catch (err) {
        console.error(err);
    }
}

window.deleteMovie = async function (id) {
    try {
        await deleteDoc(doc(db, "movies", id));
        alert("Đã xóa");
        renderMovies();
    } catch (err) {
        console.error(err);
    }
};

renderMovies();

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".read-more-btn");
    if (!btn) return;
    const desc = btn.closest(".card-body")?.querySelector(".card-text.short");
    if (!desc) return;
    const expanded = desc.classList.toggle("expanded");
    btn.textContent = expanded ? "Thu gọn" : "Xem thêm";
});