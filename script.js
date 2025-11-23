// State Management
const defaultProducts = [
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
        id: 5,
        name: "Luxury Dining Set",
        price: 2499,
        category: "Dining",
        image: "images/dining-set.jpg"
    },
    {
        id: 6,
        name: "Contemporary Sofa Suite",
        price: 3299,
        category: "Living Room",
        image: "images/sofa-set.jpg"
    },
    {
        id: 7,
        name: "Luxury Armchair Pair",
        price: 1599,
        category: "Living Room",
        image: "images/luxury-armchairs.jpg"
    },
    {
        id: 8,
        name: "Modern Mustard Lounge Chair",
        price: 799,
        category: "Living Room",
        image: "images/modern-yellow-chair.jpg"
    },
    {
        id: 9,
        name: "Minimalist Grey Sofa",
        price: 1899,
        category: "Living Room",
        image: "images/minimalist-sofa.jpg"
    },
    {
        id: 10,
        name: "Modern Two-Tone Sofa",
        price: 2199,
        category: "Living Room",
        image: "images/modern-grey-sofa.jpg"
    },
    {
        id: 11,
        name: "Curved Luxury Sofa",
        price: 2899,
        category: "Living Room",
        image: "images/curved-luxury-sofa.jpg"
    }
];

const defaultContactInfo = {
    email: "mailwaro.online@gmail.com",
    phone: "+234 901 088 3999",
    whatsapp: "+234 901 088 3999",
    address: "Gwarinpa, 900108, FCT Nigeria"
};

const state = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    products: JSON.parse(localStorage.getItem('products')) || defaultProducts,
    contactInfo: JSON.parse(localStorage.getItem('contactInfo')) || defaultContactInfo,
    transactions: JSON.parse(localStorage.getItem('transactions')) || [],
    currentUser: JSON.parse(localStorage.getItem('currentUser')) || null
};

// Admin Emails
const ADMIN_EMAILS = ['mal4crypt404@gmail.com', 'mailwaro.online@gmail.com'];

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
    if (!state.currentUser) {
        alert("Please sign in to add items to your cart.");
        window.location.href = 'login.html';
        return;
    }

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

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(state.products));
}

function saveContactInfo() {
    localStorage.setItem('contactInfo', JSON.stringify(state.contactInfo));
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(state.transactions));
}

function saveUser() {
    localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function loginUser(email) {
    state.currentUser = { email: email, isAdmin: ADMIN_EMAILS.includes(email) };
    saveUser();

    // User requested to be taken to the home page for both clients and admins
    window.location.href = 'index.html';
}

function logoutUser() {
    state.currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Update User Icon if logged in
    const userIcon = document.querySelector('.user-icon');
    if (userIcon && state.currentUser) {
        userIcon.innerHTML = `<i class="fas fa-user-check" title="${state.currentUser.email}"></i>`;
        userIcon.href = '#'; // Keep as placeholder or link to profile if implemented

        // Inject "Admin" link if user is admin
        if (state.currentUser.isAdmin) {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                // Check if Admin link already exists to avoid duplicates
                if (!document.querySelector('.admin-link')) {
                    const adminLink = document.createElement('a');
                    adminLink.href = 'admin.html';
                    adminLink.textContent = 'Admin';
                    adminLink.className = 'admin-link';
                    adminLink.style.color = 'var(--primary-color)';
                    adminLink.style.fontWeight = '600';

                    // Insert after Contact link (last child usually)
                    navLinks.appendChild(adminLink);
                }
            }
        }
    }

    // Auth Logic (Only if on login page)
    if (document.getElementById('login-view')) {
        window.handleLogin = function (e) {
            e.preventDefault();
            const emailInput = document.getElementById('login-email');
            if (emailInput) {
                const email = emailInput.value;
                // Mock login
                alert(`Successfully logged in as ${email}`);
                loginUser(email);
            }
        };

        window.handleSignup = function (e) {
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

                // Mock signup and auto-login
                alert(`Account created successfully for ${name}! Logging you in...`);
                loginUser(email);
            }
        };
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

    // Inject Contact Info (Footer)
    const footerEmail = document.querySelector('.footer-col li:nth-child(1)');
    const footerPhone = document.querySelector('.footer-col li:nth-child(2)');
    const footerWhatsapp = document.querySelector('.footer-col li:nth-child(3)');
    const footerAddress = document.querySelector('.footer-col li:nth-child(4)');

    if (footerEmail && state.contactInfo) {
        footerEmail.innerHTML = `<i class="fas fa-envelope"></i> ${state.contactInfo.email}`;
        footerPhone.innerHTML = `<i class="fas fa-phone"></i> ${state.contactInfo.phone}`;
        footerWhatsapp.innerHTML = `<i class="fab fa-whatsapp"></i> ${state.contactInfo.whatsapp}`;
        footerAddress.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${state.contactInfo.address}`;
    }
});
