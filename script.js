// ==========================================
// KONFIGURASI SUPABASE
// ==========================================
const SB_URL = "https://sjqawvdabdliehzxqlbz.supabase.co"; 
const SB_KEY = "sb_publishable__fhxF1Y__FsdwpsYDZJ0Qg_qyylrLzt"; 
const _supabase = supabase.createClient(SB_URL, SB_KEY);

// ==========================================
// SISTEM AUTH (ADMIN)
// ==========================================
function checkAuth() {
    const pass = document.getElementById('adminPass').value;
    if (pass === "admin123") { 
        localStorage.setItem('isLoggedIn', 'true');
        location.reload();
    } else {
        alert("ACCESS DENIED: Password Incorrect!");
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    location.reload();
}

// ==========================================
// FUNGSI LOAD DATA (HOME)
// ==========================================
async function loadSnippets() {
    const listDiv = document.getElementById('snippet-list');
    if (!listDiv) return; 

    const { data, error } = await _supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        listDiv.innerHTML = `<p style="color:#ff4d4d; text-align:center; grid-column: 1/-1;">System Error: Failed to fetch database.</p>`;
        return;
    }

    if (data.length === 0) {
        listDiv.innerHTML = `<p style="color:#555; text-align:center; grid-column: 1/-1; margin-top:50px;">Vault is empty. No snippets found.</p>`;
        return;
    }

    // Merender kartu dengan struktur: Title -> Tags -> Preview Code
    listDiv.innerHTML = data.map(item => {
        // Preview kode dipersempit (45 karakter) agar ringan
        const codePreview = item.code.length > 45 ? item.code.substring(0, 45) + '...' : item.code;
        
        return `
            <div class="snippet-card">
                <h3 style="margin-bottom: 6px; font-size: 0.95rem;">${item.title}</h3>
                
                <div class="tags" style="margin-bottom: 12px;">
                    ${item.tags ? item.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('') : '<span class="tag">CODE</span>'}
                </div>

                <pre><code>${escapeHtml(codePreview)}</code></pre>
                
                <div class="snippet-meta">
                    <span class="date">${new Date(item.created_at).toLocaleDateString()}</span>
                    <a href="detail.html?id=${item.id}" class="btn-icon">
                        <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// FUNGSI UPLOAD DATA (ADMIN)
// ==========================================
async function handleUpload() {
    const title = document.getElementById('title').value;
    const tags = document.getElementById('tags').value;
    const code = document.getElementById('code').value;

    if (!title || !code) {
        return alert("Error: Title and Code are mandatory fields!");
    }

    const btn = document.querySelector('.btn-primary');
    const originalText = btn.innerText;
    btn.innerText = "UPLOADING...";
    btn.disabled = true;

    const { error } = await _supabase
        .from('snippets')
        .insert([{ title, tags, code }]);

    if (error) {
        alert("Upload Failed: " + error.message);
        btn.innerText = originalText;
        btn.disabled = false;
    } else {
        alert("SUCCESS: Snippet published to vault.");
        window.location.href = 'index.html';
    }
}

// ==========================================
// INISIALISASI HALAMAN
// ==========================================
window.onload = function() {
    const isLogged = localStorage.getItem('isLoggedIn');
    const loginForm = document.getElementById('loginForm');
    const uploadPanel = document.getElementById('uploadPanel');
    
    if (isLogged === 'true') {
        if (loginForm) loginForm.style.display = 'none';
        if (uploadPanel) uploadPanel.style.display = 'block';
    } else {
        if (loginForm) loginForm.style.display = 'block';
        if (uploadPanel) uploadPanel.style.display = 'none';
    }

    loadSnippets();
};
