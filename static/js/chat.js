document.addEventListener("DOMContentLoaded", () => {
    
    // --- ELEMEN DOM ---
    const chatForm = document.getElementById("chat-form");
    const textInput = document.getElementById("text-input");
    const fileInput = document.getElementById("file-input");
    const attachBtn = document.getElementById("attach-btn");
    const chatContainer = document.getElementById("chat-container");
    const chatTitle = document.getElementById("chat-title");
    const newChatBtn = document.getElementById("new-chat-btn");
    const chatHistoryList = document.getElementById("chat-history-list");
    const newFolderBtn = document.getElementById("new-folder-btn");
    const folderList = document.getElementById("folder-list");
    
    // Modal untuk Rename/Delete
    const modalOverlay = document.getElementById("modal-overlay");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalConfirm = document.getElementById("modal-confirm");
    const modalCancel = document.getElementById("modal-cancel");

    // Modal untuk Buat Folder Baru
    const createFolderModal = document.getElementById("create-folder-modal");
    const newFolderNameInput = document.getElementById("new-folder-name-input");
    const createFolderConfirmBtn = document.getElementById("create-folder-confirm-btn");
    const createFolderCancelBtn = document.getElementById("create-folder-cancel-btn");

    // --- STATE & DATA ---
    let appData = {
        folders: [],
        chats: []
    };
    let currentChatId = null;
    let modalAction = null;
    let modalTargetChatId = null;

    // --- INISIALISASI & PEMUATAN DATA ---
    function initializeApp() {
        loadDataFromStorage();
        renderApp();
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('new') === 'true') {
            createNewChat();
            history.replaceState({}, document.title, window.location.pathname);
        } else if (appData.chats.length > 0) {
            loadChat(appData.chats[0].id);
        } else {
            createNewChat();
        }
    }

    function loadDataFromStorage() {
        const storedData = localStorage.getItem('goblok_chats');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                if (Array.isArray(parsedData)) {
                    appData = { folders: [], chats: parsedData };
                } else {
                    appData = parsedData;
                    // MIGRASI: Tambahkan properti isExpanded jika belum ada
                    appData.folders = appData.folders.map(folder => ({
                        ...folder,
                        isExpanded: folder.isExpanded !== undefined ? folder.isExpanded : false
                    }));
                }
            } catch (e) {
                console.error("Gagal memuat data dari localStorage:", e);
                appData = { folders: [], chats: [] };
            }
        }
    }

    function saveDataToStorage() {
        localStorage.setItem('goblok_chats', JSON.stringify(appData));
    }

    // --- RENDERING UI ---
    function renderApp() {
        renderChatHistory();
        renderFolders();
    }

    function renderChatHistory() {
        chatHistoryList.innerHTML = '';
        const folderedChatIds = new Set(appData.folders.flatMap(f => f.chatIds));
        const unsortedChats = appData.chats.filter(chat => !folderedChatIds.has(chat.id));

        unsortedChats.forEach(chat => {
            const li = createChatListItem(chat);
            chatHistoryList.appendChild(li);
        });
    }

    function renderFolders() {
        folderList.innerHTML = '';
        appData.folders.forEach(folder => {
            const folderLi = document.createElement('li');
            folderLi.className = 'folder-item';
            // Tambahkan kelas 'expanded' berdasarkan data
            if (folder.isExpanded) {
                folderLi.classList.add('expanded');
            }
            folderLi.dataset.folderId = folder.id;

            const folderHeader = document.createElement('div');
            folderHeader.className = 'folder-header';
            folderHeader.innerHTML = `
                <span class="folder-icon">▶</span>
                <span class="folder-name">${folder.name}</span>
            `;
            
            const folderChatList = document.createElement('ul');
            folderChatList.className = 'folder-chat-list';

            folder.chatIds.forEach(chatId => {
                const chat = appData.chats.find(c => c.id === chatId);
                if (chat) {
                    const li = createChatListItem(chat, true);
                    folderChatList.appendChild(li);
                }
            });

            // Listener untuk toggle folder: update data, lalu render ulang
            folderHeader.addEventListener('click', () => {
                folder.isExpanded = !folder.isExpanded;
                saveDataToStorage(); // Simpan status expand/collapse
                renderFolders(); // Render ulang hanya folder
            });

            folderLi.appendChild(folderHeader);
            folderLi.appendChild(folderChatList);
            folderList.appendChild(folderLi);
        });
    }

    function createChatListItem(chat, isInsideFolder = false) {
        const li = document.createElement('li');
        // Logika active state sudah benar, berfungsi untuk semua chat
        li.className = `chat-history-item ${chat.id === currentChatId ? 'active' : ''}`;
        li.dataset.chatId = chat.id;

        const titleSpan = document.createElement('span');
        titleSpan.className = 'chat-title-text';
        titleSpan.textContent = chat.title;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'chat-actions';
        
        if (!isInsideFolder) {
            const moveBtn = document.createElement('button');
            moveBtn.className = 'move-btn';
            moveBtn.textContent = '📁';
            moveBtn.title = 'Pindah ke Folder';
            moveBtn.dataset.chatId = chat.id;
            actionsDiv.appendChild(moveBtn);
        }

        const renameBtn = document.createElement('button');
        renameBtn.dataset.action = 'rename';
        renameBtn.dataset.chatId = chat.id;
        renameBtn.title = 'Rename';
        renameBtn.textContent = '✏️';

        const deleteBtn = document.createElement('button');
        deleteBtn.dataset.action = 'delete';
        deleteBtn.dataset.chatId = chat.id;
        deleteBtn.title = 'Delete';
        deleteBtn.textContent = '🗑️';

        actionsDiv.appendChild(renameBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(titleSpan);
        li.appendChild(actionsDiv);

        return li;
    }

    // --- FUNGSI MANAJEMEN CHAT & FOLDER ---
    function createNewChat() {
        const newChat = {
            id: Date.now().toString(),
            title: "Chat Baru",
            messages: []
        };
        appData.chats.unshift(newChat);
        currentChatId = newChat.id;
        saveDataToStorage();
        renderApp();
        loadChat(currentChatId);
    }

    function createNewFolder() {
        createFolderModal.classList.remove('hidden');
        newFolderNameInput.value = '';
        newFolderNameInput.focus();
    }

    function handleCreateFolder() {
        const folderName = newFolderNameInput.value.trim();
        if (folderName) {
            const newFolder = {
                id: `folder_${Date.now()}`,
                name: folderName,
                chatIds: [],
                isExpanded: false // Inisialisasi status folder
            };
            appData.folders.push(newFolder);
            saveDataToStorage();
            renderFolders();
            hideCreateFolderModal();
        } else {
            newFolderNameInput.style.borderColor = 'red';
            newFolderNameInput.placeholder = 'Nama folder tidak boleh kosong!';
        }
    }

    function hideCreateFolderModal() {
        createFolderModal.classList.add('hidden');
        newFolderNameInput.value = '';
        newFolderNameInput.style.borderColor = '#ccc';
        newFolderNameInput.placeholder = 'Masukkan nama folder...';
    }

    function moveChatToFolder(chatId, folderId) {
        const folder = appData.folders.find(f => f.id === folderId);
        if (folder && !folder.chatIds.includes(chatId)) {
            folder.chatIds.push(chatId);
            saveDataToStorage();
            renderApp();
        }
    }

    function loadChat(chatId) {
        const chat = appData.chats.find(c => c.id === chatId);
        if (!chat) return;

        currentChatId = chatId;
        chatTitle.textContent = chat.title;
        chatContainer.innerHTML = '';

        if (chat.messages.length === 0) {
            showWelcomeMessage();
        } else {
            chat.messages.forEach(msg => {
                appendMessage(msg.html, msg.sender, msg.id);
            });
        }
        // Render ulang untuk memperbarui status 'active' di seluruh sidebar
        renderApp(); 
    }

    function addMessageToCurrentChat(html, sender, id = null) {
        const chat = appData.chats.find(c => c.id === currentChatId);
        if (chat) {
            chat.messages.push({ html, sender, id });
            saveDataToStorage();
        }
    }
    
    // --- FUNGSI MODAL (Rename/Delete) ---
    function showModal(type, chatId) {
        modalAction = type;
        modalTargetChatId = chatId;
        modalOverlay.classList.remove('hidden');

        if (type === 'rename') {
            const chat = appData.chats.find(c => c.id === chatId);
            modalTitle.textContent = 'Rename Chat';
            modalBody.innerHTML = `<input type="text" id="rename-input" value="${chat ? chat.title : ''}" placeholder="Masukkan nama baru">`;
        } else if (type === 'delete') {
            modalTitle.textContent = 'Hapus Chat';
            modalBody.innerHTML = '<p>Apakah Anda yakin ingin menghapus chat ini? Tindakan ini tidak dapat dibatalkan.</p>';
        }
    }

    function hideModal() {
        modalOverlay.classList.add('hidden');
        modalAction = null;
        modalTargetChatId = null;
    }

    function handleModalConfirm() {
        if (modalAction === 'rename') {
            const renameInput = document.getElementById('rename-input');
            const newTitle = renameInput.value.trim();
            if (newTitle) {
                const chat = appData.chats.find(c => c.id === modalTargetChatId);
                if (chat) {
                    chat.title = newTitle;
                    saveDataToStorage();
                    renderApp();
                    if (currentChatId === modalTargetChatId) {
                        chatTitle.textContent = chat.title;
                    }
                }
            }
        } else if (modalAction === 'delete') {
            appData.folders.forEach(folder => {
                folder.chatIds = folder.chatIds.filter(id => id !== modalTargetChatId);
            });
            appData.chats = appData.chats.filter(c => c.id !== modalTargetChatId);
            
            saveDataToStorage();

            if (currentChatId === modalTargetChatId) {
                if (appData.chats.length > 0) {
                    loadChat(appData.chats[0].id);
                } else {
                    createNewChat();
                }
            } else {
                renderApp();
            }
        }
        hideModal();
    }

    // --- FUNGSI INPUT & OUTPUT ---
    function handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    }

    function handleImageUpload(file) {
        chatForm.classList.add('disabled');
        textInput.disabled = true;
        attachBtn.disabled = true;
        fileInput.disabled = true;

        const reader = new FileReader();
        reader.onload = (e) => {
            const userHtml = `<p>Mengirim: ${file.name}</p><img src="${e.target.result}" alt="Gambar Pengguna">`;
            appendMessage(userHtml, "user");
            addMessageToCurrentChat(userHtml, "user");
        };
        reader.readAsDataURL(file);

        appendMessage("<p>Agus sedang menganalisis gambar...</p>", "bot", "response-typing");

        const formData = new FormData();
        formData.append("file", file);

        fetch("/predict", { method: "POST", body: formData })
            .then(res => res.json())
            .then(data => {
                removeLoadingMessage();
                
                if (data.error) {
                    const botHtml = `Error: ${data.error}`;
                    appendMessage(botHtml, "bot");
                    addMessageToCurrentChat(botHtml, "bot");
                } else {
                    const parsedComment = marked.parse(data.comment);
                    const botHtml = `
                        <p><strong>Hasil Analisis:</strong></p>
                        <p>${data.prediction}</p>
                        <hr>
                        <p><strong>Saran:</strong></p>
                        <p>${data.advice}</p>
                        <hr>
                        <p><strong>Tanggapan Agus:</strong></p>
                        <div>${parsedComment}</div>
                    `;
                    appendMessage(botHtml, "bot");
                    addMessageToCurrentChat(botHtml, "bot");
                }
            })
            .catch(error => {
                removeLoadingMessage();
                handleFetchError(error);
                const errorMsg = `Terjadi kesalahan. Tidak dapat terhubung ke server. ${error}`;
                addMessageToCurrentChat(errorMsg, "bot", "error-message");
            })
            .finally(() => {
                chatForm.classList.remove('disabled');
                textInput.disabled = false;
                attachBtn.disabled = false;
                fileInput.disabled = false;
                textInput.focus(); 
            });

        fileInput.value = null;
    }

    function handleTextSubmit(event) {
        event.preventDefault();
        const message = textInput.value.trim();
        if (message) {
            chatForm.classList.add('disabled');
            textInput.disabled = true;
            attachBtn.disabled = true;
            fileInput.disabled = true;

            appendMessage(message, "user");
            addMessageToCurrentChat(message, "user");
            
            appendMessage("<p>Agus sedang mengetik...</p>", "bot", "response-typing");
            
            fetch("/chat", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            })
                .then(res => res.json())
                .then(data => {
                    handleBotResponse(data);
                    const botHtml = marked.parse(data.response);
                    addMessageToCurrentChat(botHtml, "bot");
                })
                .catch(error => {
                    handleFetchError(error);
                    const errorMsg = `Terjadi kesalahan. Tidak dapat terhubung ke server. ${error}`;
                    addMessageToCurrentChat(errorMsg, "bot", "error-message");
                })
                .finally(() => {
                    chatForm.classList.remove('disabled');
                    textInput.disabled = false;
                    attachBtn.disabled = false;
                    fileInput.disabled = false;
                    textInput.focus();
                });
            
            textInput.value = "";
        }
    }

    function showWelcomeMessage() {
        const welcomeMessage = "Halo! Nama saya Agus Kopling, panggilannya Agus. Yuk, Agus temenin ngobrol, atau kamu bisa kirim gambar mata untuk analisis kesehatan mata kamu!";
        appendMessage("<p>Agus sedang mengetik...</p>", "bot", "welcome-typing");

        setTimeout(() => {
            const typingIndicator = document.getElementById("welcome-typing");
            if (typingIndicator) typingIndicator.remove();
            appendMessage(welcomeMessage, "bot");
            addMessageToCurrentChat(welcomeMessage, "bot");
        }, 2000);
    }

    function handleBotResponse(data) {
        removeLoadingMessage();
        if (data.error) {
            appendMessage(`Error: ${data.error}`, "bot", "error-message");
        } else if (data.prediction) {
            const botHtml = `<p><strong>Hasil Analisis:</strong></p><p>${data.prediction}</p><hr><p><strong>Saran:</strong></p><p>${data.advice}</p>`;
            appendMessage(botHtml, "bot");
        } else if (data.response) {
            const parsedHtml = marked.parse(data.response);
            appendMessage(parsedHtml, "bot");
        }
    }

    function handleFetchError(error) {
        removeLoadingMessage();
        appendMessage(`Terjadi kesalahan. Tidak dapat terhubung ke server. ${error}`, "bot", "error-message");
    }

    function appendMessage(html, sender, id = null) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("chat-message", `${sender}-message`);
        if (id) messageDiv.id = id;
        
        if (sender === 'user' && !html.startsWith('<p>') && !html.startsWith('<img')) {
            messageDiv.innerHTML = `<p>${html}</p>`;
        } else {
            messageDiv.innerHTML = html;
        }
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function removeLoadingMessage() {
        const loadingMsg = document.getElementById("response-typing");
        if (loadingMsg) loadingMsg.remove();
    }
    
    function showMoveDropdown(chatId, buttonElement) {
        const existingDropdown = document.querySelector('.move-dropdown');
        if (existingDropdown) existingDropdown.remove();

        const dropdown = document.createElement('div');
        dropdown.className = 'move-dropdown';

        if (appData.folders.length === 0) {
            dropdown.innerHTML = '<a href="#">Belum ada folder</a>';
        } else {
            appData.folders.forEach(folder => {
                const a = document.createElement('a');
                a.href = "#";
                a.textContent = folder.name;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveChatToFolder(chatId, folder.id);
                    dropdown.remove();
                });
                dropdown.appendChild(a);
            });
        }
        
        buttonElement.parentElement.style.position = 'relative';
        buttonElement.parentElement.appendChild(dropdown);
        dropdown.classList.add('show');

        setTimeout(() => {
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeDropdown);
                }
            });
        }, 100);
    }

    // --- EVENT LISTENERS ---
    newChatBtn.addEventListener("click", createNewChat);
    newFolderBtn.addEventListener("click", createNewFolder);
    chatForm.addEventListener("submit", handleTextSubmit);
    attachBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", handleImageSelect);
    modalConfirm.addEventListener("click", handleModalConfirm);
    modalCancel.addEventListener("click", hideModal);
    modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) hideModal(); });

    createFolderConfirmBtn.addEventListener("click", handleCreateFolder);
    createFolderCancelBtn.addEventListener("click", hideCreateFolderModal);
    createFolderModal.addEventListener("click", (e) => { if (e.target === createFolderModal) hideCreateFolderModal(); });

    // Event delegation untuk handle klik di sidebar
    document.querySelector('.sidebar').addEventListener('click', (event) => {
        const chatItem = event.target.closest('.chat-history-item');
        const moveBtn = event.target.closest('.move-btn');

        if (moveBtn) {
            event.stopPropagation();
            const chatId = moveBtn.dataset.chatId;
            showMoveDropdown(chatId, moveBtn);
        } else if (chatItem) {
            // Jika yang diklik adalah tombol aksi
            if (event.target.matches('.chat-actions button[data-action]')) {
                const action = event.target.dataset.action;
                const chatId = event.target.dataset.chatId;
                showModal(action, chatId);
            } else {
                // Jika yang diklik adalah item chat itu sendiri
                loadChat(chatItem.dataset.chatId);
            }
        }
    });

    // Jalankan aplikasi
    initializeApp();
});