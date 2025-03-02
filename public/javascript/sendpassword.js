document.getElementById("sendOtpBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const message = document.getElementById("message");

    if (!email) {
        message.innerText = "Please enter your email.";
        return;
    }

    try {
        // Step 1: Send OTP Request
        const response = await fetch("/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (response.ok) {
            message.innerText = "OTP sent to your email.";
            document.getElementById("otpSection").style.display = "block"; // Show OTP input
        } else {
            message.innerText = data.error || "Failed to send OTP.";
        }
    } catch (error) {
        message.innerText = "Error sending OTP.";
    }
});

document.getElementById("verifyOtpBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;
    const message = document.getElementById("message");

    if (!otp) {
        message.innerText = "Please enter the OTP.";
        return;
    }

    try {
        // Step 2: Verify OTP Request
        const response = await fetch("/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();
        if (response.ok) {
            message.innerText = "OTP Verified! Enter a new password.";
            document.getElementById("passwordSection").style.display = "block"; // Show password input
        } else {
            message.innerText = data.error || "Invalid OTP.";
        }
    } catch (error) {
        message.innerText = "Error verifying OTP.";
    }
});

document.getElementById("passwordForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const newPassword = document.getElementById("newPassword").value;
    const message = document.getElementById("message");

    if (!newPassword) {
        message.innerText = "Please enter a new password.";
        return;
    }

    try {
        // Step 3: Reset Password Request
        const response = await fetch("/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword })
        });

        const data = await response.json();
        if (response.ok) {
            message.innerText = "Password reset successfully! Redirecting...";
            setTimeout(() => window.location.href = "/login", 3000); // Redirect to login page
        } else {
            message.innerText = data.error || "Failed to reset password.";
        }
    } catch (error) {
        message.innerText = "Error resetting password.";
    }
});
