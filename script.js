// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
});
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

// Project filter buttons
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;
    projectCards.forEach(card => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
  });
});

// Reveal content as it enters the viewport; show everything if unsupported.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add("visible"));
}

// Friendly toast for navigation fallback / feedback
const toast = document.getElementById("toast");
let toastTimeout;
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", () => {
    if (link.classList.contains("back-top")) {
      toast.textContent = "Back to the top ✳";
      toast.classList.add("show");
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => toast.classList.remove("show"), 1800);
    }
  });
});

// Reviews: interactive star rating and browser-local demo storage.
(() => {
  const form = document.getElementById("reviewForm");
  if (!form) return;

  const nameInput = document.getElementById("reviewName");
  const messageInput = document.getElementById("reviewMessage");
  const ratingInput = document.getElementById("reviewRating");
  const error = document.getElementById("reviewError");
  const list = document.getElementById("reviewsList");
  const empty = document.getElementById("reviewsEmpty");
  const count = document.getElementById("reviewCount");
  const starButtons = Array.from(document.querySelectorAll(".star-choice"));
  const storageKey = "novaStudioReviews";
  let reviews = [];

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (Array.isArray(saved)) reviews = saved.filter(item =>
      item && typeof item.name === "string" &&
      typeof item.message === "string" &&
      Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5
    );
  } catch (_) {
    reviews = [];
  }

  const paintStars = (rating) => {
    starButtons.forEach(button => {
      const selected = Number(button.dataset.rating) <= rating;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(Number(button.dataset.rating) === rating));
    });
  };

  starButtons.forEach(button => button.addEventListener("click", () => {
    ratingInput.value = button.dataset.rating;
    paintStars(Number(ratingInput.value));
    error.textContent = "";
  }));

  const renderReviews = () => {
    list.querySelectorAll(".review-item").forEach(item => item.remove());
    empty.hidden = reviews.length > 0;
    count.textContent = `${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`;
    reviews.forEach(review => {
      const item = document.createElement("article");
      item.className = "review-item";

      const top = document.createElement("div");
      top.className = "review-item-top";
      const avatar = document.createElement("div");
      avatar.className = "review-avatar";
      avatar.textContent = review.name.trim().charAt(0).toUpperCase() || "N";
      const person = document.createElement("div");
      person.className = "review-person";
      const personName = document.createElement("strong");
      personName.textContent = review.name;
      const date = document.createElement("small");
      date.textContent = review.date || "Community review";
      person.append(personName, date);
      const stars = document.createElement("div");
      stars.className = "review-stars";
      stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
      stars.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
      top.append(avatar, person, stars);
      const message = document.createElement("p");
      message.textContent = review.message;
      item.append(top, message);
      list.append(item);
    });
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const rating = Number(ratingInput.value);
    if (name.length < 2) {
      error.textContent = "Please enter your name (at least 2 characters).";
      nameInput.focus();
      return;
    }
    if (!rating) {
      error.textContent = "Please choose a star rating.";
      return;
    }
    if (message.length < 8) {
      error.textContent = "Please write a review of at least 8 characters.";
      messageInput.focus();
      return;
    }

    reviews.unshift({
      name: name.slice(0, 45),
      message: message.slice(0, 500),
      rating,
      date: new Date().toLocaleDateString(undefined, {year:"numeric", month:"short", day:"numeric"})
    });

    try {
      localStorage.setItem(storageKey, JSON.stringify(reviews));
      error.textContent = "";
      form.reset();
      ratingInput.value = "";
      paintStars(0);
      renderReviews();
      const toast = document.getElementById("toast");
      if (toast) {
        toast.textContent = "Thanks for sharing your review ✳";
        toast.classList.add("show");
        window.setTimeout(() => toast.classList.remove("show"), 2200);
      }
    } catch (_) {
      error.textContent = "Your browser couldn't save this review. Please check your browser storage settings.";
    }
  });

  renderReviews();
})();
