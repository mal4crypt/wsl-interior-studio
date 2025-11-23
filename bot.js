// WSL Bot Integration

const botState = {
    isOpen: false,
    chatHistory: [],
    step: 'idle', // idle, recording_transaction, waiting_for_input
    transactionData: {}
};

// Knowledge Base
const faq = {
    "hello": "Hello! I'm WSL Bot. How can I help you today? I can recommend products, answer questions, or help you record a transaction.",
    "hi": "Hi there! Welcome to WSL Interior Studio.",
    "help": "I can help you with:\n- Finding products (e.g., 'show me sofas')\n- Recording a transaction (type 'record transaction')\n- General questions about our services.",
    "contact": "You can reach us via the Contact page or WhatsApp at +234 901 088 3999.",
    "return": "We accept returns within 30 days. Please contact support for assistance.",
    "location": "We are located at Gwarinpa, 900108, FCT Nigeria."
};

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

    // Transaction Recording Flow
    if (botState.step === 'recording_transaction') {
        handleTransactionStep(text);
        return;
    }

    if (lowerText.includes('record transaction') || lowerText.includes('new sale')) {
        botState.step = 'recording_transaction';
        botState.transactionData = { step: 0 };
        addMessage("Sure, I can help you record a transaction. What is the **Client's Name**?", 'bot');
        return;
    }

    // Product Recommendations
    if (lowerText.includes('sofa') || lowerText.includes('chair') || lowerText.includes('table') || lowerText.includes('light') || lowerText.includes('decor')) {
        const keyword = lowerText.match(/(sofa|chair|table|light|decor)/)[0];
        recommendProducts(keyword);
        return;
    }

    // General FAQ
    let response = "I'm not sure about that. Try asking about our products or type 'help' to see what I can do.";

    for (const key in faq) {
        if (lowerText.includes(key)) {
            response = faq[key];
            break;
        }
    }

    addMessage(response, 'bot');
}

function recommendProducts(keyword) {
    // Access products from script.js state if available, else use defaults
    const products = (window.state && window.state.products) ? window.state.products : [];

    const matches = products.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.category.toLowerCase().includes(keyword)
    );

    if (matches.length > 0) {
        let msg = `Here are some ${keyword}s I found for you:<br>`;
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

function handleTransactionStep(text) {
    const data = botState.transactionData;

    switch (data.step) {
        case 0: // Client Name received
            data.clientName = text;
            data.step++;
            addMessage("Got it. What is the **Client's Contact (Email or Phone)**?", 'bot');
            break;
        case 1: // Contact received
            data.clientContact = text;
            data.step++;
            addMessage("Okay. What **Property/Item** did they buy?", 'bot');
            break;
        case 2: // Property received
            data.property = text;
            data.step++;
            addMessage("Almost done. Any notes or receipt reference? (Type 'none' if empty)", 'bot');
            break;
        case 3: // Notes received
            data.notes = text;

            // Save Transaction
            const newTransaction = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                clientName: data.clientName,
                clientContact: data.clientContact,
                property: data.property,
                status: 'Pending', // Default to pending for admin approval
                receipt: 'Generated via Bot'
            };

            if (window.state && window.state.transactions) {
                window.state.transactions.unshift(newTransaction);
                localStorage.setItem('transactions', JSON.stringify(window.state.transactions));
                addMessage(`Transaction recorded successfully! <br><strong>ID:</strong> ${newTransaction.id}<br><strong>Status:</strong> Pending Approval`, 'bot');
            } else {
                addMessage("I couldn't access the database right now, but I've noted the details.", 'bot');
            }

            // Reset
            botState.step = 'idle';
            botState.transactionData = {};
            break;
    }
}
