// WSL Bot Integration

const botState = {
    isOpen: false,
    chatHistory: [],
    step: 'idle', // idle, recording_transaction, messaging_admin, guided_discovery, price_negotiation, problem_reporting, payment_shipping, human_escalation, order_tracking
    data: {}, // Generic data holder for multi-step flows
    position: JSON.parse(localStorage.getItem('botPosition')) || null, // {x, y}
    isDragging: false,
    userPreferences: JSON.parse(localStorage.getItem('botUserPreferences')) || {} // Store user preferences
};

// Helper function to check if bot recording is enabled
function isBotRecordingEnabled() {
    const settings = JSON.parse(localStorage.getItem('botSettings')) || { recordingEnabled: true };
    return settings.recordingEnabled !== false; // Default to true if not set
}

// Expanded Knowledge Base & Intent Matching
const intents = [
    {
        keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
        response: "Hello! I'm WSL Bot. I can help you find products, negotiate prices, report problems, confirm payments, or send messages to the admin. What would you like to do?"
    },
    {
        keywords: ['help', 'support', 'assist', 'what can you do'],
        response: "I can help with:<br>• **Finding Products**: Type 'cheapest chair' or 'help me choose'.<br>• **Price Negotiation**: Type 'negotiate price'.<br>• **Problem Reporting**: Type 'report a problem'.<br>• **Payment/Shipping**: Type 'confirm payment'.<br>• **Transactions**: Type 'record transaction'.<br>• **Contact**: Type 'leave a message'.<br>• **Navigation**: Type 'where is the shop'."
    },
    {
        keywords: ['contact', 'email', 'phone', 'whatsapp', 'reach', 'call'],
        response: "You can reach us via:<br>• **WhatsApp**: +234 901 088 3999<br>• **Email**: mailwaro.online@gmail.com<br>• **Phone**: +234 901 088 3999<br>Or type 'leave a message' to send a note directly here."
    },
    {
        keywords: ['hours', 'open', 'close', 'timing', 'schedule', 'when are you open'],
        response: "We're open Monday to Saturday, 9:00 AM - 6:00 PM. We're closed on Sundays. For urgent inquiries, you can WhatsApp us anytime at +234 901 088 3999."
    },
    {
        keywords: ['return', 'refund', 'policy', 'exchange', 'money back'],
        response: "We accept returns within 30 days of delivery for unused items in original packaging. Refunds are processed within 7-10 business days. Please contact support for assistance."
    },
    {
        keywords: ['warranty', 'guarantee', 'defect', 'damage'],
        response: "All our products come with a 1-year manufacturer's warranty against defects. If you receive a damaged item, please report it within 48 hours for immediate replacement."
    },
    {
        keywords: ['delivery', 'shipping', 'ship', 'deliver', 'how long'],
        response: "We offer delivery within Lagos (2-3 days) and nationwide shipping (5-7 days). Delivery fees vary by location. Free delivery for orders above $2000!"
    },
    {
        keywords: ['payment', 'pay', 'method', 'card', 'transfer', 'cash'],
        response: "We accept:<br>• Bank Transfer<br>• Credit/Debit Cards<br>• Cash on Delivery (Lagos only)<br>• Mobile Money<br>All payments are secure and encrypted."
    },
    {
        keywords: ['location', 'address', 'where are you', 'visit', 'showroom'],
        response: "Visit our showroom at:<br>**Gwarinpa, 900108, FCT Nigeria**<br><br>We'd love to see you! Our showroom is open Monday-Saturday, 9 AM - 6 PM."
    },
    {
        keywords: ['price', 'cost', 'expensive', 'pricing', 'how much'],
        response: "Our prices range from $199 to $3299 depending on the item. We offer competitive pricing and regular discounts. Type 'cheapest' to see our most affordable items, or 'negotiate price' to request a discount!"
    },
    {
        keywords: ['discount', 'sale', 'offer', 'promo', 'deal'],
        response: "We regularly have special offers! Currently, we offer:<br>• Free delivery on orders above $2000<br>• Bulk purchase discounts<br>• Seasonal sales<br>Type 'negotiate price' to request a custom discount on any item!"
    },
    {
        keywords: ['quality', 'material', 'durable', 'last'],
        response: "We pride ourselves on quality! All our furniture is made from premium materials including solid wood, genuine leather, and high-grade fabrics. Each piece is built to last with proper care."
    },
    {
        keywords: ['custom', 'customize', 'bespoke', 'made to order'],
        response: "Yes, we offer custom furniture design! Share your requirements by typing 'leave a message' and our design team will contact you with options and pricing."
    },
    {
        keywords: ['install', 'assembly', 'setup', 'assemble'],
        response: "We provide free assembly and installation for all furniture purchases in Lagos. For other locations, assembly services are available at an additional fee."
    },
    {
        keywords: ['catalog', 'catalogue', 'products', 'items', 'what do you sell'],
        response: "We specialize in luxury interior furniture including:<br>• Living Room (sofas, chairs, tables)<br>• Dining Sets<br>• Lighting<br>• Decor & Accessories<br>Type 'go to shop' to browse our full catalogue!"
    },
    {
        keywords: ['thank', 'thanks', 'appreciate'],
        response: "You're very welcome! I'm here anytime you need assistance. Is there anything else I can help you with?"
    },
    {
        keywords: ['bye', 'goodbye', 'see you', 'later'],
        response: "Thank you for chatting with me! Feel free to reach out anytime. Have a wonderful day! 👋"
    },
    {
        keywords: ['human', 'agent', 'talk to someone', 'speak to person', 'real person', 'representative'],
        response: "I understand you'd like to speak with a human agent. Let me connect you!"
    },
    {
        keywords: ['track', 'order status', 'where is my order', 'tracking', 'delivery status'],
        response: "I can help you track your order! Please provide your order ID or transaction number."
    },
    {
        keywords: ['recommend', 'suggest', 'what should i buy', 'help me choose', 'best for me'],
        response: "I'd love to help you find the perfect item! Let me ask you a few questions."
    },
    // Category-based intents
    {
        keywords: ['sit', 'seat', 'couch', 'lounge'],
        category: 'Living Room',
        response: "It sounds like you're looking for seating. Check out our sofas and armchairs!"
    },
    {
        keywords: ['eat', 'dining', 'food', 'table'],
        category: 'Dining',
        response: "Looking to upgrade your dining area? Here are some tables and sets."
    },
    {
        keywords: ['dark', 'bright', 'lamp', 'light'],
        category: 'Lighting',
        response: "Let's brighten things up! Here are our lighting options."
    }
];

