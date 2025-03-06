document.addEventListener("DOMContentLoaded", () => {
    let selectedStars = 0;
    const message = document.getElementById("message");

    document.querySelectorAll(".star").forEach(star => {
        star.addEventListener("click", function () {
            selectedStars = this.getAttribute("data-value");
            document.querySelectorAll(".star").forEach(s => s.classList.remove("active"));
            this.classList.add("active");
            for (let i = 0; i < selectedStars; i++) {
                document.querySelectorAll(".star")[i].classList.add("active");
            }
        });
    });

    document.getElementById("submitReview").addEventListener("click", async () => {
        const suggestion = document.getElementById("suggestion").value.trim();

        if (!message) {
            console.error("Message element not found!");
            return;
        }

        if (selectedStars === 0 || suggestion === "") {
            message.textContent = "Please provide a rating and feedback!";
            message.style.color = "red";
            message.classList.remove("hidden");
            message.style.opacity = "1";
            return;
        }

        const reviewData = { stars: selectedStars, suggestion };

        try {
            const response = await fetch("/submit-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reviewData)
            });

            if (response.ok) {
                message.textContent = "Review submitted successfully!";
                message.style.color = "green";
                document.getElementById("suggestion").value = "";
                document.querySelectorAll(".star").forEach(s => s.classList.remove("active"));
                window.location.href = "/";
            } else {
                message.textContent = "Failed to submit review!";
                message.style.color = "red";
            }
            message.classList.remove("hidden");
            message.style.opacity = "1";

            setTimeout(() => {
                message.style.opacity = "0";
            }, 3000);

        } catch (error) {
            console.error("Error submitting review:", error);
        }
    });
});
