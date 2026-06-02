import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const lists = {
    hoathinh: document.getElementById("list-hoathinh"),
    anime: document.getElementById("list-anime"),
    haihuoc: document.getElementById("list-haihuoc")
};

function escapeHtml(str) {
    return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getCategoryLabel(category) {
    const labels = {
        hoathinh: "Hoạt hình",
        anime: "Anime",
        haihuoc: "Hài hước"
    };
    return labels[category] || category || "Không xác định";
}

function createMovieCard(movie) {
    const name = escapeHtml(movie.name);
    const desc = escapeHtml(movie.description);
    const image = escapeHtml(movie.image);
    const trailer = movie.trailer || "#";
    const categoryLabel = escapeHtml(getCategoryLabel(movie.category));
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
                <p class="card-text"><strong>Thời lượng:</strong> ${escapeHtml(movie.duration || "-")} phút</p>
                <p class="card-text"><strong>Đạo diễn:</strong> ${escapeHtml(movie.director || "-")}</p>
                <p class="card-text"><strong>Diễn viên:</strong> ${escapeHtml(movie.cast || "-")}</p>
                <p class="card-text"><strong>Ngôn ngữ:</strong> ${escapeHtml(movie.language || "-")}</p>
                <p class="card-text"><strong>Trailer:</strong> <a href="${trailer}" target="_blank" rel="noopener">Xem trailer</a></p>
                <div class="admin-card-footer d-flex flex-column gap-2">
                    <span class="admin-category">Thể loại: ${categoryLabel}</span>
                    <div class="d-flex gap-2 flex-wrap align-items-center">
                        <a href="${trailer}" class="btn btn-primary" target="_blank" rel="noopener">Xem ngay</a>
                        <button type="button" class="btn btn-outline-secondary btn-sm read-more-btn">Xem thêm</button>
                        <a href="${detailUrl}" class="btn btn-outline-primary btn-sm">Tìm hiểu thêm</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function handleReadMoreClick(e) {
    const btn = e.target.closest(".read-more-btn");
    if (!btn) return;
    const desc = btn.closest(".card-body")?.querySelector(".card-text.short");
    if (!desc) return;
    const expanded = desc.classList.toggle("expanded");
    btn.textContent = expanded ? "Thu gọn" : "Xem thêm";
}

async function loadMovies() {
    Object.values(lists).forEach((el) => {
        if (el) el.innerHTML = "<p>Đang tải...</p>";
    });

    try {
        const snapshot = await getDocs(collection(db, "movies"));
        const byCategory = { hoathinh: [], anime: [], haihuoc: [] };

        snapshot.forEach((docSnap) => {
            const movie = { id: docSnap.id, ...docSnap.data() };
            const cat = movie.category;
            if (byCategory[cat]) {
                byCategory[cat].push(movie);
            }
        });

        for (const [category, container] of Object.entries(lists)) {
            if (!container) continue;
            const movies = byCategory[category];

            if (movies.length === 0) {
                container.innerHTML = "<p class='text-muted'>Chưa có phim nào trong thể loại này.</p>";
                continue;
            }

            container.innerHTML = movies.map(createMovieCard).join("");
        }

    } catch (error) {
        console.error("Lỗi tải phim:", error);
        Object.values(lists).forEach((el) => {
            if (el) el.innerHTML = "<p class='text-danger'>Không tải được danh sách phim.</p>";
        });
    }
}

loadMovies();

document.addEventListener("click", handleReadMoreClick);