// UI Injection
document.addEventListener('DOMContentLoaded', () => {
    // Do not show on login page
    if (window.location.pathname.includes('login.html')) return;

    injectBotUI();
    attachEventListeners();
});

function injectBotUI() {
    const botContainer = document.createElement('div');
    botContainer.id = 'wsl-bot-container';
    botContainer.innerHTML = `
        <div id="wsl-chat-window" class="hidden">
            <div class="chat-header">
                <span>WSL Bot 🤖</span>
                <button id="close-chat">&times;</button>
            </div>
            <div id="chat-messages">
                <div class="message bot">My name is WSL Bot, your personal assistant. How may I help you today?</div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Type a message...">
                <button id="send-btn"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
        <button id="wsl-bot-bubble">
            <svg viewBox="0 0 100 100" width="32" height="32" fill="white">
                <!-- Robot head -->
                <circle cx="50" cy="50" r="20" fill="white"/>
                <!-- Eyes -->
                <circle cx="43" cy="48" r="3" fill="#C19A6B"/>
                <circle cx="57" cy="48" r="3" fill="#C19A6B"/>
                <!-- Antenna -->
                <line x1="50" y1="30" x2="50" y2="22" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <circle cx="50" cy="20" r="3" fill="white"/>
                <!-- Chat bubble outline -->
                <path d="M 30 45 Q 28 45 28 47 L 28 60 Q 28 62 30 62 L 35 62 L 38 67 L 38 62 L 45 62 Q 47 62 47 60 L 47 47 Q 47 45 45 45 Z" fill="white" opacity="0.3"/>
                <path d="M 53 45 Q 55 45 55 47 L 55 60 Q 55 62 53 62 L 62 62 L 65 67 L 65 62 L 70 62 Q 72 62 72 60 L 72 47 Q 72 45 70 45 Z" fill="white" opacity="0.3"/>
                <!-- Headphones -->
                <path d="M 30 45 Q 30 35 35 35" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <circle cx="32" cy="48" r="4" fill="white"/>
                <path d="M 70 45 Q 70 35 65 35" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                <circle cx="68" cy="48" r="4" fill="white"/>
            </svg>
        </button>
    `;
    document.body.appendChild(botContainer);

    // Add Styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        #wsl-bot-container {
            position: fixed;
            bottom: ${botState.position ? 'auto' : '20px'};
            right: ${botState.position ? 'auto' : '20px'};
            ${botState.position ? `left: ${botState.position.x}px; top: ${botState.position.y}px;` : ''}
            z-index: 9999;
            font-family: 'Inter', sans-serif;
            cursor: move;
            user-select: none;
        }
        #wsl-bot-bubble {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #C19A6B 0%, #8B7355 100%);
            color: white;
            border: none;
            box-shadow: 0 8px 24px rgba(193, 154, 107, 0.4), 0 4px 8px rgba(0,0,0,0.15);
            cursor: pointer;
            font-size: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        #wsl-bot-bubble::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s;
        }
        #wsl-bot-bubble:hover {
            transform: scale(1.1) translateY(-2px);
            box-shadow: 0 12px 32px rgba(193, 154, 107, 0.5), 0 6px 12px rgba(0,0,0,0.2);
        }
        #wsl-bot-bubble:hover::before {
            opacity: 1;
        }
        #wsl-bot-bubble:active {
            transform: scale(1.05);
        }
        #wsl-chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 350px;
            height: 450px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: opacity 0.3s, transform 0.3s;
            transform-origin: bottom right;
        }
        #wsl-chat-window.hidden {
            display: none;
            opacity: 0;
            transform: scale(0.9);
        }
        .chat-header {
            background: var(--primary-color, #C19A6B);
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
        }
        #close-chat {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        }
        #chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f9f9f9;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .message {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 14px;
            line-height: 1.4;
        }
        .message.bot {
            background: #e9ecef;
            color: #333;
            align-self: flex-start;
            border-bottom-left-radius: 2px;
        }
        .message.user {
            background: var(--primary-color, #C19A6B);
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 2px;
        }
        .chat-input-area {
            padding: 10px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
            background: white;
        }
        #chat-input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
        }
        #send-btn {
            background: var(--primary-color, #C19A6B);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .product-card-mini {
            display: flex;
            gap: 10px;
            background: white;
            padding: 10px;
            border-radius: 8px;
            margin-top: 5px;
            border: 1px solid #eee;
            cursor: pointer;
        }
        .product-card-mini img {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 4px;
        }
        .quick-reply-btn {
            background: white;
            border: 1px solid var(--primary-color, #C19A6B);
            color: var(--primary-color, #C19A6B);
            padding: 5px 10px;
            border-radius: 15px;
            cursor: pointer;
            margin: 2px;
            font-size: 12px;
        }
        .quick-reply-btn:hover {
            background: var(--primary-color, #C19A6B);
            color: white;
        }
        
        @media (max-width: 768px) {
            #wsl-chat-window {
                width: 90vw;
                max-width: 350px;
            }
        }
    `;
    document.head.appendChild(style);
}

function attachEventListeners() {
    const bubble = document.getElementById('wsl-bot-bubble');
    const chatWindow = document.getElementById('wsl-chat-window');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('chat-input');
    const container = document.getElementById('wsl-bot-container');

    // Draggable functionality
    let dragOffset = { x: 0, y: 0 };
    let startPos = { x: 0, y: 0 };

    const onMouseDown = (e) => {
        // Don't drag if clicking on chat window or input
        if (e.target.closest('#wsl-chat-window') || e.target.closest('#chat-input')) return;

        botState.isDragging = true;
        startPos = {
            x: e.clientX || (e.touches && e.touches[0].clientX),
            y: e.clientY || (e.touches && e.touches[0].clientY)
        };

        const rect = container.getBoundingClientRect();
        dragOffset = {
            x: startPos.x - rect.left,
            y: startPos.y - rect.top
        };

        container.style.opacity = '0.8';
        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!botState.isDragging) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        let newX = clientX - dragOffset.x;
        let newY = clientY - dragOffset.y;

        // Constrain to viewport
        const maxX = window.innerWidth - container.offsetWidth;
        const maxY = window.innerHeight - container.offsetHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        container.style.left = newX + 'px';
        container.style.top = newY + 'px';
        container.style.bottom = 'auto';
        container.style.right = 'auto';

        e.preventDefault();
    };

    const onMouseUp = (e) => {
        if (!botState.isDragging) return;

        botState.isDragging = false;
        container.style.opacity = '1';

        // Save position
        const rect = container.getBoundingClientRect();
        botState.position = { x: rect.left, y: rect.top };
        localStorage.setItem('botPosition', JSON.stringify(botState.position));
    };

    // Mouse events
    container.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Touch events for mobile
    container.addEventListener('touchstart', onMouseDown, { passive: false });
    document.addEventListener('touchmove', onMouseMove, { passive: false });
    document.addEventListener('touchend', onMouseUp);

    // Chat functionality
    bubble.addEventListener('click', (e) => {
        if (botState.isDragging) return; // Don't toggle if we just dragged
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            input.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';

        // Simulate thinking delay
        setTimeout(() => {
            processMessage(text);
        }, 500);
    }
}

function addMessage(text, sender) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = text; // Allow HTML for links/products
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function processMessage(text) {
    const lowerText = text.toLowerCase();

    // 1. Handle Active Flows
    if (botState.step === 'recording_transaction') {
        handleTransactionStep(text);
        return;
    }
    if (botState.step === 'messaging_admin') {
        handleMessagingStep(text);
        return;
    }
    if (botState.step === 'guided_discovery') {
        handleDiscoveryStep(text);
        return;
    }
    if (botState.step === 'price_negotiation') {
        handleNegotiationStep(text);
        return;
    }
    if (botState.step === 'problem_reporting') {
        handleProblemReportingStep(text);
        return;
    }
    if (botState.step === 'payment_shipping') {
        handlePaymentShippingStep(text);
        return;
    }
    if (botState.step === 'human_escalation') {
        handleHumanEscalationStep(text);
        return;
    }
    if (botState.step === 'order_tracking') {
        handleOrderTrackingStep(text);
        return;
    }

    // 2. Navigation Intents
    if (lowerText.includes('where is') || lowerText.includes('go to') || lowerText.includes('navigate to') || lowerText.includes('show me')) {
        if (lowerText.includes('shop') || lowerText.includes('store') || lowerText.includes('catalogue')) {
            addMessage("Redirecting you to the Shop...", 'bot');
            setTimeout(() => window.location.href = 'shop.html', 1000);
            return;
        }
        if (lowerText.includes('cart') || lowerText.includes('basket')) {
            addMessage("Taking you to your Cart...", 'bot');
            setTimeout(() => window.location.href = 'cart.html', 1000);
            return;
        }
        if (lowerText.includes('contact') || lowerText.includes('support')) {
            addMessage("Redirecting to Contact page...", 'bot');
            setTimeout(() => window.location.href = 'contact.html', 1000);
            return;
        }
        if (lowerText.includes('home') || lowerText.includes('main')) {
            addMessage("Going to Home page...", 'bot');
            setTimeout(() => window.location.href = 'index.html', 1000);
            return;
        }
        if (lowerText.includes('about') || lowerText.includes('story')) {
            addMessage("Redirecting to About page...", 'bot');
            setTimeout(() => window.location.href = 'about.html', 1000);
            return;
        }
        if (lowerText.includes('it') && (lowerText.includes('where is') || lowerText.includes('find'))) {
            addMessage("If you are looking for our products, I'll take you to the Shop.", 'bot');
            setTimeout(() => window.location.href = 'shop.html', 1500);
            return;
        }
    }

    // 3. Category-Specific Price Search (NEW)
    const categoryKeywords = {
        'chair': 'Living Room',
        'sofa': 'Living Room',
        'couch': 'Living Room',
        'armchair': 'Living Room',
        'table': 'Dining',
        'dining': 'Dining',
        'light': 'Lighting',
        'lamp': 'Lighting',
        'decor': 'Decor'
    };

    if (lowerText.includes('cheap') || lowerText.includes('lowest') || lowerText.includes('affordable') || lowerText.includes('budget')) {
        let foundCategory = null;
        for (const [keyword, category] of Object.entries(categoryKeywords)) {
            if (lowerText.includes(keyword)) {
                foundCategory = category;
                break;
            }
        }

        if (foundCategory) {
            recommendCheapestByCategory(foundCategory);
            return;
        } else {
            // General cheapest
            recommendCheapestProducts();
            return;
        }
    }

    // 4. Price Negotiation (NEW)
    if (lowerText.includes('negotiate') || lowerText.includes('discount') || lowerText.includes('lower price') || lowerText.includes('bargain')) {
        botState.step = 'price_negotiation';
        botState.data = { step: 0 };
        addMessage("I can help you request a price negotiation! Which **product** are you interested in? (Please provide the product name or ID)", 'bot');
        return;
    }

    // 5. Problem Reporting (NEW)
    if (lowerText.includes('problem') || lowerText.includes('issue') || lowerText.includes('complaint') || lowerText.includes('broken') || lowerText.includes('defect')) {
        botState.step = 'problem_reporting';
        botState.data = { step: 0 };
        addMessage("I'm sorry to hear you're experiencing an issue. Let me help you report this to our admin. What is your **Name**?", 'bot');
        return;
    }

    // 6. Payment & Shipping Confirmation (NEW)
    if (lowerText.includes('payment') || lowerText.includes('shipping') || lowerText.includes('delivery') || lowerText.includes('confirm order')) {
        botState.step = 'payment_shipping';
        botState.data = { step: 0 };
        addMessage("I can help you confirm your payment and shipping details. What is your **Full Name**?", 'bot');
        return;
    }

    // 7. Human Agent Escalation (NEW)
    if (lowerText.includes('human') || lowerText.includes('agent') || lowerText.includes('talk to someone') || lowerText.includes('speak to person') || lowerText.includes('real person')) {
        botState.step = 'human_escalation';
        botState.data = { step: 0 };
        addMessage("I understand you'd like to speak with a human agent. Let me collect some information to connect you. What is your **Name**?", 'bot');
        return;
    }

    // 8. Order Tracking (NEW)
    if (lowerText.includes('track') || lowerText.includes('order status') || lowerText.includes('where is my order') || lowerText.includes('tracking')) {
        botState.step = 'order_tracking';
        botState.data = { step: 0 };
        addMessage("I can help you track your order! Please provide your **Order ID** or **Transaction Number**.", 'bot');
        return;
    }

    // 9. Trigger Existing Flows
    if (lowerText.includes('record transaction') || lowerText.includes('new sale')) {
        botState.step = 'recording_transaction';
        botState.data = { step: 0 };
        addMessage("Sure, I can help you record a transaction. What is the **Client's Name**?", 'bot');
        return;
    }

    if (lowerText.includes('leave a message') || lowerText.includes('message admin') || lowerText.includes('contact admin')) {
        botState.step = 'messaging_admin';
        botState.data = { step: 0 };
        addMessage("Okay, I'll send a message to the admin for you. What is your **Name**?", 'bot');
        return;
    }

    if (lowerText.includes('choose') || lowerText.includes('unsure') || lowerText.includes('recommend') || lowerText.includes('help me find') || lowerText.includes('suggest') || lowerText.includes('what should i buy')) {
        botState.step = 'guided_discovery';
        botState.data = { step: 0 };
        // Check if user has previous preferences
        const currentUser = window.state && window.state.currentUser;
        if (currentUser && botState.userPreferences[currentUser.email]) {
            const prefs = botState.userPreferences[currentUser.email];
            addMessage(`Welcome back! I remember you were interested in **${prefs.category || 'furniture'}**. Would you like similar recommendations, or are you looking for something different today? (Type 'similar' or 'different')`, 'bot');
        } else {
            addMessage("I can help you find the perfect item! First, which **Room** are you furnishing? (e.g., Living Room, Dining, Bedroom)", 'bot');
        }
        return;
    }

    // 8. Implicit Product Matching
    if (lowerText.includes('sofa') || lowerText.includes('chair') || lowerText.includes('table') || lowerText.includes('light') || lowerText.includes('decor')) {
        const keyword = lowerText.match(/(sofa|chair|table|light|decor)/)[0];
        recommendProducts(keyword);
        return;
    }

    // Check intents for category matching
    for (const intent of intents) {
        if (intent.keywords.some(k => lowerText.includes(k))) {
            if (intent.category) {
                addMessage(intent.response, 'bot');
                recommendProducts(intent.category);
                return;
            }
            addMessage(intent.response, 'bot');
            return;
        }
    }

    // 9. Fallback
    // 9. Intelligent Fallback
    addMessage("I'm here to help! While I may not have a specific answer to that question, I can assist you with:<br><br>🛋️ **Furniture Shopping**: Browse products, get recommendations, find deals<br>💰 **Pricing**: Negotiate discounts, check prices, payment options<br>📦 **Orders**: Confirm payments, track delivery, report issues<br>📞 **Contact**: Reach our team, leave a message, get support<br>ℹ️ **Info**: Business hours, location, policies, warranties<br><br>What would you like help with today?", 'bot');
}

function recommendProducts(keyword) {
    const products = (window.state && window.state.products) ? window.state.products : [];

    const matches = products.filter(p =>
        p.name.toLowerCase().includes(keyword.toLowerCase()) ||
        p.category.toLowerCase().includes(keyword.toLowerCase())
    );

    if (matches.length > 0) {
        let msg = `Here are some ${keyword}s I found:<br>`;
        matches.slice(0, 3).forEach(p => {
            msg += `
                <div class="product-card-mini" onclick="window.location.href='product.html?id=${p.id}'">
                    <img src="${p.image}" alt="${p.name}">
                    <div>
                        <strong>${p.name}</strong><br>
                        <small>$${p.price}</small>
                    </div>
                </div>
            `;
        });
        addMessage(msg, 'bot');
    } else {
        addMessage(`I couldn't find any ${keyword}s at the moment. Please check our Shop page.`, 'bot');
    }
}

