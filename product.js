const foodContainer = document.querySelector(".food__items");
const popcornContainer = document.querySelector(".popcorn__items");
const drinkContainer = document.querySelector(".drink__items");


let products = JSON.parse(localStorage.getItem("products")) || [];

renderProducts();

function createCard(product){

    return `
    <div class="card" style="width: 18rem;">
        <div class="card__img">
            <img src="${product.image}" class="card-img-top">
        </div>
        <div class="card-body">
            <div class="card-2t">
                <h5 class="card-title">
                    ${product.name}
                </h5>
                <p class="shoppingcard-text">
                    ${product.description}
                </p>
                <p class="price">
                    ${Number(product.price).toLocaleString()} VNĐ
                </p>
            </div>
            <a href="detail.html?id=${product.id}" 
               class="btn btn-primary">
               Chi tiết
            </a>
        </div>
    </div>
    `;
}


function renderProducts(){
    foodContainer.innerHTML = "";
    popcornContainer.innerHTML = "";
    drinkContainer.innerHTML = "";

    products.forEach(product => {
        const card = createCard(product);

        // Góc ăn vặt
        if (product.category === "popcorn"){
            popcornContainer.innerHTML += card;
        }

        // Góc bắp rang
        else if (product.category === "food"){
            foodContainer.innerHTML += card;
        }

        // Góc giải khát
        else if(product.category === "drink"){
            drinkContainer.innerHTML += card;
        }
    });
}