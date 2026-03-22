// notes.js - Logic for the Notes Page

document.addEventListener('DOMContentLoaded', () => {
    // Inject Layout
    document.getElementById('sidebar-container').innerHTML = injectSidebar();
    document.getElementById('header-container').innerHTML = injectHeader('Notes', 'Capture your ideas and thoughts');
    
    // Initialize Notes
    initNotes();
});

let notes = [];
let activeNoteId = null;
let userId = 'default';
let saveTimeout = null;

function initNotes() {
    userId = currentUser ? currentUser.id : 'default';
    const storedNotes = localStorage.getItem(`smart_notes_${userId}`);
    
    if (storedNotes) {
        notes = JSON.parse(storedNotes);
    }
    
    document.getElementById('newNoteBtn').addEventListener('click', createNewNote);
    
    // Auto collapse sidebar on mobile when a note is selected
    if (window.innerWidth <= 900 && notes.length > 0) {
        activeNoteId = notes[0].id;
    } else if (notes.length > 0) {
        activeNoteId = notes[0].id; // Default active note
    }
    
    renderNotesList();
    renderEditor();
}

function saveNotes() {
    localStorage.setItem(`smart_notes_${userId}`, JSON.stringify(notes));
}

function createNewNote() {
    const newNote = {
        id: Date.now().toString(),
        title: 'Untitled Note',
        content: '',
        updatedAt: new Date().toISOString()
    };
    
    notes.unshift(newNote);
    activeNoteId = newNote.id;
    saveNotes();
    
    renderNotesList();
    renderEditor();
    
    // Focus title input
    setTimeout(() => {
        const titleInput = document.getElementById('noteTitleInput');
        if (titleInput) {
            titleInput.focus();
            titleInput.select();
        }
    }, 100);
}

function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(n => n.id !== id);
        if (activeNoteId === id) {
            activeNoteId = notes.length > 0 ? notes[0].id : null;
        }
        saveNotes();
        renderNotesList();
        renderEditor();
    }
}

function selectNote(id) {
    activeNoteId = id;
    renderNotesList();
    renderEditor();
    
    if(window.innerWidth <= 900) {
        document.getElementById('noteEditor').scrollIntoView({ behavior: 'smooth' });
    }
}

function handleAutoSave(id, title, content) {
    // Debounce save operation
    clearTimeout(saveTimeout);
    
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex !== -1) {
        notes[noteIndex].title = title || 'Untitled Note';
        notes[noteIndex].content = content;
        notes[noteIndex].updatedAt = new Date().toISOString();
        
        saveTimeout = setTimeout(() => {
            // Move updated note to top
            const updatedNote = notes.splice(noteIndex, 1)[0];
            notes.unshift(updatedNote);
            saveNotes();
            renderNotesList();
        }, 800);
    }
}

function renderNotesList() {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    
    if (notes.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <i class="fas fa-sticky-note" style="font-size: 32px; margin-bottom: 10px; opacity: 0.5;"></i>
                <p style="font-size: 14px;">No notes yet.</p>
            </div>
        `;
        return;
    }
    
    notes.forEach(note => {
        const item = document.createElement('div');
        item.className = `note-item ${note.id === activeNoteId ? 'active' : ''}`;
        item.onclick = () => selectNote(note.id);
        
        const date = new Date(note.updatedAt);
        const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
        
        item.innerHTML = `
            <div class="note-item-title">${escapeHTML(note.title)}</div>
            <div class="note-item-preview">${escapeHTML(note.content) || '<i>No content</i>'}</div>
            <div class="note-item-date">${dateStr}</div>
        `;
        list.appendChild(item);
    });
}

function renderEditor() {
    const editor = document.getElementById('noteEditor');
    
    if (!activeNoteId || notes.length === 0) {
        editor.innerHTML = `
            <div class="empty-editor-overlay">
                <i class="fas fa-file-signature"></i>
                <h2>Select a note or create a new one</h2>
            </div>
        `;
        return;
    }
    
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;
    
    editor.innerHTML = `
        <div class="editor-toolbar">
            <input type="text" id="noteTitleInput" value="${escapeHTML(note.title)}" placeholder="Note Title">
            <div class="editor-actions">
                <button title="Save (Auto-saves)" disabled style="opacity: 0.5">
                    <i class="fas fa-check"></i>
                </button>
                <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
        <div class="editor-content">
            <textarea id="noteContentInput" placeholder="Start writing your note here...">${escapeHTML(note.content)}</textarea>
        </div>
    `;
    
    const titleInput = document.getElementById('noteTitleInput');
    const contentInput = document.getElementById('noteContentInput');
    
    const onInput = () => {
        handleAutoSave(note.id, titleInput.value, contentInput.value);
    };
    
    titleInput.addEventListener('input', onInput);
    contentInput.addEventListener('input', onInput);
}

// Utility to prevent XSS but allow display
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