function recommendCheapestProducts() {
    const products = (window.state && window.state.products) ? window.state.products : [];

    // Sort by price ascending
    const sorted = [...products].sort((a, b) => a.price - b.price);

    if (sorted.length > 0) {
        let msg = `Here are the most affordable items in our catalogue:<br>`;
        sorted.slice(0, 3).forEach(p => {
            msg += `
                <div class="product-card-mini" onclick="window.location.href='product.html?id=${p.id}'">
                    <img src="${p.image}" alt="${p.name}">
                    <div>
                        <strong>${p.name}</strong><br>
                        <small>$${p.price}</small>
                    </div>
                </div>
            `;
        });
        addMessage(msg, 'bot');
    } else {
        addMessage("I couldn't find any products.", 'bot');
    }
}

function recommendCheapestByCategory(category) {
    const products = (window.state && window.state.products) ? window.state.products : [];

    // Filter by category and sort by price
    const filtered = products.filter(p => p.category === category);
    const sorted = [...filtered].sort((a, b) => a.price - b.price);

    if (sorted.length > 0) {
        let msg = `Here are the most affordable ${category} items:<br>`;
        sorted.slice(0, 3).forEach(p => {
            msg += `
                <div class="product-card-mini" onclick="window.location.href='product.html?id=${p.id}'">
                    <img src="${p.image}" alt="${p.name}">
                    <div>
                        <strong>${p.name}</strong><br>
                        <small>$${p.price}</small>
                    </div>
                </div>
            `;
        });
        addMessage(msg, 'bot');
    } else {
        addMessage(`I couldn't find any ${category} items at the moment.`, 'bot');
    }
}

