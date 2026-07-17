const authBox = document.getElementById('authBox');
const welcomeBox = document.getElementById('welcomeBox');
const authForm = document.getElementById('authForm');
const formTitle = document.getElementById('formTitle');
const mainBtn = document.getElementById('mainBtn');
const toggleLink = document.getElementById('toggleLink');
const toggleText = document.getElementById('toggleText');
const userGreeting = document.getElementById('userGreeting');
const logoutBtn = document.getElementById('logoutBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const menuItems = document.querySelectorAll('.menu-item');
const tabContents = document.querySelectorAll('.tab-content');

const tripsContainer = document.getElementById('tripsContainer');
const addTripForm = document.getElementById('addTripForm');
const chatBoxContainer = document.getElementById('chatBoxContainer');
const chatForm = document.getElementById('chatForm');
const chatMessageInput = document.getElementById('chatMessage');

let isLoginMode = true;
let currentUser = "";

function showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

// فحص الجلسة السابقة عند تشغيل الصفحة مباشرة لمنع تسجيل الدخول المتكرر
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('shalla_logged_in_user');
    if (savedUser) {
        currentUser = savedUser;
        authBox.classList.add('hidden');
        welcomeBox.classList.remove('hidden');
        userGreeting.innerText = currentUser;
        loadTrips();
        loadChat();
    }
});

// فتح وإغلاق قائمة الثلاث شرط
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    sidebar.classList.toggle('open');
});

// نظام التبديل بين الأقسام (Tabs)
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.add('hidden'));
        
        item.classList.add('active');
        const targetTab = item.getAttribute('data-target');
        document.getElementById(targetTab).classList.remove('hidden');
        
        menuToggle.classList.remove('open');
        sidebar.classList.remove('open');
    });
});

// التبديل بين الدخول والتسجيل
toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    formTitle.innerText = isLoginMode ? "مجلس تاج سلطان" : "عضوية جديدة بالشلة 📝";
    mainBtn.innerText = isLoginMode ? "دخول المجلس" : "تسجيل الحساب";
    toggleText.innerHTML = isLoginMode ? 'عضو جديد بالشلة؟ <span id="toggleLink">سجل حسابك</span>' : 'لديك حساب؟ <span id="toggleLink">سجل دخولك</span>';
    document.getElementById('toggleLink').addEventListener('click', arguments.callee);
});

// إدارة تسجيل الدخول وتخزين الجلسة
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!isLoginMode) {
        localStorage.setItem('user_' + username, password);
        showToast("🎉 تم تسجيل حسابك الفخم بنجاح! سجل دخولك الآن.");
        isLoginMode = true;
        authForm.reset();
    } else {
        const storedPassword = localStorage.getItem('user_' + username);
        if (storedPassword && storedPassword === password) {
            currentUser = username;
            
            // حفظ اليوزر هنا عشان يفضل مسجل دخول دايماً
            localStorage.setItem('shalla_logged_in_user', currentUser);
            
            authBox.classList.add('hidden');
            welcomeBox.classList.remove('hidden');
            userGreeting.innerText = currentUser;
            showToast(`👑 مرحباً بك يا ${currentUser} في مجلس تاج سلطان السري.`);
            loadTrips();
            loadChat();
        } else {
            showToast("❌ بيانات خاطئة! ركز واكتب اليوزر والباسورد صح.");
        }
    }
});

