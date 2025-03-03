

// document.addEventListener("DOMContentLoaded", () => {
//   const categoryItems = document.querySelectorAll(".category li");
//   const menuItems = document.querySelectorAll(".menu-item");

//   // Handle category filtering
//   categoryItems.forEach((category) => {
//     category.addEventListener("click", function () {
//       categoryItems.forEach((item) => item.classList.remove("active"));
//       this.classList.add("active");

//       const categoryType = this.getAttribute("data-category");
//       menuItems.forEach((item) => {
//         if (
//           categoryType === "all" ||
//           item.getAttribute("data-category") === categoryType
//         ) {
//           item.style.display = "block";
//         } else {
//           item.style.display = "none";
//         }
//       });
//     });
//   });
//   const API_BASE_URL =
//     window.location.hostname === "localhost"
//       ? "http://localhost:3000"
//       : "https://your-deployed-api.com"; // Change when deploying

//   const cart = {}; // Store cart items

//   document.querySelectorAll(".menu-item").forEach((item) => {
//     const plusBtn = item.querySelector(".plus");
//     const minusBtn = item.querySelector(".minus");
//     const quantitySpan = item.querySelector(".quantity");
//     const itemName = item.querySelector("h3").innerText;
//     const itemPrice = parseInt(
//       item.querySelector(".price").innerText.replace("₹", "")
//     );

//     plusBtn.addEventListener("click", () => {
//       cart[itemName] = cart[itemName]
//         ? {
//             quantity: cart[itemName].quantity + 1,
//             price: itemPrice,
//           }
//         : { quantity: 1, price: itemPrice };

//       quantitySpan.innerText = cart[itemName].quantity;
//     });

//     minusBtn.addEventListener("click", () => {
//       if (cart[itemName] && cart[itemName].quantity > 0) {
//         cart[itemName].quantity -= 1;
//         quantitySpan.innerText = cart[itemName].quantity;
//         if (cart[itemName].quantity === 0) delete cart[itemName];
//       }
//     });
//   });

//   // Send order details to backend
//   document.querySelector("#orderButton").addEventListener("click", () => {
//     fetch(`http://localhost:3000/ordercart`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ cart }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.success) {
//           window.location.href = "/cart"; // Redirect to checkout
//         }
//       })
//       .catch((error) => console.error("Error:", error));
//   });
// });


document.addEventListener("DOMContentLoaded", () => {
  const categoryItems = document.querySelectorAll(".category li");
  const menuItems = document.querySelectorAll(".menu-item");

  // Handle category filtering
  categoryItems.forEach((category) => {
    category.addEventListener("click", function () {
      categoryItems.forEach((item) => item.classList.remove("active"));
      this.classList.add("active");

      const categoryType = this.getAttribute("data-category");
      menuItems.forEach((item) => {
        if (
          categoryType === "all" ||
          item.getAttribute("data-category") === categoryType
        ) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://wolfcafe-vchennai.onrender.com"; // Change when deploying

  const cart = {}; // Store cart items

  document.querySelectorAll(".menu-item").forEach((item) => {
    const plusBtn = item.querySelector(".plus");
    const minusBtn = item.querySelector(".minus");
    const quantitySpan = item.querySelector(".quantity");
    const itemName = item.querySelector("h3").innerText;
    const itemPrice = parseInt(
      item.querySelector(".price").innerText.replace("₹", "")
    );

    plusBtn.addEventListener("click", () => {
      cart[itemName] = cart[itemName]
        ? {
            quantity: cart[itemName].quantity + 1,
            price: itemPrice,
          }
        : { quantity: 1, price: itemPrice };

      quantitySpan.innerText = cart[itemName].quantity;
    });

    minusBtn.addEventListener("click", () => {
      if (cart[itemName] && cart[itemName].quantity > 0) {
        cart[itemName].quantity -= 1;
        quantitySpan.innerText = cart[itemName].quantity;
        if (cart[itemName].quantity === 0) delete cart[itemName];
      }
    });
  });

  function calculateTotal() {
    return Object.values(cart).reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  }

  // Send order details to backend
  document.querySelector("#orderButton").addEventListener("click", () => {
    let totalAmount = calculateTotal();

    if (totalAmount < 250) {
      alert(
        "Amount is less than ₹250. Please add more items to enjoy our best food menu!"
      );
      return; // Stop order processing if the amount is too low
    }

    fetch(`${API_BASE_URL}/ordercart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart, totalAmount }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "/cart"; // Redirect to checkout
        }
      })
      .catch((error) => console.error("Error:", error));
  });
});