// Flow Handlers

function handleTransactionStep(text) {
    const data = botState.data;
    switch (data.step) {
        case 0: // Name
            data.clientName = text;
            data.step++;
            addMessage("Got it. What is the **Client's Contact (Email or Phone)**?", 'bot');
            break;
        case 1: // Contact
            data.clientContact = text;
            data.step++;
            addMessage("Okay. What **Property/Item** did they buy?", 'bot');
            break;
        case 2: // Property
            data.property = text;
            data.step++;
            addMessage("Almost done. Any notes? (Type 'none' if empty)", 'bot');
            break;
        case 3: // Notes
            data.notes = text;
            const newTransaction = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                clientName: data.clientName,
                clientContact: data.clientContact,
                property: data.property,
                status: 'Pending',
                receipt: 'Generated via Bot'
            };
            if (window.state && window.state.transactions) {
                window.state.transactions.unshift(newTransaction);
                localStorage.setItem('transactions', JSON.stringify(window.state.transactions));
                addMessage(`Transaction recorded! ID: ${newTransaction.id}. Status: Pending.`, 'bot');
            }
            botState.step = 'idle';
            botState.data = {};
            break;
    }
}

function handleMessagingStep(text) {
    const data = botState.data;
    switch (data.step) {
        case 0: // Name
            data.senderName = text;
            data.step++;
            addMessage(`Hi ${data.senderName}. What is your **Email** so we can reply?`, 'bot');
            break;
        case 1: // Email
            data.senderEmail = text;
            data.step++;
            addMessage("Thanks. Please type your **Message** below.", 'bot');
            break;
        case 2: // Message
            data.message = text;

            // Save Message
            const newMessage = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                sender: data.senderName,
                email: data.senderEmail,
                message: data.message,
                read: false
            };

            // Save message only if recording is enabled
            if (isBotRecordingEnabled()) {
                let messages = JSON.parse(localStorage.getItem('botMessages')) || [];
                messages.unshift(newMessage);
                localStorage.setItem('botMessages', JSON.stringify(messages));
            }

            addMessage("Message sent! The admin will get back to you soon.", 'bot');
            botState.step = 'idle';
            botState.data = {};
            break;
    }
}

