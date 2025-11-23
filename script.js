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
            price: 1899,
            category: "Living Room",
            image: "images/luxury-armchairs.jpg"
        },
        {
            id: 8,
            name: "Modern Mustard Lounge Chair",
            price: 899,
            category: "Living Room",
            image: "images/modern-yellow-chair.jpg"
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
