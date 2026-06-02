import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const MAX_POPULAR = 8;
const popularContainer = document.getElementById("popular-movies");
const carouselIndicators = document.getElementById("carousel-indicators");
const carouselInner = document.getElementById("carousel-inner");

function escapeHtml(str) {
    return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function createPopularCard(movie) {
    const name = escapeHtml(movie.name);
    const desc = escapeHtml(movie.description);
    const image = escapeHtml(movie.image);
    const trailer = movie.trailer || "#";
    const detailUrl = `movie-detail.html?id=${encodeURIComponent(movie.id)}`;

    return `
        <div class="card" style="width: 18rem;">
            <div class="card__img">
                <img src="${image}" class="card-img-top" alt="${name}">
            </div>
            <div class="card-body">
                <div class="card-2t">
                    <h5 class="card-title">${name}</h5>
                    <p class="card-text short movie-description">${desc}</p>
                </div>
                <div class="d-flex gap-2 flex-wrap align-items-center mt-2">
                    <a href="${trailer}" class="btn btn-primary" target="_blank" rel="noopener">Xem ngay</a>
                    <button type="button" class="btn btn-outline-secondary btn-sm read-more-btn">Xem thêm</button>
                    <a href="${detailUrl}" class="btn btn-outline-primary btn-sm">Tìm hiểu thêm</a>
                </div>
            </div>
        </div>
    `;
}

async function loadPopularMovies() {
    if (!popularContainer) return;

    try {
        const snapshot = await getDocs(collection(db, "movies"));
        const movies = [];

        snapshot.forEach((docSnap) => {
            movies.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (movies.length === 0) {
            popularContainer.innerHTML =
                "<p class='text-muted'>Chưa có phim nào. Vào Quản lý phim để thêm.</p>";
            renderCarousel([]);
            return;
        }

        const popular = movies.slice(0, MAX_POPULAR);
        popularContainer.innerHTML = popular.map(createPopularCard).join("");
        renderCarousel(movies);
    } catch (error) {
        console.error("Lỗi tải phim phổ biến:", error);
        popularContainer.innerHTML =
            "<p class='text-danger'>Không tải được danh sách phim.</p>";
    }
}

function createCarouselSlide(movie, isActive) {
    const name = escapeHtml(movie.name);
    const image = escapeHtml(movie.image);

    return `
        <div class="carousel-item ${isActive ? "active" : ""}">
            <img class="d-block w-100 slideItem" src="${image}" alt="${name}">
            <div class="carousel-caption d-block d-md-block">
                <div class="carousel-caption-top">
                    <h5 class="name">${name}</h5>
                </div>
            </div>
        </div>
    `;
}

function createCarouselIndicator(index, isActive) {
    return `
        <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="${index}"
            class="${isActive ? "active" : ""}" ${isActive ? "aria-current=\"true\"" : ""}
            aria-label="Slide ${index + 1}"></button>
    `;
}

function renderCarousel(movies) {
    if (!carouselInner || !carouselIndicators) return;

    if (!movies || movies.length === 0) {
        carouselIndicators.innerHTML = "";
        carouselInner.innerHTML = `
            <div class="carousel-item active">
                <div class="slideItem" style="height: 380px; display:flex; align-items:center; justify-content:center; background:#ddd;">
                    <span class="name">Chưa có phim trong slide</span>
                </div>
            </div>
        `;
        return;
    }

    carouselIndicators.innerHTML = movies
        .map((movie, index) => createCarouselIndicator(index, index === 0))
        .join("");

    carouselInner.innerHTML = movies
        .map((movie, index) => createCarouselSlide(movie, index === 0))
        .join("");
}

loadPopularMovies();

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".read-more-btn");
    if (!btn) return;
    const desc = btn.closest(".card-body")?.querySelector(".card-text.short");
    if (!desc) return;
    const expanded = desc.classList.toggle("expanded");
    btn.textContent = expanded ? "Thu gọn" : "Xem thêm";
});