function handleDiscoveryStep(text) {
    const data = botState.data;
    const lowerText = text.toLowerCase();

    switch (data.step) {
        case 0: // Room
            if (lowerText.includes('living')) data.category = 'Living Room';
            else if (lowerText.includes('dining')) data.category = 'Dining';
            else if (lowerText.includes('bed')) data.category = 'Bedroom';
            else if (lowerText.includes('light')) data.category = 'Lighting';
            else data.category = 'Decor';

            data.step++;
            addMessage(`Great! For the ${data.category}, what is your budget range? (e.g., "under 500", "no limit")`, 'bot');
            break;

        case 1: // Budget
            addMessage(`Understood. Here are some top picks for your ${data.category}:`, 'bot');
            recommendProducts(data.category);
            botState.step = 'idle';
            botState.data = {};
            break;
    }
}

function handleNegotiationStep(text) {
    const data = botState.data;
    const products = (window.state && window.state.products) ? window.state.products : [];

    switch (data.step) {
        case 0: // Product identification
            // Try to find product by name or ID
            const lowerText = text.toLowerCase();
            let product = products.find(p =>
                p.name.toLowerCase().includes(lowerText) ||
                p.id.toString() === text
            );

            if (product) {
                data.product = product;
                const discountPercent = Math.floor(Math.random() * 6) + 5; // 5-10%
                const discountedPrice = (product.price * (1 - discountPercent / 100)).toFixed(2);

                data.discountPercent = discountPercent;
                data.discountedPrice = discountedPrice;
                data.step++;

                addMessage(`Great! I found **${product.name}** (Original Price: $${product.price}).<br><br>I can offer you a **${discountPercent}% discount**, bringing the price to **$${discountedPrice}**.<br><br>What is your **Name** so I can send this request to the admin?`, 'bot');
            } else {
                addMessage("I couldn't find that product. Please try again with the product name or check our Shop page.", 'bot');
                botState.step = 'idle';
                botState.data = {};
            }
            break;

        case 1: // Name
            data.customerName = text;
            data.step++;
            addMessage("Thanks! What is your **Email or Phone** so the admin can contact you?", 'bot');
            break;

        case 2: // Contact
            data.customerContact = text;

            // Save negotiation request to admin inbox
            const negotiationRequest = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                type: 'Price Negotiation',
                sender: data.customerName,
                contact: data.customerContact,
                product: data.product.name,
                originalPrice: data.product.price,
                requestedPrice: data.discountedPrice,
                discount: data.discountPercent + '%',
                status: 'Pending Admin Approval',
                read: false
            };

            // Save negotiation request only if recording is enabled
            if (isBotRecordingEnabled()) {
                let messages = JSON.parse(localStorage.getItem('botMessages')) || [];
                messages.unshift(negotiationRequest);
                localStorage.setItem('botMessages', JSON.stringify(messages));
            }

            addMessage(`Your negotiation request has been submitted! The admin will review your request for **${data.product.name}** at **$${data.discountedPrice}** (${data.discountPercent}% off) and get back to you soon.`, 'bot');
            botState.step = 'idle';
            botState.data = {};
            break;
    }
}

