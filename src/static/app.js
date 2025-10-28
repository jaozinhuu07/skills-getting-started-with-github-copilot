document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants HTML: bullet list or empty message
        // Build the main card content (participants will be created with DOM nodes so we can attach handlers)
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p class="availability"><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p class="participants-heading"><strong>Participantes:</strong></p>
            <!-- participants list will be appended here -->
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Populate participants list with remove buttons
        const participantsSection = activityCard.querySelector(".participants-section");
        if (details.participants && details.participants.length) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";

          details.participants.forEach((p) => {
            const li = document.createElement("li");

            const span = document.createElement("span");
            span.className = "participant-email";
            span.textContent = p;

            const btn = document.createElement("button");
            btn.className = "remove-btn";
            btn.setAttribute("aria-label", `Remover ${p}`);
            btn.textContent = "✖";

            // Attach click handler to unsubscribe
            btn.addEventListener("click", async () => {
              // Optimistic UI: disable button while request is in-flight
              btn.disabled = true;
              try {
                const res = await fetch(
                  `/activities/${encodeURIComponent(name)}/unsubscribe?email=${encodeURIComponent(p)}`,
                  { method: "POST" }
                );

                const result = await res.json();
                if (res.ok) {
                  // Refresh activities to keep UI consistent (simpler than manual DOM updates)
                  fetchActivities();
                } else {
                  console.error("Failed to unsubscribe:", result);
                  messageDiv.textContent = result.detail || "Falha ao descadastrar participante";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                  setTimeout(() => messageDiv.classList.add("hidden"), 5000);
                  btn.disabled = false;
                }
              } catch (err) {
                console.error("Error unsubscribing:", err);
                messageDiv.textContent = "Erro ao descadastrar. Tente novamente.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                setTimeout(() => messageDiv.classList.add("hidden"), 5000);
                btn.disabled = false;
              }
            });

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        } else {
          const empty = document.createElement("p");
          empty.className = "participants-empty";
          empty.textContent = "Nenhum participante inscrito";
          participantsSection.appendChild(empty);
        }

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Atualiza a lista de atividades/participantes
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
