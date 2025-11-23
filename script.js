// State Management
const state = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    products: [
        {
            id: 1,
            name: "Modern Velvet Sofa",
            price: 1299,
            category: "Living Room",
            image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop"
        },
        {
            id: 2,
            name: "Minimalist Wooden Table",
            price: 499,
            category: "Dining",
            image: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?q=80&w=1000&auto=format&fit=crop"
        },
        {
            id: 3,
            name: "Industrial Pendant Light",
            price: 199,
            category: "Lighting",
            image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=1000&auto=format&fit=crop"
        },
        {
            id: 4,
            name: "Ceramic Vase Set",
            price: 89,
            category: "Decor",
            image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1000&auto=format&fit=crop"
        },
        {
            id: 4,
            name: "Ceramic Vase Set",
            price: 89,
            category: "Decor",
            image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1000&auto=format&fit=crop"
        }
    ]
};

// DOM Elements
const cartCount = document.querySelector('.cart-count');

// Functions
function updateCartCount() {
    if (cartCount) {
        const totalItems = state.cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = state.cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();

    // Show feedback (could be a toast)
    alert(`${product.name} added to cart!`);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Auth Logic
    function switchAuthView(view) {
        const loginView = document.getElementById('login-view');
        const signupView = document.getElementById('signup-view');

        if (loginView && signupView) { // Check if elements exist
            if (view === 'login') {
                loginView.style.display = 'block';
                signupView.style.display = 'none';
            } else {
                loginView.style.display = 'none';
                signupView.style.display = 'block';
            }
        }
    }

    function handleLogin(e) {
        e.preventDefault();
        const emailInput = document.getElementById('login-email');
        if (emailInput) {
            const email = emailInput.value;
            // Mock login
            alert(`Successfully logged in as ${email}`);
            window.location.href = 'index.html';
        }
    }

    function handleSignup(e) {
        e.preventDefault();
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const confirmInput = document.getElementById('signup-confirm');

        if (nameInput && emailInput && passwordInput && confirmInput) {
            const name = nameInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;
            const confirm = confirmInput.value;

            if (password !== confirm) {
                alert('Passwords do not match!');
                return;
            }

            // Mock signup
            alert(`Account created successfully for ${name}! Please sign in.`);
            switchAuthView('login');
        }
    }

    // Mobile Menu Logic
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
});