function handleProblemReportingStep(text) {
    const data = botState.data;

    switch (data.step) {
        case 0: // Name
            data.reporterName = text;
            data.step++;
            addMessage(`Hi ${data.reporterName}. What is your **Email or Phone** so we can follow up?`, 'bot');
            break;

        case 1: // Contact
            data.reporterContact = text;
            data.step++;
            addMessage("Please describe the **problem** you're experiencing in detail.", 'bot');
            break;

        case 2: // Problem description
            data.problemDescription = text;

            // Save problem report to admin inbox
            const problemReport = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                type: 'Problem Report',
                sender: data.reporterName,
                contact: data.reporterContact,
                message: data.problemDescription,
                status: 'Pending Review',
                read: false
            };

            // Save problem report only if recording is enabled
            if (isBotRecordingEnabled()) {
                let messages = JSON.parse(localStorage.getItem('botMessages')) || [];
                messages.unshift(problemReport);
                localStorage.setItem('botMessages', JSON.stringify(messages));
            }

            addMessage("Thank you for reporting this issue. Your problem report has been sent to our admin team. We'll investigate and get back to you as soon as possible.", 'bot');
            botState.step = 'idle';
            botState.data = {};
            break;
    }
}

function handlePaymentShippingStep(text) {
    const data = botState.data;

    switch (data.step) {
        case 0: // Name
            data.customerName = text;
            data.step++;
            addMessage("Great! What **payment method** did you use? (e.g., Bank Transfer, Card, Cash)", 'bot');
            break;

        case 1: // Payment method
            data.paymentMethod = text;
            data.step++;
            addMessage("What is the **payment amount**?", 'bot');
            break;

        case 2: // Amount
            data.paymentAmount = text;
            data.step++;
            addMessage("Do you have a **payment reference or transaction ID**? (Type 'none' if not applicable)", 'bot');
            break;

        case 3: // Reference
            data.paymentReference = text;
            data.step++;
            addMessage("Now for shipping details. What is your **delivery address**?", 'bot');
            break;

        case 4: // Address
            data.shippingAddress = text;
            data.step++;
            addMessage("What is your **phone number** for delivery contact?", 'bot');
            break;

        case 5: // Phone
            data.shippingPhone = text;
            data.step++;
            addMessage("Any **special delivery instructions**? (Type 'none' if not)", 'bot');
            break;

        case 6: // Instructions
            data.deliveryInstructions = text;

            // Save payment/shipping confirmation
            const confirmationRecord = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                customerName: data.customerName,
                paymentMethod: data.paymentMethod,
                paymentAmount: data.paymentAmount,
                paymentReference: data.paymentReference,
                shippingAddress: data.shippingAddress,
                shippingPhone: data.shippingPhone,
                deliveryInstructions: data.deliveryInstructions,
                status: 'Pending Confirmation',
                receipt: 'Confirmed via Bot'
            };

            if (window.state && window.state.transactions) {
                window.state.transactions.unshift(confirmationRecord);
                localStorage.setItem('transactions', JSON.stringify(window.state.transactions));
            }

            // Notify admin only if recording is enabled
            if (isBotRecordingEnabled()) {
                const adminNotification = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString(),
                    type: 'Payment & Shipping Confirmation',
                    sender: data.customerName,
                    contact: data.shippingPhone,
                    message: `Payment: ${data.paymentMethod} - $${data.paymentAmount} (Ref: ${data.paymentReference})<br>Shipping: ${data.shippingAddress}<br>Instructions: ${data.deliveryInstructions}`,
                    status: 'Pending Confirmation',
                    read: false
                };

                let messages = JSON.parse(localStorage.getItem('botMessages')) || [];
                messages.unshift(adminNotification);
                localStorage.setItem('botMessages', JSON.stringify(messages));
            }

            addMessage(`Perfect! Your payment and shipping details have been recorded.<br><br>**Summary:**<br>• Payment: ${data.paymentMethod} - $${data.paymentAmount}<br>• Reference: ${data.paymentReference}<br>• Delivery to: ${data.shippingAddress}<br>• Contact: ${data.shippingPhone}<br><br>Our admin will confirm and process your order shortly. Thank you!`, 'bot');
            botState.step = 'idle';
            botState.data = {};
            break;
    }
}