// تحميل نظام الخروجات والتصويت
function loadTrips() {
    tripsContainer.innerHTML = '';
    const trips = JSON.parse(localStorage.getItem('shalla_trips_v3')) || [];

    if(trips.length === 0) {
        tripsContainer.innerHTML = `<p style="color: var(--text-muted); text-align:center; font-size: 14px;">مفيش اقتراحات خروجات حالياً.. فكر في فكرة صايعة وضيفها تحت!</p>`;
        return;
    }

    trips.forEach((trip, index) => {
        const hasVoted = trip.votedUsers && trip.votedUsers.includes(currentUser);
        const isOwner = trip.creator === currentUser;

        const card = document.createElement('div');
        card.className = 'trip-card';
        card.innerHTML = `
            <div class="trip-info">
                <h4>🎯 ${trip.name}</h4>
                <p>📍 المكان: ${trip.location}</p>
                <p>⏰ الميعاد: ${trip.day} - الساعة ${formatTime(trip.time)}</p>
                <p style="font-size:12px; color:var(--primary)">👤 المقترح: ${trip.creator}</p>
                ${isOwner ? `<button class="btn-delete-trip" onclick="deleteTrip(${index})">🗑️ إلغاء الاقتراح</button>` : ''}
            </div>
            <div class="vote-panel">
                <button class="v-btn yes" ${hasVoted ? 'disabled' : ''} onclick="voteTrip(${index}, 'yes')">تم (${trip.yes})</button>
                <button class="v-btn no" ${hasVoted ? 'disabled' : ''} onclick="voteTrip(${index}, 'no')">لا (${trip.no})</button>
            </div>
        `;
        tripsContainer.appendChild(card);
    });
}

// إضافة خروجة جديدة
addTripForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const trips = JSON.parse(localStorage.getItem('shalla_trips_v3')) || [];
    trips.push({
        name: document.getElementById('tripName').value,
        location: document.getElementById('tripLocation').value,
        day: document.getElementById('tripDay').value,
        time: document.getElementById('tripTime').value,
        yes: 0, no: 0,
        creator: currentUser,
        votedUsers: []
    });
    localStorage.setItem('shalla_trips_v3', JSON.stringify(trips));
    addTripForm.reset();
    loadTrips();
    showToast("🚀 تم نشر اقتراح خروجتك بنجاح للشلة!");
});

// التصويت لمنع التكرار
window.voteTrip = function(index, type) {
    const trips = JSON.parse(localStorage.getItem('shalla_trips_v3')) || [];
    if(trips[index]) {
        if(trips[index].votedUsers.includes(currentUser)){
            showToast("🔒 إنت صوت على الخروجة دي قبل كدة يا غالي!");
            return;
        }
        trips[index][type] += 1;
        trips[index].votedUsers.push(currentUser);
        localStorage.setItem('shalla_trips_v3', JSON.stringify(trips));
        loadTrips();
        showToast("🟢 تم تسجيل صوتك بنجاح.");
    }
}

// حذف الخروجة لصاحبها فقط
window.deleteTrip = function(index) {
    const trips = JSON.parse(localStorage.getItem('shalla_trips_v3')) || [];
    if (trips[index] && trips[index].creator === currentUser) {
        trips.splice(index, 1);
        localStorage.setItem('shalla_trips_v3', JSON.stringify(trips));
        loadTrips();
        showToast("🗑️ تم حذف وإلغاء اقتراح الخروجة بنجاح.");
    }
}

function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'مساءً' : 'صباحاً';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
}

// نظام الدردشة للقروب
function loadChat() {
    chatBoxContainer.innerHTML = '';
    const chats = JSON.parse(localStorage.getItem('shalla_chat_v3')) || [];
    chats.forEach(msg => {
        const isMe = msg.user === currentUser;
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isMe ? 'me' : ''}`;
        msgDiv.innerHTML = `
            <span class="user">${msg.user}</span>
            <div class="text">${msg.text}</div>
            <span class="time">${msg.time}</span>
        `;
        chatBoxContainer.appendChild(msgDiv);
    });
    chatBoxContainer.scrollTop = chatBoxContainer.scrollHeight;
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const chats = JSON.parse(localStorage.getItem('shalla_chat_v3')) || [];
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    chats.push({
        user: currentUser,
        text: chatMessageInput.value.trim(),
        time: timeFormatted
    });
    localStorage.setItem('shalla_chat_v3', JSON.stringify(chats));
    chatMessageInput.value = '';
    loadChat();
});

// تكبير الصور
window.openLightbox = function(src) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightbox').classList.remove('hidden');
}
window.closeLightbox = function() {
    document.getElementById('lightbox').classList.add('hidden');
}

// تسجيل الخروج وإزالة الجلسة المحفوظة
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('shalla_logged_in_user');
    welcomeBox.classList.add('hidden');
    authBox.classList.remove('hidden');
    currentUser = "";
    authForm.reset();
});