const STORAGE_KEY = 'kanban:state';

const defaultState = {
  members: [
    { id: 'm1', name: 'Alice', color: '#0052cc' },
    { id: 'm2', name: 'Bob', color: '#36b37e' },
    { id: 'm3', name: 'Charlie', color: '#ff991f' }
  ],
  lists: [
    { id: 'l1', title: 'To Do', cards: [] },
    { id: 'l2', title: 'Doing', cards: [] },
    { id: 'l3', title: 'Done', cards: [] }
  ]
};

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    const parsed = JSON.parse(raw);
    if (!parsed.lists || !parsed.members) return JSON.parse(JSON.stringify(defaultState));
    return parsed;
  } catch (e) {
    console.warn('Failed to read state, using defaults.', e);
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = readState();

function uid() {
  return 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(due) {
  if (!due) return false;
  const d = new Date(due);
  return d < new Date(today());
}

function isDueSoon(due) {
  if (!due) return false;
  const now = new Date(today());
  const d = new Date(due);
  const diff = (d - now) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 2;
}

function findList(cardId) {
  for (const list of state.lists) {
    const idx = list.cards.findIndex(c => c.id === cardId);
    if (idx >= 0) return { list, index: idx };
  }
  return null;
}

/* === Render === */
function render() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  state.lists.forEach(list => {
    const listEl = document.createElement('div');
    listEl.className = 'list';
    listEl.dataset.listId = list.id;

    const headerEl = document.createElement('div');
    headerEl.className = 'list-header';

    const titleInput = document.createElement('input');
    titleInput.className = 'list-title';
    titleInput.value = list.title;
    titleInput.placeholder = 'List title';
    titleInput.addEventListener('change', (e) => {
      list.title = e.target.value || 'Untitled';
      writeState(state);
    });

    const actionsEl = document.createElement('div');
    actionsEl.className = 'list-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn';
    deleteBtn.innerHTML = '&#128465;&#65039;';
    deleteBtn.title = 'Delete list';
    deleteBtn.addEventListener('click', () => {
      if (state.lists.length <= 1) {
        alert('A board must have at least one list.');
        return;
      }
      state.lists = state.lists.filter(l => l.id !== list.id);
      writeState(state);
      render();
    });

    actionsEl.appendChild(deleteBtn);
    headerEl.appendChild(titleInput);
    headerEl.appendChild(actionsEl);

    const cardsEl = document.createElement('div');
    cardsEl.className = 'cards';
    cardsEl.dataset.listId = list.id;

    list.cards.forEach(card => {
      cardsEl.appendChild(renderCard(card, list.id));
    });

    const addCardBtn = document.createElement('button');
    addCardBtn.className = 'add-card';
    addCardBtn.textContent = '+ Add a card';
    addCardBtn.addEventListener('click', () => {
      const card = { id: uid(), title: '', description: '', assigneeId: '', due: '' };
      list.cards.push(card);
      writeState(state);
      render();
      openCardModal(card.id);
    });

    setupListDrop(cardsEl, list.id);

    listEl.appendChild(headerEl);
    listEl.appendChild(cardsEl);
    listEl.appendChild(addCardBtn);

    board.appendChild(listEl);
  });
}

function renderCard(card, listId) {
  const el = document.createElement('div');
  el.className = 'card';
  el.draggable = true;
  el.dataset.cardId = card.id;
  el.dataset.listId = listId;

  if (card.due) {
    if (isOverdue(card.due)) el.classList.add('overdue');
    else if (isDueSoon(card.due)) el.classList.add('overdue-soon');
  }

  const titleEl = document.createElement('div');
  titleEl.className = 'card-title';
  titleEl.contentEditable = 'true';
  titleEl.textContent = card.title || 'Untitled card';
  titleEl.addEventListener('blur', () => {
    card.title = titleEl.textContent.trim();
    writeState(state);
  });

  el.appendChild(titleEl);

  if (card.assigneeId || card.due) {
    const metaEl = document.createElement('div');
    metaEl.className = 'card-meta';

    if (card.assigneeId) {
      const member = state.members.find(m => m.id === card.assigneeId);
      if (member) {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.title = `Assigned to ${member.name}`;
        const avatar = document.createElement('span');
        avatar.className = 'avatar';
        avatar.style.background = member.color || '#6b778c';
        avatar.textContent = member.name.charAt(0).toUpperCase();
        const nameSpan = document.createElement('span');
        nameSpan.textContent = member.name;
        chip.appendChild(avatar);
        chip.appendChild(nameSpan);
        metaEl.appendChild(chip);
      }
    }

    if (card.due) {
      const chip = document.createElement('span');
      chip.className = 'chip due';
      if (isOverdue(card.due)) chip.classList.add('overdue');
      chip.textContent = `Due ${card.due}`;
      metaEl.appendChild(chip);
    }

    el.appendChild(metaEl);
  }

  el.addEventListener('click', (e) => {
    if (e.target === titleEl) return; // handled by blur
    openCardModal(card.id);
  });

  setupCardDrag(el, card.id, listId);

  return el;
}

/* === Drag and drop === */
function setupCardDrag(cardEl, cardId, fromListId) {
  cardEl.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId, fromListId }));
    cardEl.classList.add('dragging');
  });

  cardEl.addEventListener('dragend', () => {
    cardEl.classList.remove('dragging');
    document.querySelectorAll('.list').forEach(l => l.classList.remove('drag-over'));
    document.querySelectorAll('.card').forEach(c => c.classList.remove('drag-target'));
  });
}

