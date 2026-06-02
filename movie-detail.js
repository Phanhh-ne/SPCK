import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const loadingEl = document.getElementById("movie-detail-loading");
const errorEl = document.getElementById("movie-detail-error");
const contentEl = document.getElementById("movie-detail-content");
const emptyEl = document.getElementById("movie-detail-empty");

function getCategoryLabel(category) {
    const labels = {
        hoathinh: "Hoạt hình",
        anime: "Anime",
        haihuoc: "Hài hước"
    };
    return labels[category] || category || "Không xác định";
}

function hideLoading() {
    if (loadingEl) loadingEl.classList.add("d-none");
}

function showError(message) {
    hideLoading();
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove("d-none");
    }
}

function showEmpty() {
    hideLoading();
    if (emptyEl) emptyEl.classList.remove("d-none");
}

function renderMovie(movie) {
    hideLoading();
    if (emptyEl) emptyEl.classList.add("d-none");
    if (errorEl) errorEl.classList.add("d-none");

    const poster = document.getElementById("detail-poster");
    const title = document.getElementById("detail-title");
    const category = document.getElementById("detail-category");
    const description = document.getElementById("detail-description");
    const trailerLink = document.getElementById("detail-trailer-link");
    const watchBtn = document.getElementById("detail-watch-btn");

    if (poster) {
        poster.src = movie.image || "";
        poster.alt = movie.name || "Poster phim";
    }
    if (title) title.textContent = movie.name || "Không có tên";
    if (category) category.textContent = getCategoryLabel(movie.category);
    if (description) description.textContent = movie.description || "";
    if (trailerLink) {
        trailerLink.href = movie.trailer || "#";
        trailerLink.textContent = movie.trailer ? "Xem trailer" : "Chưa có trailer";
    }
    if (watchBtn) watchBtn.href = movie.trailer || "#";

    document.title = (movie.name || "Chi tiết phim") + " - PA Films";

    if (contentEl) contentEl.classList.remove("d-none");
}

async function loadMovieDetail() {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("id");

    if (!movieId) {
        showEmpty();
        return;
    }

    try {
        const snap = await getDoc(doc(db, "movies", movieId));
        if (!snap.exists()) {
            showError("Không tìm thấy phim. Có thể phim đã bị xóa.");
            return;
        }
        renderMovie(snap.data());
    } catch (error) {
        console.error("Lỗi tải chi tiết phim:", error);
        showError("Không tải được thông tin phim. Vui lòng thử lại sau.");
    }
}

loadMovieDetail();
