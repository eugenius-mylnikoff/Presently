const state = {
    people: [],
    currentView: 'people',
    calendarDate: new Date(2026, 7, 1),
    today: new Date(2026, 7, 1),
    sortKey: null,
    sortAsc: true,
    giftSortKey: null,
    giftSortAsc: true,
    tempImportData: null,
    confirmCallback: null,
    successCallback: null,
    currentGiftPersonId: null,
    currentConflicts: []
};

const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modals = document.querySelectorAll('.modal');

const ICONS = {
    vk: `<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.08 14.27h-1.44c-.54 0-.71-.43-1.68-1.41-.85-.83-1.22-.94-1.43-.94-.3 0-.38.08-.38.5v1.31c0 .45-.15.72-1.32.72-1.94 0-4.1-1.18-5.61-3.37-2.28-3.22-2.9-5.64-2.9-6.13 0-.22.08-.42.5-.42h1.44c.38 0 .52.17.66.56.73 2.09 1.94 3.92 2.44 3.92.19 0 .27-.08.27-.56V8.66c-.06-.98-.58-1.07-.58-1.42 0-.16.13-.33.35-.33h2.27c.31 0 .42.17.42.54v2.87c0 .31.14.42.23.42.19 0 .34-.11.68-.45 1.04-1.17 1.78-2.97 1.78-2.97.1-.22.27-.42.65-.42h1.44c.44 0 .53.22.44.54-.18.85-1.93 3.3-1.93 3.3-.15.25-.21.37 0 .64.15.2.64.64.97 1.01.61.69 1.07 1.27 1.2 1.67.14.42-.08.63-.51.63z"/></svg>`,
    tg: `<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>`,
    phone: `<svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    link: `<svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    edit: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`
};

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    renderCurrentView();
    showWelcomeModal();
});

function saveData() { localStorage.setItem('presently_people', JSON.stringify(state.people)); }
function loadData() {
    const data = localStorage.getItem('presently_people');
    if (data) { try { state.people = JSON.parse(data); } catch (e) { state.people = []; } }
}

function setupEventListeners() {
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentView = btn.dataset.view;
            renderCurrentView();
        });
    });

    document.getElementById('btn-add-person').addEventListener('click', () => openPersonModal());
    document.getElementById('search-name').addEventListener('input', renderPeopleTable);
    document.getElementById('search-date').addEventListener('input', renderPeopleTable);
    document.getElementById('filter-rel').addEventListener('change', renderPeopleTable);
    document.getElementById('filter-contact').addEventListener('input', renderPeopleTable);

    document.querySelectorAll('#people-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            state.sortAsc = state.sortKey === key ? !state.sortAsc : true;
            state.sortKey = key;
            renderPeopleTable();
        });
    });

    document.getElementById('cal-prev').addEventListener('click', () => { state.calendarDate.setMonth(state.calendarDate.getMonth() - 1); renderCalendar(); });
    document.getElementById('cal-next').addEventListener('click', () => { state.calendarDate.setMonth(state.calendarDate.getMonth() + 1); renderCalendar(); });
    document.getElementById('cal-today').addEventListener('click', () => { state.calendarDate = new Date(state.today.getFullYear(), state.today.getMonth(), 1); renderCalendar(); });

    document.getElementById('btn-export').addEventListener('click', exportData);
    document.getElementById('import-file').addEventListener('change', handleImportFile);
    document.querySelectorAll('[data-import-mode]').forEach(card => {
        card.addEventListener('click', () => processImport(card.dataset.importMode));
    });

    document.getElementById('p-relationship').addEventListener('change', (e) => {
        document.getElementById('p-rel-other-wrap').classList.toggle('hidden', e.target.value !== 'Другое');
    });
    document.getElementById('person-form').addEventListener('submit', handlePersonSubmit);
    document.getElementById('ideas-form').addEventListener('submit', handleIdeasSubmit);
    document.getElementById('message-form').addEventListener('submit', handleMessageSubmit);

    document.getElementById('btn-add-gift').addEventListener('click', () => openGiftFormModal());
    document.getElementById('gift-form').addEventListener('submit', handleGiftSubmit);
    document.querySelectorAll('#gifts-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            state.giftSortAsc = state.giftSortKey === key ? !state.giftSortAsc : true;
            state.giftSortKey = key;
            renderGiftsTable();
        });
    });

    document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', closeAllModals));
    document.getElementById('confirm-cancel').addEventListener('click', closeAllModals);
    document.getElementById('confirm-ok').addEventListener('click', () => { if (state.confirmCallback) state.confirmCallback(); closeAllModals(); });
    document.getElementById('success-ok').addEventListener('click', () => { if (state.successCallback) state.successCallback(); closeAllModals(); });

    document.getElementById('conflict-keep-all-current').addEventListener('click', () => resolveAllConflicts('current'));
    document.getElementById('conflict-keep-all-imported').addEventListener('click', () => resolveAllConflicts('imported'));
    document.getElementById('conflict-save').addEventListener('click', () => resolveAllConflicts('mixed'));
}

function renderCurrentView() {
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${state.currentView}`).classList.add('active');
    if (state.currentView === 'people') renderPeopleTable();
    else if (state.currentView === 'calendar') renderCalendar();
    else if (state.currentView === 'upcoming') renderUpcoming();
}

