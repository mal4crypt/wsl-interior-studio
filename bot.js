// WSL Bot Integration

const botState = {
    isOpen: false,
    chatHistory: [],
    step: 'idle', // idle, recording_transaction, messaging_admin, guided_discovery
    data: {} // Generic data holder for multi-step flows
};

// Knowledge Base & Intent Matching
const intents = [
    {
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        response: "Hello! I'm WSL Bot. I can help you find products, record transactions, or send a message to the admin. What would you like to do?"
    },
    {
        keywords: ['help', 'support', 'assist'],
        response: "I can help with:\n- **Finding Products**: Type 'I need a sofa' or 'help me choose'.\n- **Transactions**: Type 'record transaction'.\n- **Contact**: Type 'leave a message' to contact admin.\n- **Navigation**: Type 'where is the shop' or 'go to cart'."
    },
    {
        keywords: ['contact', 'email', 'phone', 'whatsapp', 'reach'],
        response: "You can reach us via the Contact page or WhatsApp at +234 901 088 3999. Or type 'leave a message' to send a note directly here."
    },
    {
        keywords: ['return', 'refund', 'policy'],
        response: "We accept returns within 30 days of delivery. Please contact support for assistance."
    },
    {
        keywords: ['location', 'address'],
        response: "We are located at Gwarinpa, 900108, FCT Nigeria."
    },
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
                <div class="message bot">Hello! I'm WSL Bot. How can I assist you today?</div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Type a message...">
                <button id="send-btn"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
        <button id="wsl-bot-bubble">
            <i class="fas fa-robot"></i>
        </button>
    `;
    document.body.appendChild(botContainer);

    // Add Styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        #wsl-bot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: 'Inter', sans-serif;
        }
        #wsl-bot-bubble {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--primary-color, #C19A6B);
            color: white;
            border: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            cursor: pointer;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s;
        }
        #wsl-bot-bubble:hover {
            transform: scale(1.1);
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
    `;
    document.head.appendChild(style);
}

function attachEventListeners() {
    const bubble = document.getElementById('wsl-bot-bubble');
    const chatWindow = document.getElementById('wsl-chat-window');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('chat-input');

    bubble.addEventListener('click', () => {
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

    // 2. Navigation Intents (New)
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
        // Fallback for "Where is it" if context implies shop
        if (lowerText.includes('it') && (lowerText.includes('where is') || lowerText.includes('find'))) {
            addMessage("If you are looking for our products, I'll take you to the Shop.", 'bot');
            setTimeout(() => window.location.href = 'shop.html', 1500);
            return;
        }
    }

    // 3. Price-Based Recommendations (New)
    if (lowerText.includes('cheap') || lowerText.includes('lowest price') || lowerText.includes('budget') || lowerText.includes('affordable')) {
        recommendCheapestProducts();
        return;
    }

    // 4. Trigger New Flows
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

    if (lowerText.includes('choose') || lowerText.includes('unsure') || lowerText.includes('recommend') || lowerText.includes('help me find')) {
        botState.step = 'guided_discovery';
        botState.data = { step: 0 };
        addMessage("I can help you find the perfect item! First, which **Room** are you furnishing? (e.g., Living Room, Dining, Bedroom)", 'bot');
        return;
    }

    // 5. Implicit Product Matching
    // Check for specific product keywords directly
    if (lowerText.includes('sofa') || lowerText.includes('chair') || lowerText.includes('table') || lowerText.includes('light') || lowerText.includes('decor')) {
        const keyword = lowerText.match(/(sofa|chair|table|light|decor)/)[0];
        recommendProducts(keyword);
        return;
    }

    // Check intents for category matching (e.g., "I need to sit")
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

    // 6. Fallback
    addMessage("I'm not sure I understand. You can ask me to **find products**, **record a transaction**, **leave a message**, or **navigate** to a page.", 'bot');
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

            // Ensure botMessages array exists in state/localStorage
            let messages = JSON.parse(localStorage.getItem('botMessages')) || [];
            messages.unshift(newMessage);
            localStorage.setItem('botMessages', JSON.stringify(messages));

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
            else if (lowerText.includes('bed')) data.category = 'Bedroom'; // Assuming we might have this or map to others
            else if (lowerText.includes('light')) data.category = 'Lighting';
            else data.category = 'Decor'; // Default fallback or logic

            data.step++;
            addMessage(`Great! For the ${data.category}, what is your budget range? (e.g., "under 500", "no limit")`, 'bot');
            break;

        case 1: // Budget (Mock logic for now)
            // We could parse numbers here, but for now let's just show recommendations based on category
            addMessage(`Understood. Here are some top picks for your ${data.category}:`, 'bot');
            recommendProducts(data.category);
            botState.step = 'idle';
            botState.data = {};
            break;
    }
}
