const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api'; // Vercel auto-handles this

// ============================================
// DASHBOARD (index.html)
// ============================================

async function loadSnippets() {
    const container = document.getElementById('snippet-list');
    
    try {
        const response = await fetch(`${API_URL}/snippets`);
        const { data, error } = await response.json();

        if (error) throw new Error(error);

        if (data && data.length > 0) {
            // Update stats counter
            document.getElementById('total-snippets').textContent = data.length;
            const languages = [...new Set(data.map(s => s.tags).filter(Boolean))];
            document.getElementById('total-languages').textContent = languages.length;

            container.innerHTML = data.map(snippet => `
                <div class="snippet-card" data-date="${new Date(snippet.created_at).getTime()}">
                    <div class="tag">${snippet.tags || 'GENERAL'}</div>
                    <h3>${snippet.title}</h3>
                    <pre><code>${escapeHtml(snippet.code.substring(0, 150))}${snippet.code.length > 150 ? '...' : ''}</code></pre>
                    <div class="snippet-meta">
                        <span class="date">${formatDate(snippet.created_at)}</span>
                        <div class="meta-actions">
                            <button onclick="quickCopy(\`${escapeHtml(snippet.code).replace(/`/g, '\\`')}\`)" class="btn-icon" title="Quick Copy">
                                <i data-lucide="copy" style="width: 16px; height: 16px;"></i>
                            </button>
                            <a href="detail.html?id=${snippet.id}" class="btn-icon">
                                <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `).join('');
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } else {
            // Empty state
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <span class="material-icons" style="font-size: 40px; color: #6b7280;">code</span>
                    </div>
                    <h3>No Snippets Yet</h3>
                    <p>Start building your code library by adding your first snippet. Quick, organized, and always accessible.</p>
                    <a href="upload.html" style="display: inline-flex; align-items: center; gap: 0.5rem; background: #1f2937; color: white; padding: 0.875rem 2rem; text-decoration: none; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; transition: background 0.3s;">
                        <span class="material-icons" style="font-size: 16px;">add</span>
                        Create First Snippet
                    </a>
                </div>
            `;
            
            // Reset stats
            document.getElementById('total-snippets').textContent = '0';
            document.getElementById('total-languages').textContent = '0';
        }
    } catch (err) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="width: 64px; height: 64px; background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
                    <i data-lucide="alert-circle" style="width: 32px; height: 32px; color: #ef4444;"></i>
                </div>
                <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem; color: #111827; text-transform: uppercase; letter-spacing: -0.5px;">Connection Error</h3>
                <p style="color: #6b7280; font-size: 0.875rem;">Failed to load snippets. Please check your connection.</p>
            </div>
        `;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        console.error('Error loading snippets:', err);
    }
}

// ============================================
// DETAIL PAGE (detail.html)
// ============================================

async function loadDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const contentDiv = document.getElementById('detail-content');

    if (!id) {
        contentDiv.innerHTML = `
            <div style="text-align:center; padding: 60px 20px;">
                <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: -0.5px;">404</h2>
                <p style="color: #6b7280; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em;">ID NOT FOUND</p>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/snippets?id=${id}`);
        const { data, error } = await response.json();

        if (error) throw new Error(error);

        if (data) {
            const fileName = data.title.toLowerCase().replace(/\s+/g, '-');
            const extension = data.tags ? data.tags.toLowerCase().split(',')[0].trim() : 'js';
            
            contentDiv.innerHTML = `
                <div class="detail-header">
                    <h1>code/${fileName}.${extension}</h1>
                    <div class="meta-info">
                        <span>
                            <i data-lucide="tag" style="width:14px;"></i>
                            ${data.tags || 'General'}
                        </span>
                        <span>
                            <i data-lucide="calendar" style="width:14px;"></i>
                            ${formatDate(data.created_at)}
                        </span>
                    </div>
                </div>
                
                <div class="code-window">
                    <div class="code-toolbar">
                        <div class="window-dots">
                            <div class="dot red"></div>
                            <div class="dot yellow"></div>
                            <div class="dot green"></div>
                        </div>
                        <button onclick="copyCode()" class="btn-action">
                            <i data-lucide="copy" style="width:14px"></i>
                            Copy
                        </button>
                    </div>
                    <pre class="language-javascript"><code id="codeRaw">${escapeHtml(data.code)}</code></pre>
                </div>
            `;
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        }
    } catch (err) {
        contentDiv.innerHTML = `
            <div style="text-align:center; padding: 60px 20px;">
                <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: -0.5px;">404</h2>
                <p style="color: #6b7280; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em;">SNIPPET NOT FOUND</p>
            </div>
        `;
        console.error('Error loading detail:', err);
    }
}