function calculateAge(birthDateStr, referenceDate = null) {
    const ref = referenceDate || state.today;
    const birthDate = new Date(birthDateStr);
    let age = ref.getFullYear() - birthDate.getFullYear();
    const m = ref.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && ref.getDate() < birthDate.getDate())) age--;
    return age;
}

function getNextBirthday(birthDateStr) {
    const birthDate = new Date(birthDateStr);
    let nextBirthday = new Date(state.today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (nextBirthday < state.today) nextBirthday.setFullYear(state.today.getFullYear() + 1);
    return nextBirthday;
}

function getDaysUntilBirthday(birthDateStr) {
    const nextBd = getNextBirthday(birthDateStr);
    const diffTime = nextBd - state.today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showWelcomeModal() {
    setTimeout(() => showModal('modal-welcome'), 300);
}

function closeWelcomeAndShowReminder() {
    closeAllModals();
    setTimeout(() => checkUpcomingBirthdays(), 500);
}

function checkUpcomingBirthdays() {
    const upcoming = state.people.filter(p => {
        const days = getDaysUntilBirthday(p.birthDate);
        return days >= 0 && days <= 7;
    }).sort((a, b) => getDaysUntilBirthday(a.birthDate) - getDaysUntilBirthday(b.birthDate));

    if (upcoming.length > 0) {
        const container = document.getElementById('reminder-content');
        let html = '<ul style="list-style:none; padding:0; text-align:left;">';
        upcoming.forEach(p => {
            const days = getDaysUntilBirthday(p.birthDate);
            const age = calculateAge(p.birthDate, getNextBirthday(p.birthDate)) + 1;
            const text = days === 0 ? `<strong style="color:var(--acid-yellow)">СЕГОДНЯ!</strong> ${escapeHtml(p.name)} исполняется ${age} лет! 🎉`
                : `Через ${days} дн.: ${escapeHtml(p.name)} (исполнится ${age})`;
            html += `<li style="padding:8px 0; border-bottom:1px solid var(--glass-border); color:var(--text-soft);">${text}</li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
        setTimeout(() => showModal('modal-birthday-reminder'), 500);
    }
}

function renderPeopleTable() {
    const tbody = document.getElementById('people-tbody');
    const emptyState = document.getElementById('empty-state-people');
    tbody.innerHTML = '';

    const searchName = document.getElementById('search-name').value.toLowerCase();
    const searchDate = document.getElementById('search-date').value.toLowerCase();
    const filterRel = document.getElementById('filter-rel').value;
    const filterContact = document.getElementById('filter-contact').value.toLowerCase();

    let filtered = state.people.filter(p => {
        if (searchName && !p.name.toLowerCase().includes(searchName)) return false;
        if (searchDate && !formatDate(p.birthDate).includes(searchDate)) return false;
        if (filterRel && p.relationship !== filterRel) return false;
        if (filterContact) {
            const contacts = `${p.contacts.phone} ${p.contacts.vk} ${p.contacts.telegram} ${p.contacts.other}`.toLowerCase();
            if (!contacts.includes(filterContact)) return false;
        }
        return true;
    });

    document.querySelectorAll('#people-table th').forEach(th => th.classList.remove('sorted-asc', 'sorted-desc'));
    if (state.sortKey) {
        const activeTh = document.querySelector(`#people-table th[data-sort="${state.sortKey}"]`);
        if (activeTh) activeTh.classList.add(state.sortAsc ? 'sorted-asc' : 'sorted-desc');
        filtered.sort((a, b) => {
            let valA = a[state.sortKey] || '';
            let valB = b[state.sortKey] || '';
            if (state.sortKey === 'contacts') {
                valA = `${a.contacts.phone} ${a.contacts.vk}`;
                valB = `${b.contacts.phone} ${b.contacts.vk}`;
            }
            if (valA < valB) return state.sortAsc ? -1 : 1;
            if (valA > valB) return state.sortAsc ? 1 : -1;
            return 0;
        });
    }

    emptyState.classList.toggle('hidden', filtered.length > 0);

    filtered.forEach(p => {
        const tr = document.createElement('tr');
        let contactsHtml = '';
        if (p.contacts.phone) contactsHtml += `<a href="tel:${p.contacts.phone}" class="contact-item">${ICONS.phone} ${p.contacts.phone}</a>`;

        if (p.contacts.vk) {
            let vkInput = p.contacts.vk.trim();
            let vkUrl = vkInput;
            if (!vkInput.toLowerCase().includes('vk.ru')) {
                const cleanName = vkInput.replace(/.*vk\.com\//, '').replace(/^@/, '').replace(/^\//, '').trim();
                vkUrl = `https://vk.ru/${cleanName}`;
            }
            contactsHtml += `<a href="${vkUrl}" target="_blank" class="contact-item">${ICONS.vk} VK</a>`;
        }

        if (p.contacts.telegram) {
            const tgLink = p.contacts.telegram.startsWith('http') ? p.contacts.telegram : `https://t.me/${p.contacts.telegram.replace('@', '')}`;
            contactsHtml += `<a href="${tgLink}" target="_blank" class="contact-item">${ICONS.tg} TG</a>`;
        }
        if (p.contacts.other) contactsHtml += `<span class="contact-item">${ICONS.link} ${escapeHtml(p.contacts.other)}</span>`;

        const relDisplay = p.relationship === 'Другое' && p.relationshipOther ? `${p.relationship} (${escapeHtml(p.relationshipOther)})` : p.relationship;

        tr.innerHTML = `
            <td>${escapeHtml(p.name)}</td>
            <td>${formatDate(p.birthDate)}</td>
            <td>${escapeHtml(relDisplay)}</td>
            <td>${contactsHtml}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-icon small btn-edit" title="Редактировать" data-id="${p.id}">${ICONS.edit}</button>
                    <button class="btn-icon small btn-delete" title="Удалить" data-id="${p.id}">${ICONS.trash}</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => openPersonModal(btn.dataset.id)));
    tbody.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => confirmDeletePerson(btn.dataset.id)));
}

function openPersonModal(id = null) {
    const form = document.getElementById('person-form');
    form.reset();
    document.getElementById('p-rel-other-wrap').classList.add('hidden');
    if (id) {
        const p = state.people.find(x => x.id === id);
        if (!p) return;
        document.getElementById('person-modal-title').textContent = 'Редактировать человека';
        document.getElementById('p-id').value = p.id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-birthDate').value = p.birthDate;
        document.getElementById('p-relationship').value = p.relationship;
        if (p.relationship === 'Другое') {
            document.getElementById('p-rel-other-wrap').classList.remove('hidden');
            document.getElementById('p-relationshipOther').value = p.relationshipOther || '';
        }
        document.getElementById('p-phone').value = p.contacts.phone || '';
        document.getElementById('p-vk').value = p.contacts.vk || '';
        document.getElementById('p-telegram').value = p.contacts.telegram || '';
        document.getElementById('p-other').value = p.contacts.other || '';
    } else {
        document.getElementById('person-modal-title').textContent = 'Добавить человека';
        document.getElementById('p-id').value = '';
    }
    showModal('modal-person');
}

function handlePersonSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('p-id').value || crypto.randomUUID();
    const rel = document.getElementById('p-relationship').value;
    const existing = state.people.find(p => p.id === id);
    const person = {
        id, name: document.getElementById('p-name').value.trim(), birthDate: document.getElementById('p-birthDate').value,
        relationship: rel, relationshipOther: rel === 'Другое' ? document.getElementById('p-relationshipOther').value.trim() : '',
        contacts: {
            phone: document.getElementById('p-phone').value.trim(), vk: document.getElementById('p-vk').value.trim(),
            telegram: document.getElementById('p-telegram').value.trim(), other: document.getElementById('p-other').value.trim()
        },
        ideas: existing?.ideas || '', message: existing?.message || '', gifts: existing?.gifts || []
    };
    const existingIndex = state.people.findIndex(p => p.id === id);
    if (existingIndex >= 0) state.people[existingIndex] = person;
    else state.people.push(person);
    saveData();
    closeAllModals();
    renderCurrentView();
    showSuccess('Сохранено!', existing ? 'Данные успешно обновлены.' : 'Человек добавлен.');
}

function confirmDeletePerson(id) {
    state.confirmCallback = () => {
        state.people = state.people.filter(p => p.id !== id);
        saveData();
        renderCurrentView();
    };
    const p = state.people.find(x => x.id === id);
    document.getElementById('confirm-title').textContent = 'Удалить человека?';
    document.getElementById('confirm-message').textContent = `Вы точно хотите удалить "${p?.name}"? Это действие нельзя отменить.`;
    document.getElementById('confirm-ok').textContent = 'Удалить';
    document.getElementById('confirm-cancel').style.display = '';
    showModal('modal-confirm');
}

function renderCalendar() {
    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();
    if (year < 1) { state.calendarDate.setFullYear(1); state.calendarDate.setMonth(0); return renderCalendar(); }
    document.getElementById('cal-month-year').textContent = state.calendarDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    daysOfWeek.forEach(day => { const div = document.createElement('div'); div.className = 'cal-day-header'; div.textContent = day; grid.appendChild(div); });
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < startDayOfWeek; i++) { const emptyDiv = document.createElement('div'); emptyDiv.className = 'cal-day'; emptyDiv.style.opacity = '0.3'; emptyDiv.style.pointerEvents = 'none'; grid.appendChild(emptyDiv); }
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        const currentDate = new Date(year, month, day);
        if (currentDate.toDateString() === state.today.toDateString()) cell.classList.add('today');
        const birthdays = state.people.filter(p => { const bd = new Date(p.birthDate); return bd.getMonth() === month && bd.getDate() === day; });
        if (birthdays.length > 0) cell.classList.add('has-birthday');
        let html = `<div class="cal-day-number">${day}</div>`;
        if (birthdays.length > 0) {
            html += `<div class="bday-count">${birthdays.length} д.р.</div>`;
            birthdays.forEach(p => {
                const age = calculateAge(p.birthDate, currentDate) + 1;
                html += `<div class="birthday-mini">${escapeHtml(p.name)} (${age})</div>`;
            });
        }
        cell.innerHTML = html;
        grid.appendChild(cell);
    }
}

function renderUpcoming() {
    const container = document.getElementById('upcoming-list');
    container.innerHTML = '';
    if (state.people.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Добавьте людей, чтобы увидеть ближайшие дни рождения.</p></div>';
        return;
    }
    const sorted = [...state.people].sort((a, b) => getNextBirthday(a.birthDate) - getNextBirthday(b.birthDate));
    sorted.forEach(p => {
        const nextBd = getNextBirthday(p.birthDate);
        const age = calculateAge(p.birthDate) + 1;
        const daysUntil = getDaysUntilBirthday(p.birthDate);
        const isToday = daysUntil === 0;
        const isUrgent = daysUntil > 0 && daysUntil <= 7;

        const div = document.createElement('div');
        div.className = 'upcoming-item';
        if (isToday) div.classList.add('today-bday');
        else if (isUrgent) div.classList.add('urgent');

        let spectacleHtml = '';
        if (isToday) {
            spectacleHtml = `<span class="today-badge">🎉 СЕГОДНЯ! 🎉</span><div class="confetti-container" id="confetti-${p.id}"></div>`;
        }

        const checklist = [];
        if (!p.ideas || p.ideas.trim() === '') checklist.push("Нет идеи поздравления!");
        if (!p.message || p.message.trim() === '') checklist.push("Нет текста сообщения!");
        if (!p.gifts || p.gifts.length === 0) checklist.push("Нет идей для подарков!");
        else if (!p.gifts.some(g => g.isPurchased)) checklist.push("Нет купленных подарков!");

        let checklistHtml = '';
        if (checklist.length === 0) {
            checklistHtml = `<div class="ready-message">🎉 Молодец! Вы полностью готовы!</div>`;
        } else {
            checklistHtml = `<div class="readiness-checklist"><ul>${checklist.map(item => `<li>⚠️ ${item}</li>`).join('')}</ul></div>`;
        }

        div.innerHTML = `
            ${spectacleHtml}
            <div class="upcoming-info">
                <h3>${escapeHtml(p.name)} ${isToday ? '🎂' : ''}</h3>
                <p>Дата рождения: ${formatDate(p.birthDate)} • Исполнится: ${age} лет (${formatDate(nextBd.toISOString())})</p>
                ${checklistHtml}
            </div>
            <div class="upcoming-actions">
                <button class="btn-secondary btn-ideas" data-id="${p.id}">Идеи</button>
                <button class="btn-secondary btn-message" data-id="${p.id}">Сообщение</button>
                <button class="btn-primary btn-gifts" data-id="${p.id}">Подарки</button>
            </div>
        `;
        container.appendChild(div);

        if (isToday) spawnConfetti(`confetti-${p.id}`);

        div.querySelector('.btn-ideas').addEventListener('click', () => openIdeasModal(p.id));
        div.querySelector('.btn-message').addEventListener('click', () => openMessageModal(p.id));
        div.querySelector('.btn-gifts').addEventListener('click', () => openGiftsModal(p.id));
    });
}

function spawnConfetti(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const colors = ['#39ff14', '#ff00ff', '#00ffff', '#ffff00', '#ff6600'];
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(confetti);
    }
}

function openIdeasModal(id) {
    const p = state.people.find(x => x.id === id);
    if (!p) return;
    document.getElementById('ideas-person-id').value = id;
    document.getElementById('ideas-person-name').textContent = p.name;
    document.getElementById('ideas-text').value = p.ideas || '';
    showModal('modal-ideas');
}
function handleIdeasSubmit(e) {
    e.preventDefault();
    const p = state.people.find(x => x.id === document.getElementById('ideas-person-id').value);
    if (p) { p.ideas = document.getElementById('ideas-text').value; saveData(); }
    closeAllModals();
    showSuccess('Сохранено!', 'Ваши идеи сохранены.');
}

function openMessageModal(id) {
    const p = state.people.find(x => x.id === id);
    if (!p) return;
    document.getElementById('message-person-id').value = id;
    document.getElementById('message-person-name').textContent = p.name;
    document.getElementById('message-text').value = p.message || '';
    showModal('modal-message');
}
function handleMessageSubmit(e) {
    e.preventDefault();
    const p = state.people.find(x => x.id === document.getElementById('message-person-id').value);
    if (p) { p.message = document.getElementById('message-text').value; saveData(); }
    closeAllModals();
    showSuccess('Сохранено!', 'Текст сообщения сохранён.');
}

function openGiftsModal(id) {
    const p = state.people.find(x => x.id === id);
    if (!p) return;
    state.currentGiftPersonId = id;
    document.getElementById('gifts-person-id').value = id;
    document.getElementById('gifts-person-name').textContent = p.name;
    state.giftSortKey = null;
    renderGiftsTable();
    showModal('modal-gifts');
}

function renderGiftsTable() {
    const tbody = document.getElementById('gifts-tbody');
    tbody.innerHTML = '';
    const p = state.people.find(x => x.id === state.currentGiftPersonId);
    if (!p) return;
    let gifts = p.gifts || [];

    document.querySelectorAll('#gifts-table th').forEach(th => th.classList.remove('sorted-asc', 'sorted-desc'));
    if (state.giftSortKey) {
        const activeTh = document.querySelector(`#gifts-table th[data-sort="${state.giftSortKey}"]`);
        if (activeTh) activeTh.classList.add(state.giftSortAsc ? 'sorted-asc' : 'sorted-desc');
        gifts = [...gifts].sort((a, b) => {
            let valA = a[state.giftSortKey] || '';
            let valB = b[state.giftSortKey] || '';
            if (state.giftSortKey === 'price') { valA = parseFloat(valA) || 0; valB = parseFloat(valB) || 0; }
            if (valA < valB) return state.giftSortAsc ? -1 : 1;
            if (valA > valB) return state.giftSortAsc ? 1 : -1;
            return 0;
        });
    }

    if (gifts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">Нет добавленных подарков</td></tr>';
        return;
    }

    gifts.forEach(g => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(g.name)}</td>
            <td>${g.price} ₽</td>
            <td>${escapeHtml(g.where)}</td>
            <td>
                <label class="toggle-switch" title="Отметить как купленный">
                    <input type="checkbox" ${g.isPurchased ? 'checked' : ''} onchange="toggleGiftPurchased('${p.id}', '${g.id}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>
                <div class="actions-cell">
                    <button class="btn-icon small btn-edit-gift" data-gid="${g.id}" title="Редактировать">${ICONS.edit}</button>
                    <button class="btn-icon small btn-delete-gift" data-gid="${g.id}" title="Удалить">${ICONS.trash}</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-edit-gift').forEach(btn => btn.addEventListener('click', () => openGiftFormModal(btn.dataset.gid)));
    tbody.querySelectorAll('.btn-delete-gift').forEach(btn => btn.addEventListener('click', () => confirmDeleteGift(btn.dataset.gid)));
}

window.toggleGiftPurchased = function (personId, giftId, isChecked) {
    const p = state.people.find(x => x.id === personId);
    if (p && p.gifts) {
        const g = p.gifts.find(x => x.id === giftId);
        if (g) {
            g.isPurchased = isChecked;
            saveData();
        }
    }
};

function openGiftFormModal(giftId = null) {
    const form = document.getElementById('gift-form');
    form.reset();
    if (giftId) {
        const p = state.people.find(x => x.id === state.currentGiftPersonId);
        const g = p?.gifts.find(x => x.id === giftId);
        if (!g) return;
        document.getElementById('gift-form-title').textContent = 'Редактировать подарок';
        document.getElementById('g-id').value = g.id;
        document.getElementById('g-name').value = g.name;
        document.getElementById('g-price').value = g.price;
        document.getElementById('g-where').value = g.where;
    } else {
        document.getElementById('gift-form-title').textContent = 'Добавить подарок';
        document.getElementById('g-id').value = '';
    }
    showModal('modal-gift-form');
}

function handleGiftSubmit(e) {
    e.preventDefault();
    const p = state.people.find(x => x.id === state.currentGiftPersonId);
    if (!p) return;
    if (!p.gifts) p.gifts = [];
    const id = document.getElementById('g-id').value || crypto.randomUUID();
    const gift = {
        id, name: document.getElementById('g-name').value.trim(), price: document.getElementById('g-price').value,
        where: document.getElementById('g-where').value.trim(), isPurchased: p.gifts.find(g => g.id === id)?.isPurchased || false
    };
    const idx = p.gifts.findIndex(g => g.id === id);
    if (idx >= 0) p.gifts[idx] = gift;
    else p.gifts.push(gift);
    saveData();
    closeAllModals();
    renderGiftsTable();
}

function confirmDeleteGift(giftId) {
    state.confirmCallback = () => {
        const p = state.people.find(x => x.id === state.currentGiftPersonId);
        if (p) { p.gifts = p.gifts.filter(g => g.id !== giftId); saveData(); renderGiftsTable(); }
    };
    document.getElementById('confirm-title').textContent = 'Удалить подарок?';
    document.getElementById('confirm-message').textContent = 'Вы точно хотите удалить этот подарок?';
    document.getElementById('confirm-ok').textContent = 'Удалить';
    document.getElementById('confirm-cancel').style.display = '';
    showModal('modal-confirm');
}

function exportData() {
    const dataStr = JSON.stringify(state.people, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presently_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Экспорт завершён!', 'Файл с данными успешно скачан.');
}

function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsed = JSON.parse(event.target.result);
            if (!Array.isArray(parsed)) { showError('Ошибка!', 'Неверный формат файла. Ожидается массив людей.'); return; }
            state.tempImportData = parsed;
            showModal('modal-import-mode');
        } catch (err) { showError('Ошибка чтения!', 'Не удалось прочитать JSON файл.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function processImport(mode) {
    if (!state.tempImportData) return;
    closeAllModals();
    if (mode === 'replace') {
        state.confirmCallback = () => {
            state.people = state.tempImportData; saveData(); state.tempImportData = null; renderCurrentView();
            showSuccess('Готово!', 'Все данные заменены на данные из файла.');
        };
        document.getElementById('confirm-title').textContent = 'Полная замена';
        document.getElementById('confirm-message').textContent = 'Все текущие данные будут удалены и заменены на данные из файла. Продолжить?';
        document.getElementById('confirm-ok').textContent = 'Заменить';
        document.getElementById('confirm-cancel').style.display = '';
        showModal('modal-confirm');
    } else if (mode === 'addall') {
        state.tempImportData.forEach(importedP => {
            const idx = state.people.findIndex(p => p.id === importedP.id);
            if (idx >= 0) state.people[idx] = importedP;
            else state.people.push(importedP);
        });
        saveData(); state.tempImportData = null; renderCurrentView();
        showSuccess('Готово!', 'Все данные из файла добавлены или обновлены.');
    } else if (mode === 'smart') {
        const conflicts = [], toAdd = [];
        state.tempImportData.forEach(importedP => {
            const existing = state.people.find(p => p.id === importedP.id || (p.name === importedP.name && p.birthDate === importedP.birthDate));
            if (!existing) toAdd.push(importedP);
            else {
                const diffs = {};
                if (existing.name !== importedP.name) diffs.name = { current: existing.name, imported: importedP.name };
                if (existing.birthDate !== importedP.birthDate) diffs.birthDate = { current: existing.birthDate, imported: importedP.birthDate };
                if (existing.relationship !== importedP.relationship) diffs.relationship = { current: existing.relationship, imported: importedP.relationship };
                if (existing.relationshipOther !== importedP.relationshipOther) diffs.relationshipOther = { current: existing.relationshipOther, imported: importedP.relationshipOther };
                const cFields = ['phone', 'vk', 'telegram', 'other'];
                cFields.forEach(field => {
                    const cur = existing.contacts?.[field] || '';
                    const imp = importedP.contacts?.[field] || '';
                    if (cur !== imp) { if (!diffs.contacts) diffs.contacts = {}; diffs.contacts[field] = { current: cur, imported: imp }; }
                });
                if (Object.keys(diffs).length > 0) conflicts.push({ existingId: existing.id, importedPerson: importedP, name: existing.name, diffs, existing });
            }
        });
        toAdd.forEach(p => state.people.push(p));
        if (conflicts.length > 0) {
            state.currentConflicts = conflicts; renderConflictModal(conflicts); showModal('modal-import-conflict');
        } else {
            saveData(); state.tempImportData = null; renderCurrentView();
            showSuccess('Готово!', 'Интеллектуальное добавление завершено. Конфликтов не найдено.');
        }
    }
}

function renderConflictModal(conflicts) {
    const container = document.getElementById('conflict-list');
    container.innerHTML = '';
    const fieldNames = { name: 'Имя', birthDate: 'Дата рождения', relationship: 'Отношение', relationshipOther: 'Уточнение' };
    const contactFieldNames = { phone: 'Телефон', vk: 'VK', telegram: 'Telegram', other: 'Другое' };
    conflicts.forEach((c, idx) => {
        const div = document.createElement('div');
        div.className = 'conflict-item';
        let html = `<h4>${escapeHtml(c.name)}</h4>`;
        for (const [field, values] of Object.entries(c.diffs)) {
            if (field === 'contacts') {
                for (const [cField, cValues] of Object.entries(values)) {
                    html += `<div class="conflict-row"><span class="conflict-field">${contactFieldNames[cField] || cField}:</span><div class="conflict-values">
                        <label><input type="radio" name="conflict_${idx}_contacts_${cField}" value="current" checked> Текущее: "${escapeHtml(cValues.current || '—')}"</label>
                        <label><input type="radio" name="conflict_${idx}_contacts_${cField}" value="imported"> Из файла: "${escapeHtml(cValues.imported || '—')}"</label>
                    </div></div>`;
                }
            } else {
                html += `<div class="conflict-row"><span class="conflict-field">${fieldNames[field] || field}:</span><div class="conflict-values">
                    <label><input type="radio" name="conflict_${idx}_${field}" value="current" checked> Текущее: "${escapeHtml(values.current || '—')}"</label>
                    <label><input type="radio" name="conflict_${idx}_${field}" value="imported"> Из файла: "${escapeHtml(values.imported || '—')}"</label>
                </div></div>`;
            }
        }
        div.innerHTML = html;
        container.appendChild(div);
    });
}

function resolveAllConflicts(choice) {
    state.currentConflicts.forEach((c, idx) => {
        const existing = state.people.find(p => p.id === c.existingId);
        if (!existing) return;
        for (const field of Object.keys(c.diffs)) {
            if (field === 'contacts') {
                if (!existing.contacts) existing.contacts = {};
                for (const cField of Object.keys(c.diffs.contacts)) {
                    let selected = 'current';
                    if (choice === 'imported') selected = 'imported';
                    else if (choice === 'mixed') {
                        const radio = document.querySelector(`input[name="conflict_${idx}_contacts_${cField}"]:checked`);
                        selected = radio ? radio.value : 'current';
                    }
                    existing.contacts[cField] = c.diffs.contacts[cField][selected] || '';
                }
            } else {
                let selected = 'current';
                if (choice === 'imported') selected = 'imported';
                else if (choice === 'mixed') {
                    const radio = document.querySelector(`input[name="conflict_${idx}_${field}"]:checked`);
                    selected = radio ? radio.value : 'current';
                }
                existing[field] = c.diffs[field][selected] || '';
            }
        }
    });
    saveData(); state.tempImportData = null; state.currentConflicts = []; closeAllModals();
    showSuccess('Готово!', 'Конфликты разрешены и данные сохранены.'); renderCurrentView();
}

function showModal(modalId) {
    modalOverlay.classList.remove('hidden');
    modals.forEach(m => m.classList.add('hidden'));
    document.getElementById(modalId).classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    modalOverlay.classList.add('hidden');
    modals.forEach(m => m.classList.add('hidden'));
    state.confirmCallback = null; state.successCallback = null;
    document.body.style.overflow = '';
}

function showSuccess(title, message, callback = null) {
    state.successCallback = callback;
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    showModal('modal-success');
}

function showError(title, message) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-ok').textContent = 'Понятно';
    document.getElementById('confirm-cancel').style.display = 'none';
    state.confirmCallback = null;
    showModal('modal-confirm');
}

modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeAllModals(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) closeAllModals(); });