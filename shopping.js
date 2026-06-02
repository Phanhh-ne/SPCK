import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const foodItems = document.querySelector(".food__items");
const popcornItems = document.querySelector(".popcorn__items");
const drinkItems = document.querySelector(".drink__items");

async function loadProducts() {

    foodItems.innerHTML = "";
    popcornItems.innerHTML = "";
    drinkItems.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "products"));

    querySnapshot.forEach((doc) => {

        const product = doc.data();

        const html = `
  <div class="card" style="width: 30rem;">
    <div class="card__img">
      <img src="${product.image}" class="card-img-top">
    </div>
    <div class="card-body">
      <h5 class="card-title">
        ${product.name}
      </h5>
      <p class="price">
        <ion-icon name="pricetags-outline"></ion-icon>${product.price.toLocaleString()}đ
      </p>
      <p class="shoppingcard-text">
        ${product.description}
      </p>
    </div>
  </div>
`;

        if (product.category === "Góc ăn vặt") {
            foodItems.innerHTML += html;
        } else if (product.category === "Góc bắp rang") {
            popcornItems.innerHTML += html;
        } else if (product.category === "Góc giải khát") {
            drinkItems.innerHTML += html;
        }

    });
}

loadProducts();