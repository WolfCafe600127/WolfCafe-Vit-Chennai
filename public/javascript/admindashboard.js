// // Fetch and display live orders
// async function fetchOrders() {
//     try {
//         const response = await fetch("/api/live-orders");
//         const orders = await response.json();

//         console.log("📌 Fetched Orders:", orders);

//         if (!Array.isArray(orders)) {
//             console.error("❌ Error: Received invalid orders data!", orders);
//             return;
//         }

//         const ordersTable = document.getElementById("ordersTableBody");
//         ordersTable.innerHTML = "";

//         orders.forEach(order => {
//             console.log("📌 Order Data:", order);
//             // console.log("📌 Order Data:", order.items);
//             // console.log(order.items);
//             const row = document.createElement("tr");

//             row.innerHTML = `
//                 <td>${order.email || "N/A"}</td>
//                 <td>${formatItems(order.items)}</td> 
//                 <td>₹${order.totalPrice || 0}</td>
//                 <td class="${(order.status || "").toLowerCase()}">${order.status || "Pending"}</td>
//                 <td>${order.otp || "0000"}</td>
//                 <td>
//                     <button onclick="updateStatus('${order._id}', 'Preparing')">Preparing</button>
//                     <button onclick="updateStatus('${order._id}', 'Delivering')">Delivering</button>
//                 </td>
//             `;

//             ordersTable.appendChild(row);
//         });
//     } catch (error) {
//         console.error("❌ Error fetching orders:", error);
//     }
// }

// // Format items properly
// function formatItems(items) {
//     console.log("📌 Raw Items:", items);
    
//     if (typeof items !== "object" || items === null) {
//         console.error("❌ formatItems Error: items is not a valid object!", items);
//         return "Invalid Items";
//     }

//     return Object.entries(items)
//         .map(([name, details]) => `${name} (x${details.quantity || 0})`)
//         .join("<br>");
// }



// // Update order status
// async function updateStatus(orderId, status) {
//     try {
//         const response = await fetch("/api/update-status", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ orderId, status })
//         });

//         const result = await response.json();

//         if (result.success) {
//             alert(result.message);
//             fetchOrders(); // Refresh orders
//         } else {
//             console.error("Error updating status:", result.message);
//         }
//     } catch (error) {
//         console.error("Error updating status:", error);
//     }
// }

// // Fetch current order availability status
// async function fetchOrderStatus() {
//     try {
//         const response = await fetch("/api/get-order-status"); // Backend API to get status
//         const data = await response.json();

//         if (data.active !== undefined) {
//             updateOrderToggleButton(data.active);
//         }
//     } catch (error) {
//         console.error("❌ Error fetching order status:", error);
//     }
// }

// // Toggle order availability (ON/OFF)
// async function toggleOrders() {
//     const statusText = document.getElementById("orderStatusText");
//     const isActive = statusText.innerText === "ON";

//     try {
//         const response = await fetch("/api/toggle-orders", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ active: !isActive })
//         });

//         const result = await response.json();

//         if (result.success) {
//             updateOrderToggleButton(!isActive);
//         } else {
//             console.error("❌ Error updating order status:", result.message);
//         }
//     } catch (error) {
//         console.error("❌ Error toggling orders:", error);
//     }
// }

// // Update button text based on order status
// function updateOrderToggleButton(isActive) {
//     document.getElementById("orderStatusText").innerText = isActive ? "ON" : "OFF";
// }

// // Auto-refresh every 20 seconds
// setInterval(fetchOrders, 20000);

// // Initial fetches
// fetchOrders();
// fetchOrderStatus();


let lastOrderCount =0;
async function fetchOrders() {
    try {
        const response = await fetch("/api/live-orders");
        const data = await response.json();
        
        if (data.orderCount > lastOrderCount) {
            announceNewOrder(data.orderCount - lastOrderCount);
          }
      
        lastOrderCount = data.orderCount; // Update order count

        // console.log("📌 Fetched Orders:", orders);

        if (!Array.isArray(data.orders)) {
            console.error("❌ Error: Received invalid orders data!", data);
            return;
        }

        const ordersTable = document.getElementById("ordersTableBody");
        ordersTable.innerHTML = "";

        data.orders.forEach(order => {
            console.log("📌 Order Data:", order);
            // console.log("📌 Order Data:", order.items);
            // console.log(order.items);
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${order.email || "N/A"}</td>
                <td>${order.phone || "N/A"}</td>
                <td>${formatItems(order.items)}</td> 
                <td>₹${order.totalPrice || 0}</td>
                <td class="${(order.status || "").toLowerCase()}">${order.status || "Pending"}</td>
                <td>${order.otp || "0000"}</td>
                <td>
                    <button onclick="updateStatus('${order._id}', 'Preparing')">Preparing</button>
                    <button onclick="updateStatus('${order._id}', 'Delivering')">Delivering</button>
                    <button onclick="updateStatus('${order._id}', 'Cancelled')">Cancel Order</button>
                </td>
            `;

            ordersTable.appendChild(row);
        });
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
    }
}

function announceNewOrder(newOrders) {
  const msg = new SpeechSynthesisUtterance();
  msg.text = `New order received!`
  msg.lang = "en-US";
  msg.volume = 1;
  msg.rate = 1;
  msg.pitch = 1;
  window.speechSynthesis.speak(msg);
}

// Automatically check for new orders every 20 seconds
setInterval(fetchOrders, 20000);
// Format items properly
function formatItems(items) {
    console.log("📌 Raw Items:", items);
    
    if (typeof items !== "object" || items === null) {
        console.error("❌ formatItems Error: items is not a valid object!", items);
        return "Invalid Items";
    }

    return Object.entries(items)
        .map(([name, details]) => `${name} (x${details.quantity || 0})`)
        .join("<br>");
}



// Update order status
async function updateStatus(orderId, status) {
    try {
        const response = await fetch("/api/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, status })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            fetchOrders(); // Refresh orders
        } else {
            console.error("Error updating status:", result.message);
        }
    } catch (error) {
        console.error("Error updating status:", error);
    }
}

// Fetch current order availability status
async function fetchOrderStatus() {
    try {
        const response = await fetch("/api/get-order-status"); // Backend API to get status
        const data = await response.json();

        if (data.active !== undefined) {
            updateOrderToggleButton(data.active);
        }
    } catch (error) {
        console.error("❌ Error fetching order status:", error);
    }
}

// Toggle order availability (ON/OFF)
async function toggleOrders() {
    const statusText = document.getElementById("orderStatusText");
    const isActive = statusText.innerText === "ON";

    try {
        const response = await fetch("/api/toggle-orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: !isActive })
        });

        const result = await response.json();

        if (result.success) {
            updateOrderToggleButton(!isActive);
        } else {
            console.error("❌ Error updating order status:", result.message);
        }
    } catch (error) {
        console.error("❌ Error toggling orders:", error);
    }
}

// Update button text based on order status
function updateOrderToggleButton(isActive) {
    document.getElementById("orderStatusText").innerText = isActive ? "ON" : "OFF";
}

// Auto-refresh every 20 seconds
setInterval(fetchOrders, 20000);

// Initial fetches
fetchOrders();
fetchOrderStatus();