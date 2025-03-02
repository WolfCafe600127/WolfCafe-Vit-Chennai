document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    // Function to validate email format
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to validate password length
    function validatePassword(password) {
        return password.length >= 6;
    }

    // Show/hide password toggle
    const togglePasswordVisibility = () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
        } else {
            passwordInput.type = "password";
        }
    };

    // Add a show/hide password button
    const toggleButton = document.createElement("span");
    toggleButton.innerHTML = "👁️";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.marginLeft = "-30px";
    toggleButton.style.position = "relative";
    toggleButton.style.left = "-25px";
    toggleButton.style.top = "8px";
    toggleButton.style.fontSize = "18px";
    
    passwordInput.parentNode.appendChild(toggleButton);
    toggleButton.addEventListener("click", togglePasswordVisibility);

    // Form validation on submit
    loginForm.addEventListener("submit", function (event) {
        let valid = true;

        // Validate Email
        if (!validateEmail(emailInput.value)) {
            alert("Please enter a valid email address.");
            emailInput.focus();
            valid = false;
        }

        // Validate Password
        if (!validatePassword(passwordInput.value)) {
            alert("Password must be at least 6 characters long.");
            passwordInput.focus();
            valid = false;
        }

        if (!valid) {
            event.preventDefault(); // Stop form submission if validation fails
        }
    });
});
