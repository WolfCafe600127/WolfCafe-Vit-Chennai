document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");
    
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        // Validate name
        if (name.length < 3) {
            alert("Full Name must be at least 3 characters long.");
            return;
        }

        // Validate email
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            alert("Please enter a valid email.");
            return;
        }

        // Validate phone number (10 digits)
        if (!/^\d{10}$/.test(phone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // Show loading effect (optional)
        const button = document.querySelector("button");
        button.innerHTML = "Registering...";
        button.disabled = true;

        // Submit the form
        form.submit();
    });
});


