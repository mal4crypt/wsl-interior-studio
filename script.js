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

// Admin Emails
const ADMIN_EMAILS = ['mal4crypt404@gmail.com', 'mailwaro.online@gmail.com'];

const state = {
    users: [],
    products: [],
    contactInfo: defaultContactInfo,
    transactions: [],
    reviews: [],
    currentUser: null
};

// Initialize Firebase Listeners
function initFirebase() {
    // Auth Listener
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Get user details from Firestore
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                state.currentUser = { ...doc.data(), uid: user.uid };
                updateUIForUser();
            }
        } else {
            state.currentUser = null;
            updateUIForUser();
        }
    });

    // Products Listener
    db.collection('products').onSnapshot((snapshot) => {
        state.products = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Ensure each product has an 'id' field; use doc.id if missing
            if (!data.id) data.id = doc.id;
            state.products.push(data);
        });
        renderProductsTable();
        // If no products exist, upload default set
        if (state.products.length === 0) {
            uploadDefaultProducts();
        }
    }, (error) => {
        console.error("Error getting products:", error);
        showNotification("Database Error: " + error.message + ". Check Firestore Rules.", 'error');
    });

    // Transactions Listener (for Admin)
    db.collection('orders').onSnapshot((snapshot) => {
        state.transactions = [];
        snapshot.forEach((doc) => {
            state.transactions.push({ id: doc.id, ...doc.data() });
        });
        if (window.location.pathname.includes('admin.html')) {
            renderTransactionsTable();
        }
    }, (error) => {
        console.error("Error getting orders:", error);
        if (state.currentUser && state.currentUser.isAdmin) {
            showNotification("Order Sync Error: " + error.message, 'error');
        }
    });
}

function uploadDefaultProducts() {
    // Preserve the predefined IDs by using them as document IDs
    defaultProducts.forEach(p => {
        const docRef = db.collection('products').doc(String(p.id));
        docRef.set(p)
            .then(() => console.log("Default product uploaded with ID " + p.id))
            .catch(e => {
                console.error("Error uploading default:", e);
                showNotification("Upload Error: " + e.message + ". Check Firestore Rules.", 'error');
            });
    });
}

// DOM Elements
const cartCount = document.querySelector('.cart-count');

// Functions
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `toast-notification ${type}`;

    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';

    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateCartCount() {
    if (cartCount) {
        let count = 0;
        if (state.currentUser && state.currentUser.cart) {
            count = state.currentUser.cart.reduce((total, item) => total + item.quantity, 0);
        }
        cartCount.textContent = count;
    }
}

function updateUIForUser() {
    // Refresh UI elements after auth state changes
    updateCartCount();
    // Additional UI updates can be added here
}


function addToCart(productId) {
    if (!state.currentUser) {
        showNotification("Please sign in to add items to your cart.", 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    // Find user in persistent storage to update
    const userIndex = state.users.findIndex(u => u.email === state.currentUser.email);
    if (userIndex === -1) return;

    const userCart = state.users[userIndex].cart || [];
    const existingItem = userCart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        userCart.push({ ...product, quantity: 1 });
    }

    // Update state
    state.users[userIndex].cart = userCart;
    state.currentUser.cart = userCart; // Update session user too

    saveUsers();
    saveUser(); // Save session
    updateCartCount();

    // Show feedback
    showNotification(`${product.name} added to cart!`, 'success');
}

function toggleWishlist(productId) {
    if (!state.currentUser) {
        showNotification("Please sign in to save items.", 'error');
        return;
    }

    const userIndex = state.users.findIndex(u => u.email === state.currentUser.email);
    if (userIndex === -1) return;

    let wishlist = state.users[userIndex].wishlist || [];
    const existingIndex = wishlist.findIndex(id => id === productId);

    if (existingIndex !== -1) {
        // Remove
        wishlist.splice(existingIndex, 1);
        showNotification("Removed from wishlist", 'info');
    } else {
        // Add
        wishlist.push(productId);
        showNotification("Added to wishlist", 'success');
    }

    // Update state
    state.users[userIndex].wishlist = wishlist;
    state.currentUser.wishlist = wishlist;

    saveUsers();
    saveUser();

    // Update UI if on page
    updateWishlistIcons();
}

function updateWishlistIcons() {
    const buttons = document.querySelectorAll('.wishlist-btn');
    const wishlist = state.currentUser?.wishlist || [];

    buttons.forEach(btn => {
        const id = parseInt(btn.dataset.id);
        if (wishlist.includes(id)) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="far fa-heart"></i>';
        }
    });
}

