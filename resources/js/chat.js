const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const PERSON_IMG = "https://w7.pngwing.com/pngs/981/645/png-transparent-default-profile-united-states-computer-icons-desktop-free-high-quality-person-icon-miscellaneous-silhouette-symbol-thumbnail.png";
const chatWith = get(".chatWith");
const typing = get(".typing");
const chatStatus = get(".chatStatus");
const chatId = get("#hiddenInput").value;
let authUser;
let typingTimer = false;

window.onload = function () {
    axios.get('/auth/user')
        .then(r => {
            authUser = r.data.authUser;
        })
        .then(() => {
            axios.get(`/chats/${chatId}/get-user`)
                .then(r => {
                    let result = r.data.users.filter(user => user.id != authUser.id)
                    if (result.length > 0) {
                        chatWith.innerHTML = result[0].name;
                    }
                })
        })
        .then(() => {
            axios.get(`/chats/${chatId}/get-messages`)
                .then(r => {
                    appendMessages(r.data.messages);
                })
        })
        .then(() => {
            Echo.join(`chats.${chatId}`)
                .listen('MessageSent', (e) => {
                    appendMessage(
                        e.message.user.name,
                        PERSON_IMG,
                        'left',
                        e.message.content,
                        formatDate(new Date(e.message.created_at))
                    );
                })
                .here(users => {
                    let result = users.filter(user => user.id != authUser.id)

                    if (result)
                        chatStatus.classList = 'chatStatus online';
                })
                .joining(user => {
                    if (user.id != authUser.id)
                        chatStatus.classList = 'chatStatus online';
                })
                .leaving(user => {
                    if (user.id != authUser.id)
                        chatStatus.classList = 'chatStatus offline';
                })
                .listenForWhisper('typing', e => {
                    if (e > 0)
                        typing.style.display = '';

                    if (typingTimer) {
                        clearTimeout(typingTimer)
                    }

                    typingTimer = setTimeout(() => {
                        typing.style.display = 'none';
                        typingTimer = false;
                    }, 3000);
                })
        })
}

msgerForm.addEventListener("submit", event => {
    event.preventDefault();

    const msgText = msgerInput.value;
    if (!msgText) return;

    axios.post('/message/sent', {
        message: msgText,
        chat_id: chatId
    })
        .then(r => {
            appendMessage(
                r.data.user.name,
                PERSON_IMG,
                'right',
                r.data.content,
                formatDate(new Date(r.data.created_at))
            );
        })
        .catch(e => console.log(e))

    msgerInput.value = "";
});

// Utils
function get(selector, root = document) {
    return root.querySelector(selector);
}

function appendMessage(name, img, side, text, date) {
    //   Simple solution for small apps
    const msgHTML = `
                <div class="msg ${side}-msg">
                <div class="msg-img" style="background-image: url(${img})"></div>

                <div class="msg-bubble">
                    <div class="msg-info">
                    <div class="msg-info-name">${name}</div>
                    <div class="msg-info-time">${date}</div>
                    </div>

                    <div class="msg-text">${text}</div>
                </div>
                </div>
            `;

    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    scrollToBotton();
}

function appendMessages(messages) {
    let side = 'left';

    messages.forEach(message => {
        side = (message.user_id == authUser.id) ? 'right' : 'left';

        appendMessage(
            message.user.name,
            PERSON_IMG,
            side,
            message.content,
            formatDate(new Date(message.created_at))
        )
    })
}

function formatDate(date) {
    const d = date.getDate();
    const mo = date.getMonth() + 1;
    const y = date.getFullYear();
    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();

    return `${d}/${mo}/${y} ${h.slice(-2)}:${m.slice(-2)}`;
}

function scrollToBotton() {
    msgerChat.scrollTop = msgerChat.scrollHeight;
}

function sendTypingEvent() {
    typingTimer = true;
    Echo.join(`chats.${chatId}`)
        .whisper('typing', msgerInput.value.length);
}

msgerInput.addEventListener('input', () => {
    sendTypingEvent();
})