function setupListDrop(cardsEl, listId) {
  cardsEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    cardsEl.closest('.list').classList.add('drag-over');

    const targetCard = getTargetCard(cardsEl, e.clientY);
    document.querySelectorAll('.card').forEach(c => c.classList.remove('drag-target'));
    if (targetCard) targetCard.classList.add('drag-target');
  });

  cardsEl.addEventListener('dragleave', (e) => {
    const list = cardsEl.closest('.list');
    if (!list.contains(e.relatedTarget)) {
      list.classList.remove('drag-over');
    }
  });

  cardsEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const list = cardsEl.closest('.list');
    list.classList.remove('drag-over');
    document.querySelectorAll('.card').forEach(c => c.classList.remove('drag-target'));

    let raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch (err) { return; }
    const { cardId, fromListId } = data;

    const source = findList(cardId);
    if (!source) return;
    const [movedCard] = source.list.cards.splice(source.index, 1);

    const targetCard = getTargetCard(cardsEl, e.clientY);
    let targetIndex = targetCard ? Array.from(cardsEl.children).indexOf(targetCard) : cardsEl.children.length;
    listId = listId || source.list.id;
    list.cards.splice(targetIndex, 0, movedCard);
    writeState(state);
    render();
  });
}

function getTargetCard(container, clientY) {
  const cards = Array.from(container.querySelectorAll('.card'));
  return cards.find(card => {
    const rect = card.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    return clientY < mid;
  }) || null;
}

/* === Modal === */
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalFooter = document.getElementById('modalFooter');
const modalClose = document.getElementById('modalClose');

function openModal() {
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
  modalBody.innerHTML = '';
  modalFooter.innerHTML = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

function openCardModal(cardId) {
  const found = findList(cardId);
  if (!found) return;
  const { list, index } = found;
  const card = list.cards[index];
  modalTitle.textContent = 'Edit Card';

  modalBody.innerHTML = `
    <div class="field">
      <label for="cardTitle">Title</label>
      <input id="cardTitle" type="text" value="${escapeHtml(card.title || '')}" placeholder="Card title" />
    </div>
    <div class="field">
      <label for="cardDesc">Description</label>
      <textarea id="cardDesc" rows="4" placeholder="Description">${escapeHtml(card.description || '')}</textarea>
    </div>
    <div class="field">
      <label for="cardAssignee">Assignee</label>
      <select id="cardAssignee">
        <option value="">Unassigned</option>
        ${state.members.map(m => `<option value="${m.id}" ${card.assigneeId === m.id ? 'selected' : ''}>${m.name}</option>`).join('') || ''}
      </select>
    </div>
    <div class="field">
      <label for="cardDue">Due date</label>
      <input id="cardDue" type="date" value="${escapeHtml(card.due || '')}" />
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" id="modalCancel">Cancel</button>
    <button class="btn" id="modalSave">Save</button>
  `;

  openModal();

  const focusInput = modalBody.querySelector('input');
  if (focusInput) setTimeout(() => focusInput.focus(), 80);

  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalSave').addEventListener('click', () => {
    card.title = document.getElementById('cardTitle').value.trim() || 'Untitled card';
    card.description = document.getElementById('cardDesc').value.trim();
    card.assigneeId = document.getElementById('cardAssignee').value;
    card.due = document.getElementById('cardDue').value;
    writeState(state);
    closeModal();
    render();
  });
}

function openMemberModal() {
  modalTitle.textContent = 'Add New Member';

  modalBody.innerHTML = `
    <div class="field">
      <label for="memberName">Name</label>
      <input id="memberName" type="text" placeholder="e.g. Dana" />
    </div>
    <div class="field">
      <label for="memberColor">Color</label>
      <input id="memberColor" type="color" value="#0052cc" />
    </div>
  `;

  modalFooter.innerHTML = `
    <button class="btn btn-secondary" id="modalCancel">Cancel</button>
    <button class="btn" id="modalSave">Add</button>
  `;

  openModal();
  setTimeout(() => document.getElementById('memberName').focus(), 80);

  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalSave').addEventListener('click', () => {
    const name = document.getElementById('memberName').value.trim();
    if (!name) return;
    const color = document.getElementById('memberColor').value;
    state.members.push({ id: uid(), name, color });
    writeState(state);
    closeModal();
    render();
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* === Actions === */
document.getElementById('addListBtn').addEventListener('click', () => {
  state.lists.push({ id: uid(), title: 'New List', cards: [] });
  writeState(state);
  render();
});

document.getElementById('addMemberBtn').addEventListener('click', openMemberModal);

render();