function saveUsers() {
    // No-op: Users are saved directly to Firestore
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(state.products));
}

function saveContactInfo() {
    localStorage.setItem('contactInfo', JSON.stringify(state.contactInfo));
}

function saveTransactions() {
    // No-op: Transactions are saved directly to Firestore
}

function saveReviews() {
    localStorage.setItem('reviews', JSON.stringify(state.reviews));
}

async function saveUser() {
    if (state.currentUser) {
        await db.collection('users').doc(state.currentUser.uid).set(state.currentUser);
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(price);
}

async function registerUser(name, email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        let username = document.getElementById('signup-username')?.value?.trim();
        if (!username) {
            if (email === 'mal4crypt404@gmail.com') {
                username = 'mal4crypt';
            } else {
                username = email.split('@')[0];
            }
        }

        const newUser = {
            email,
            name,
            username,
            cart: [],
            wishlist: [],
            notifications: [],
            isAdmin: ADMIN_EMAILS.includes(email)
        };

        // Save to Firestore
        await db.collection('users').doc(user.uid).set(newUser);

        showNotification('Account created successfully!', 'success');
        return true;
    } catch (error) {
        showNotification(error.message, 'error');
        return false;
    }
}

async function loginUser(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showNotification('Logged in successfully!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function logoutUser() {
    state.currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function deleteAccount() {
    if (!state.currentUser) return;

    if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
        state.users = state.users.filter(u => u.email !== state.currentUser.email);
        saveUsers();
        logoutUser();
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
    updateCartCount();
    initSearch(); // Initialize search functionality

    // User Dropdown Logic
    const userIcon = document.querySelector('.user-icon');
    if (userIcon) {
        // Replace icon with dropdown trigger container
        const container = document.createElement('div');
        container.className = 'user-dropdown-container';
        container.style.position = 'relative';
        container.style.display = 'inline-block';

        userIcon.parentNode.replaceChild(container, userIcon);
        container.appendChild(userIcon);

        // Update Icon Appearance
        if (state.currentUser) {
            userIcon.innerHTML = `<i class="fas fa-user-circle" style="font-size: 1.2rem;"></i>`;
            userIcon.title = state.currentUser.username || state.currentUser.name;
        } else {
            userIcon.innerHTML = `<i class="fas fa-user" style="font-size: 1.2rem;"></i>`;
        }
        userIcon.href = '#'; // Prevent default navigation

        // Create Dropdown Menu
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown-menu';

        if (state.currentUser) {
            // Logged In Menu
            dropdown.innerHTML = `
                <div class="dropdown-header">
                    <strong>${state.currentUser.username || state.currentUser.name}</strong><br>
                    <small>${state.currentUser.email}</small>
                </div>
                <ul class="dropdown-list">
                    <li><a href="#" onclick="showCartModal()"><i class="fas fa-shopping-cart"></i> See Cart List</a></li>
                    <li><a href="orders.html"><i class="fas fa-box"></i> My Orders</a></li>
                    <li><a href="wishlist.html"><i class="fas fa-heart"></i> My Wishlist</a></li>
                    <li><a href="#" onclick="showNotifications()"><i class="fas fa-bell"></i> Notifications <span class="badge" id="notif-badge">${state.currentUser.notifications ? state.currentUser.notifications.length : 0}</span></a></li>
                    <li><a href="#" onclick="showHelp()"><i class="fas fa-question-circle"></i> Help / FAQ</a></li>
                    ${state.currentUser.isAdmin ? '<li><a href="admin.html"><i class="fas fa-tachometer-alt"></i> Admin Dashboard</a></li>' : ''}
                    <li><a href="#" onclick="switchUser()"><i class="fas fa-users"></i> Switch User</a></li>
                    <li><a href="#" onclick="deleteAccount()" style="color: red;"><i class="fas fa-trash"></i> Delete Account</a></li>
                    <li><a href="#" onclick="logoutUser()"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                </ul>
            `;
        } else {
            // Guest Menu
            dropdown.innerHTML = `
                <ul class="dropdown-list">
                    <li><a href="login.html"><i class="fas fa-sign-in-alt"></i> Sign In</a></li>
                    <li><a href="login.html"><i class="fas fa-user-plus"></i> Sign Up</a></li>
                    <li><a href="#" onclick="showHelp()"><i class="fas fa-question-circle"></i> Help / FAQ</a></li>
                </ul>
            `;
        }

        container.appendChild(dropdown);

        // Toggle Dropdown
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent immediate close
            dropdown.classList.toggle('active');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });

        // Inject "Admin" link if user is admin (Legacy request, keeping it)
        if (state.currentUser && state.currentUser.isAdmin) {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks && !document.querySelector('.admin-link')) {
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.textContent = 'Admin';
                adminLink.className = 'admin-link';
                adminLink.style.color = 'var(--primary-color)';
                adminLink.style.fontWeight = '600';
                navLinks.appendChild(adminLink);
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
                // For now, password check is skipped/mocked
                loginUser(email, 'password');
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
                    showNotification('Passwords do not match!', 'error');
                    return;
                }

                if (registerUser(name, email, password)) {
                    showNotification(`Account created successfully for ${name}! Logging you in...`, 'success');
                    setTimeout(() => {
                        loginUser(email, password);
                    }, 1500);
                }
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

// Global Helpers for Dropdown Actions
window.switchUser = function () {
    logoutUser();
    window.location.href = 'login.html';
}

window.showCartModal = function () {
    if (!state.currentUser) return;
    const cartItems = state.currentUser.cart || [];
    let content = '<h3>Your Cart List</h3>';
    if (cartItems.length === 0) {
        content += '<p>Your cart is empty.</p>';
    } else {
        content += '<ul style="list-style: none; padding: 0;">';
        cartItems.forEach(item => {
            content += `<li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                <strong>${item.name}</strong><br>
                <small>${formatPrice(item.price)} x ${item.quantity}</small>
            </li>`;
        });
        content += '</ul>';
        content += '<a href="cart.html" class="btn btn-sm" style="margin-top: 10px; display: inline-block;">Go to Cart Page</a>';
    }
    showModal(content);
}

window.showNotifications = function () {
    if (!state.currentUser) return;
    const notifs = state.currentUser.notifications || [];
    let content = '<h3>Notifications</h3>';
    if (notifs.length === 0) {
        content += '<p>No new notifications.</p>';
    } else {
        content += '<ul style="list-style: none; padding: 0;">';
        notifs.forEach(n => {
            content += `<li style="margin-bottom: 10px; background: #f9f9f9; padding: 10px; border-radius: 4px;">
                <small style="color: #888;">${n.date}</small><br>
                ${n.message}
            </li>`;
        });
        content += '</ul>';
    }
    showModal(content);
}

window.showHelp = function () {
    const content = `
        <h3>Help & FAQ</h3>
        <details style="margin-bottom: 10px;">
            <summary><strong>How do I track my order?</strong></summary>
            <p>You can track your order status in the "Transactions" section if you have purchased items.</p>
        </details>
        <details style="margin-bottom: 10px;">
            <summary><strong>What is the return policy?</strong></summary>
            <p>We accept returns within 30 days of delivery. Please contact support for assistance.</p>
        </details>
        <details>
            <summary><strong>How do I contact support?</strong></summary>
            <p>You can use the Contact page or WhatsApp us directly.</p>
        </details>
    `;
    showModal(content);
}

// Generic Modal Helper
function showModal(htmlContent) {
    // Remove existing modal if any
    const existing = document.getElementById('dynamic-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'dynamic-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%; position: relative;
    `;

    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute; top: 10px; right: 15px; font-size: 1.5rem; cursor: pointer;
    `;
    closeBtn.onclick = () => modal.remove();

    content.innerHTML = htmlContent;
    content.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    }
}
// Search Functionality
function initSearch() {
    // Create Modal HTML
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <button class="search-close">&times;</button>
        <div class="search-container">
            <input type="text" class="search-input" placeholder="Search products...">
            <div class="search-results"></div>
        </div>
    `;
    document.body.appendChild(modal);

    // Elements
    const searchTrigger = document.querySelector('.fa-search')?.parentElement;
    const closeBtn = modal.querySelector('.search-close');
    const input = modal.querySelector('.search-input');
    const resultsContainer = modal.querySelector('.search-results');

    if (!searchTrigger) return;

    // Event Listeners
    searchTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
        input.focus();
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        input.value = '';
        resultsContainer.innerHTML = '';
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Search Logic
    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        resultsContainer.innerHTML = '';

        if (query.length < 2) return;

        const results = state.products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1;">No products found</p>';
            return;
        }

        results.forEach(product => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.onclick = () => window.location.href = `product.html?id=${product.id}`;
            item.innerHTML = `
                <img src="${product.image}" class="search-result-image" alt="${product.name}">
                <div class="search-result-title">${product.name}</div>
                <div class="search-result-price">${formatPrice(product.price)}</div>
            `;
            resultsContainer.appendChild(item);
        });
    });
}

// Review Functionality
function addReview(productId, rating, comment) {
    if (!state.currentUser) {
        showNotification("Please sign in to leave a review.", 'error');
        return false;
    }

    const review = {
        id: Date.now(),
        productId: parseInt(productId),
        user: state.currentUser.name,
        rating: parseInt(rating),
        comment: comment,
        date: new Date().toISOString()
    };

    state.reviews.push(review);
    saveReviews();
    showNotification("Review submitted successfully!", 'success');
    return true;
}

function getProductReviews(productId) {
    return state.reviews.filter(r => r.productId === parseInt(productId)).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getAverageRating(productId) {
    const reviews = getProductReviews(productId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Admin Product Management
async function addProduct(product) {
    if (!state.currentUser || !state.currentUser.isAdmin) return false;
    try {
        // Remove ID as Firestore generates it, or use it if provided
        const { id, ...data } = product;
        await db.collection('products').add(data);
        showNotification("Product added successfully!", 'success');
        return true;
    } catch (e) {
        showNotification(e.message, 'error');
        return false;
    }
}

async function updateProduct(id, updates) {
    if (!state.currentUser || !state.currentUser.isAdmin) return false;
    try {
        // Find doc ID by product ID field (since we stored ID in field)
        // Actually, better to use doc ID. But our state uses 'id' field.
        // Let's assume state.products has 'id' as doc ID now (from initFirebase)
        await db.collection('products').doc(id).update(updates);
        showNotification("Product updated successfully!", 'success');
        return true;
    } catch (e) {
        showNotification(e.message, 'error');
        return false;
    }
}

async function deleteProduct(id) {
    if (!state.currentUser || !state.currentUser.isAdmin) return false;
    try {
        await db.collection('products').doc(id).delete();
        showNotification("Product deleted successfully!", 'success');
        return true;
    } catch (e) {
        showNotification(e.message, 'error');
        return false;
    }
}

// Admin Order Management
async function updateOrderStatus(orderId, newStatus) {
    if (!state.currentUser || !state.currentUser.isAdmin) {
        showNotification("Unauthorized action.", 'error');
        return false;
    }

    try {
        await db.collection('orders').doc(String(orderId)).update({ status: newStatus });
        showNotification(`Order status updated to ${newStatus}`, 'success');
        return true;
    } catch (e) {
        showNotification(e.message, 'error');
        return false;
    }
}

// Auth Enhancements
function handleSocialLogin(provider) {
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    const email = `user@${provider}.com`; // Mock email

    // Check if user exists
    let user = state.users.find(u => u.email === email);

    if (!user) {
        // Create new user
        user = {
            name: `${providerName} User`,
            email: email,
            username: `${provider}_user`,
            password: 'social_login_dummy_password', // Not used for social login
            cart: [],
            wishlist: [],
            notifications: [],
            isAdmin: false,
            provider: provider
        };
        state.users.push(user);
        saveUsers();
        showNotification(`Account created with ${providerName}!`, 'success');
    } else {
        showNotification(`Welcome back, ${user.name}!`, 'success');
    }

    // Login
    state.currentUser = user;
    saveUser();

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

let isResetting = false;

function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const btn = document.getElementById('forgot-btn');
    const fields = document.getElementById('reset-fields');

    if (!isResetting) {
        // Step 1: Verify Email
        const user = state.users.find(u => u.email === email);
        if (!user) {
            showNotification("No account found with this email.", 'error');
            return;
        }

        // Simulate sending email / Show fields
        showNotification("Reset link sent! (Simulated: Enter new password below)", 'success');
        fields.style.display = 'block';
        document.getElementById('forgot-email').disabled = true;
        btn.textContent = "Reset Password";
        isResetting = true;
    } else {
        // Step 2: Reset Password
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-new-password').value;

        if (newPass !== confirmPass) {
            showNotification("Passwords do not match!", 'error');
            return;
        }

        if (newPass.length < 6) {
            showNotification("Password must be at least 6 characters.", 'error');
            return;
        }

        // Update User
        const userIndex = state.users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            state.users[userIndex].password = newPass;
            saveUsers();
            showNotification("Password reset successfully! Please sign in.", 'success');

            setTimeout(() => {
                switchAuthView('login');
                // Reset form
                e.target.reset();
                fields.style.display = 'none';
                document.getElementById('forgot-email').disabled = false;
                btn.textContent = "Send Reset Link";
                isResetting = false;
            }, 2000);
        }
    }
}