// Human Escalation Handler
function handleHumanEscalationStep(text) {
    const data = botState.data;

    switch (data.step) {
        case 0: // Name
            data.customerName = text;
            data.step++;
            addMessage("Thanks! What is your **Email or Phone** so our team can reach you?", 'bot');
            break;

        case 1: // Contact
            data.customerContact = text;
            data.step++;
            addMessage("Got it. Please briefly describe **what you need help with** so I can route you to the right person.", 'bot');
            break;

        case 2: // Issue description
            data.issueDescription = text;

            // Create escalation request
            if (isBotRecordingEnabled()) {
                const escalationRequest = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString(),
                    type: 'Human Agent Request',
                    sender: data.customerName,
                    contact: data.customerContact,
                    message: `Customer requests human agent assistance:<br><br>${data.issueDescription}`,
                    priority: 'High',
                    status: 'Pending Agent Response',
                    read: false
                };

                let messages = JSON.parse(localStorage.getItem('botMessages')) || [];
                messages.unshift(escalationRequest);
                localStorage.setItem('botMessages', JSON.stringify(messages));
            }

            addMessage(`Thank you, ${data.customerName}! I've escalated your request to our human support team. They will contact you at **${data.customerContact}** within 24 hours. Is there anything else I can help you with in the meantime?`, 'bot');
            botState.step = 'idle';
            botState.data = {};
            break;
    }
}