function copyCode() {
    const code = document.getElementById('codeRaw').innerText;
    navigator.clipboard.writeText(code).then(() => {
        const btn = event.target.closest('.btn-action');
        const originalHTML = btn.innerHTML;
        
        btn.innerHTML = '<i data-lucide="check" style="width:14px"></i> Copied';
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 2000);
    }).catch(err => {
        alert('Failed to copy code');
        console.error('Copy error:', err);
    });
}

// ============================================
// UPLOAD PAGE (upload.html)
// ============================================

function checkAuth() {
    const password = document.getElementById('adminPass').value;
    const ADMIN_PASSWORD = 'dolphin2025';
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('authenticated', 'true');
        showUploadPanel();
    } else {
        alert('Invalid security key');
        document.getElementById('adminPass').value = '';
    }
}

function showUploadPanel() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('uploadPanel').style.display = 'block';
}

async function handleUpload() {
    const title = document.getElementById('title').value.trim();
    const tags = document.getElementById('tags').value.trim();
    const code = document.getElementById('code').value.trim();

    if (!title || !code) {
        alert('Title and code are required');
        return;
    }

    const btn = document.getElementById('uploadBtn');
    const originalText = btn.textContent;
    
    btn.disabled = true;
    btn.textContent = 'UPLOADING...';

    try {
        const response = await fetch(`${API_URL}/snippets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                tags: tags || null,
                code: code
            })
        });

        const { data, error } = await response.json();

        if (error) throw new Error(error);

        alert('✓ Snippet uploaded successfully!');
        
        document.getElementById('title').value = '';
        document.getElementById('tags').value = '';
        document.getElementById('code').value = '';
        
    } catch (error) {
        alert('Upload failed: ' + error.message);
        console.error('Upload error:', error);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

function logout() {
    sessionStorage.removeItem('authenticated');
    document.getElementById('uploadPanel').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminPass').value = '';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options).toUpperCase();
}

function filterSnippets() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.snippet-card');
    
    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        const tag = card.querySelector('.tag') ? card.querySelector('.tag').innerText.toLowerCase() : "";
        
        if (title.includes(query) || tag.includes(query)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function filterByTag(tag) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Clear search
    document.getElementById('search-input').value = '';
    
    // Filter cards
    const cards = document.querySelectorAll('.snippet-card');
    cards.forEach(card => {
        const cardTag = card.querySelector('.tag')?.innerText.toLowerCase();
        if (tag === 'all' || cardTag?.includes(tag)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function quickCopy(code) {
    navigator.clipboard.writeText(code).then(() => {
        // Visual feedback
        const btn = event.target.closest('.btn-icon');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="material-icons" style="font-size: 16px;">check</span>';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 1500);
    }).catch(err => {
        alert('Failed to copy code');
        console.error('Copy error:', err);
    });
}

// ============================================
// AUTO-LOAD FUNCTIONS
// ============================================

if (document.getElementById('snippet-list')) {
    window.addEventListener('load', loadSnippets);
}

if (document.getElementById('detail-content')) {
    window.addEventListener('load', loadDetail);
}

if (document.getElementById('uploadPanel')) {
    window.addEventListener('load', function() {
        const isAuthenticated = sessionStorage.getItem('authenticated');
        if (isAuthenticated === 'true') {
            showUploadPanel();
        }
    });
    
    const adminPassInput = document.getElementById('adminPass');
    if (adminPassInput) {
        adminPassInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAuth();
            }
        });
    }
}