// Order Tracking Handler
function handleOrderTrackingStep(text) {
    const data = botState.data;

    switch (data.step) {
        case 0: // Order ID
            const orderId = text.trim();

            // Search for order in transactions
            const transactions = (window.state && window.state.transactions) ? window.state.transactions : [];
            const order = transactions.find(t =>
                t.id.toString() === orderId ||
                (t.property && t.property.toLowerCase().includes(orderId.toLowerCase()))
            );

            if (order) {
                const statusEmoji = order.status === 'Completed' ? '✅' : '⏳';
                addMessage(`${statusEmoji} **Order Found!**<br><br>**Order ID**: ${order.id}<br>**Date**: ${order.date}<br>**Item**: ${order.property}<br>**Status**: ${order.status}<br>**Client**: ${order.clientName}<br><br>${order.status === 'Pending' ? 'Your order is being processed. You\'ll receive an update within 24-48 hours.' : 'Your order has been completed! Thank you for your purchase.'}`, 'bot');
            } else {
                addMessage(`I couldn't find an order with ID "${orderId}". Please double-check your order number, or type 'talk to human' to speak with our support team for assistance.`, 'bot');
            }

            botState.step = 'idle';
            botState.data = {};
            break;
    }
}

// Enhanced Guided Discovery with Preference Memory
function handleDiscoveryStep(text) {
    const data = botState.data;
    const lowerText = text.toLowerCase();
    const currentUser = window.state && window.state.currentUser;

    switch (data.step) {
        case 0: // Room or Similar/Different choice
            if (lowerText.includes('similar')) {
                // Use previous preferences
                const prefs = botState.userPreferences[currentUser.email];
                data.category = prefs.category;
                data.step = 2; // Skip to showing recommendations
                addMessage(`Great! Here are some ${data.category} items similar to what you liked before:`, 'bot');
                recommendProducts(data.category);
                botState.step = 'idle';
                botState.data = {};
                return;
            } else if (lowerText.includes('different')) {
                // Start fresh
                addMessage("No problem! Which **Room** are you furnishing? (e.g., Living Room, Dining, Bedroom)", 'bot');
                data.step = 1;
                return;
            }

            // New user or direct room input
            if (lowerText.includes('living')) data.category = 'Living Room';
            else if (lowerText.includes('dining')) data.category = 'Dining';
            else if (lowerText.includes('bed')) data.category = 'Bedroom';
            else if (lowerText.includes('light')) data.category = 'Lighting';
            else data.category = 'Decor';

            // Save preference
            if (currentUser) {
                if (!botState.userPreferences[currentUser.email]) {
                    botState.userPreferences[currentUser.email] = {};
                }
                botState.userPreferences[currentUser.email].category = data.category;
                localStorage.setItem('botUserPreferences', JSON.stringify(botState.userPreferences));
            }

            data.step++;
            addMessage(`Great! For the ${data.category}, what is your budget range? (e.g., "under 500", "no limit")`, 'bot');
            break;

        case 1: // Budget
            addMessage(`Understood. Here are some top picks for your ${data.category}:`, 'bot');
            recommendProducts(data.category);
            botState.step = 'idle';
            botState.data = {};
            break;
    }
}
