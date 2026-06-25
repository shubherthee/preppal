// js/pages/content.js
// Educational Content Hub — file upload, folder creation, CRUD

window.addEventListener('DOMContentLoaded', () => {
  if (typeof window.PrepPalCore === 'undefined') return;

  window.PrepPalCore.mountApp({
    data() {
      return {
        materials:    [],
        loading:      false,
        error:        '',
        searchQuery:  '',
        filterType:   'all',   // all | file | folder
        currentFolderId: null,

        // Upload modal
        showUploadModal:  false,
        uploadMode:       'file',   // 'file' | 'folder'
        dragOver:         false,
        selectedFiles:    [],       // File objects from input/drop
        uploadForm:       { description: '', subject: '', topic: '' },
        uploading:        false,
        uploadProgress:   0,
        uploadError:      '',

        // Edit modal
        showEditModal: false,
        editingItem:   null,
        editForm:      { filename: '', description: '', subject: '', topic: '' },
        editError:     '',
        editSaving:    false,

        draggedItemId:    null,
        activeMenuId:     null,
      };
    },

    computed: {
      filtered() {
        const q = this.searchQuery.toLowerCase().trim();
        return this.materials.filter(m => {
          if (m.type === 'summary') return false;
          const name    = (m.original_name || m.filename || '').toLowerCase();
          const desc    = (m.description   || '').toLowerCase();
          const subject = (m.subject       || '').toLowerCase();
          const matchFolder = (m.parent_id || null) === (this.currentFolderId || null);
          const matchSearch = !q || name.includes(q) || desc.includes(q) || subject.includes(q);
          const matchType   = this.filterType === 'all' || (m.type || 'file') === this.filterType;
          return matchFolder && matchSearch && matchType;
        });
      },
      currentFolder() {
        return this.materials.find(m => m.id === this.currentFolderId) || null;
      },
      fileCount()    { return this.materials.filter(m => (m.type || 'file') === 'file').length; },
      folderCount()  { return this.materials.filter(m => m.type === 'folder').length; },
      folders()      { return this.materials.filter(m => m.type === 'folder'); },

      selectedFileNames() {
        return Array.from(this.selectedFiles).map(f => f.relativePath || f.webkitRelativePath || f.name).join(', ') || 'No files selected';
      },
    },

    methods: {
      // ── Fetch ────────────────────────────────────────────────────────
      async fetchMaterials() {
        this.loading = true;
        this.error   = '';
        try {
          this.materials = await PrepPalAPI.request('/content');
          if (this.currentFolderId && !this.materials.some(m => m.id === this.currentFolderId)) {
            this.currentFolderId = null;
          }
        } catch (e) {
          this.error = e.message || 'Failed to load materials';
        } finally {
          this.loading = false;
        }
      },

      // ── Upload modal ─────────────────────────────────────────────────
      openUpload(mode = 'file') {
        this.uploadMode    = mode;
        this.selectedFiles = [];
        this.uploadForm    = { description: '', subject: '', topic: '' };
        this.uploadError   = '';
        this.uploadProgress = 0;
        this.showUploadModal = true;
      },

      onFileInput(e) {
        this.selectedFiles = Array.from(e.target.files);
      },

      async collectDroppedFiles(items) {
        const files = [];
        const readDirectory = entry => new Promise(resolve => {
          const reader = entry.createReader();
          const entries = [];
          const readBatch = () => {
            reader.readEntries(batch => {
              if (!batch.length) return resolve(entries);
              entries.push(...batch);
              readBatch();
            });
          };
          readBatch();
        });
        const walkEntry = async (entry, prefix = '') => {
          if (entry.isFile) {
            await new Promise(resolve => {
              entry.file(file => {
                file.relativePath = `${prefix}${file.name}`;
                files.push(file);
                resolve();
              });
            });
          } else if (entry.isDirectory) {
            const entries = await readDirectory(entry);
            await Promise.all(entries.map(child => walkEntry(child, `${prefix}${entry.name}/`)));
          }
        };

        for (const item of items) {
          if (item.kind !== 'file') continue;
          const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
          if (entry) await walkEntry(entry);
          else {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        }
        return files;
      },

      async onDrop(e) {
        this.dragOver = false;
        const items = e.dataTransfer.items || [];
        const files = await this.collectDroppedFiles(items);
        if (files.length) this.selectedFiles = [...this.selectedFiles, ...files];
      },

      async doUpload() {
        if (this.uploadMode === 'folder') {
          await this.createFolder();
          return;
        }
        if (!this.selectedFiles.length) {
          this.uploadError = 'Please select at least one file.';
          return;
        }

        this.uploading      = true;
        this.uploadError    = '';
        this.uploadProgress = 0;

        try {
          const formData = new FormData();
          for (const file of this.selectedFiles) formData.append('files', file);
          formData.append('relativePaths', JSON.stringify(this.selectedFiles.map(file => file.relativePath || file.webkitRelativePath || file.name)));
          if (this.uploadForm.description) formData.append('description', this.uploadForm.description);
          if (this.uploadForm.subject)     formData.append('subject',     this.uploadForm.subject);
          if (this.uploadForm.topic)       formData.append('topic',       this.uploadForm.topic);
          if (this.currentFolderId)         formData.append('parent_id',   this.currentFolderId);

          const token = localStorage.getItem('preppal_token');
          const res   = await fetch('http://localhost:4000/api/content/upload', {
            method:  'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body:    formData,
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || res.statusText);
          }

          const data = await res.json();
          // Prepend newly uploaded files to list
          const newFolders = (data.folders || []).filter(folder => !this.materials.some(m => m.id === folder.id));
          this.materials.unshift(...newFolders, ...data.files.reverse());
          this.showUploadModal = false;
        } catch (e) {
          this.uploadError = e.message || 'Upload failed.';
        } finally {
          this.uploading = false;
        }
      },

      async createFolder() {
        if (!this.uploadForm.subject.trim() && !this.uploadForm.topic.trim() && !this.uploadForm.description.trim()) {
          // Use description field as folder name when subject/topic empty
        }
        const name = this.uploadForm.subject.trim() || this.uploadForm.description.trim() || 'New Folder';
        this.uploading   = true;
        this.uploadError = '';
        try {
          const created = await PrepPalAPI.request('/content/folder', {
            method: 'POST',
            body: JSON.stringify({
              filename:    name,
              description: this.uploadForm.description,
              subject:     this.uploadForm.subject,
              topic:       this.uploadForm.topic,
              parent_id:    this.currentFolderId,
            }),
          });
          this.materials.unshift(created);
          this.showUploadModal = false;
        } catch (e) {
          this.uploadError = e.message || 'Failed to create folder.';
        } finally {
          this.uploading = false;
        }
      },

      // ── Edit ─────────────────────────────────────────────────────────
      openEdit(m) {
        this.activeMenuId = null;
        this.editingItem = m;
        this.editForm    = {
          filename:    m.original_name || m.filename,
          description: m.description  || '',
          subject:     m.subject      || '',
          topic:       m.topic        || '',
        };
        this.editError   = '';
        this.showEditModal = true;
      },

      async saveEdit() {
        if (!this.editForm.filename.trim()) { this.editError = 'Name is required.'; return; }
        this.editSaving = true;
        this.editError  = '';
        try {
          await PrepPalAPI.request(`/content/${this.editingItem.id}`, {
            method: 'PUT',
            body: JSON.stringify(this.editForm),
          });
          const idx = this.materials.findIndex(m => m.id === this.editingItem.id);
          if (idx >= 0) Object.assign(this.materials[idx], {
            original_name: this.editForm.filename,
            filename:      this.editForm.filename,
            description:   this.editForm.description,
            subject:       this.editForm.subject,
            topic:         this.editForm.topic,
          });
          this.showEditModal = false;
        } catch (e) {
          this.editError = e.message || 'Save failed.';
        } finally {
          this.editSaving = false;
        }
      },

      // ── Delete ───────────────────────────────────────────────────────
      async deleteMaterial(id) {
        this.activeMenuId = null;
        if (!confirm('Delete this material?')) return;
        try {
          await PrepPalAPI.request(`/content/${id}`, { method: 'DELETE' });
          this.materials = this.materials.filter(m => m.id !== id);
        } catch (e) {
          alert('Delete failed: ' + e.message);
        }
      },

      // ── Download ─────────────────────────────────────────────────────
      async moveMaterial(item, parentId) {
        if (!item || item.id === parentId) return;
        try {
          await PrepPalAPI.request(`/content/${item.id}/move`, {
            method: 'POST',
            body: JSON.stringify({ parent_id: parentId || null }),
          });
          const target = this.materials.find(m => m.id === item.id);
          if (target) target.parent_id = parentId || null;
        } catch (e) {
          alert('Move failed: ' + e.message);
        } finally {
          this.draggedItemId = null;
          this.activeMenuId = null;
        }
      },

      onCardDrop(targetFolder) {
        const item = this.materials.find(m => m.id === this.draggedItemId);
        if (item && targetFolder?.type === 'folder') this.moveMaterial(item, targetFolder.id);
      },

      folderName(parentId) {
        const folder = this.materials.find(m => m.id === parentId);
        return folder ? (folder.original_name || folder.filename) : '';
      },

      openFolder(folder) {
        if (folder?.type === 'folder') {
          this.activeMenuId = null;
          this.currentFolderId = folder.id;
          this.filterType = 'all';
        }
      },

      openMaterial(item) {
        if (item?.type === 'folder') {
          this.openFolder(item);
          return;
        }
        if (item?.type === 'file') this.openFileInNewTab(item);
      },

      goUpFolder() {
        const parentId = this.currentFolder?.parent_id || null;
        this.currentFolderId = parentId;
        this.filterType = 'all';
      },

      toggleActionMenu(itemId) {
        this.activeMenuId = this.activeMenuId === itemId ? null : itemId;
      },

      downloadFile(m) {
        if (m.type === 'folder') return;
        this.activeMenuId = null;
        const token = localStorage.getItem('preppal_token');
        // Open download URL directly
        const url = `http://localhost:4000/api/content/${m.id}/download`;
        // Use fetch to trigger download with auth header
        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.blob())
          .then(blob => {
            const a   = document.createElement('a');
            a.href    = URL.createObjectURL(blob);
            a.download = m.original_name || m.filename;
            a.click();
            URL.revokeObjectURL(a.href);
          })
          .catch(() => alert('Download failed.'));
      },

      async openFileInNewTab(m) {
        if (!m || m.type !== 'file') return;
        this.activeMenuId = null;

        const previewTab = window.open('about:blank', '_blank');
        if (!previewTab) {
          alert('Please allow pop-ups to open this file in a new tab.');
          return;
        }

        try {
          previewTab.document.title = m.original_name || m.filename || 'Material';
          previewTab.document.body.innerHTML = '<p style="font-family:sans-serif;padding:24px;">Opening file...</p>';

          const token = localStorage.getItem('preppal_token');
          const res = await fetch(`http://localhost:4000/api/content/${m.id}/download`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || res.statusText);
          }

          const blob = await res.blob();
          const fileBlob = blob.type ? blob : new Blob([blob], { type: m.mime_type || 'application/octet-stream' });
          const fileUrl = URL.createObjectURL(fileBlob);
          previewTab.location.href = fileUrl;
          setTimeout(() => URL.revokeObjectURL(fileUrl), 60 * 1000);
        } catch (e) {
          previewTab.close();
          alert('Open failed: ' + (e.message || 'Unable to open file.'));
        }
      },

      // ── Helpers ──────────────────────────────────────────────────────
      iconFor(m) {
        if (m.type === 'folder')  return '📁';
        const name = (m.original_name || m.filename || '').toLowerCase();
        if (name.endsWith('.pdf'))               return '📄';
        if (name.match(/\.docx?$/))              return '📝';
        if (name.match(/\.pptx?$/))              return '📊';
        if (name.match(/\.xlsx?$|\.csv$/))       return '📈';
        if (name.match(/\.mp4$|\.mov$|\.avi$/))  return '🎬';
        if (name.match(/\.png$|\.jpe?g$|\.gif$|\.webp$/)) return '🖼️';
        if (name.match(/\.zip$|\.rar$/))         return '🗜️';
        return '📎';
      },

      badgeFor(m) {
        if (m.type === 'folder')  return 'FOLDER';
        const ext = (m.original_name || m.filename || '').split('.').pop().toUpperCase();
        return ext || 'FILE';
      },

      formatSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024)        return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      },

      formatDate(dt) {
        if (!dt) return '';
        return new Date(dt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
      },
    },

    mounted() { this.fetchMaterials(); },

    template: `
      <!-- Topbar -->
      <div class="topbar">
        <div class="search-wrap">
          <span class="search-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="text" v-model="searchQuery" placeholder="Search materials and subjects…" />
        </div>
        <div class="topbar-avatar" :style="{ background: userAvatarBg }">{{ initials }}</div>
      </div>

      <!-- Header -->
      <div class="page-header" style="margin-bottom:24px;">
        <div class="greeting" style="margin-bottom:0">
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn-primary" style="width:auto;padding:10px 18px;white-space:nowrap;" @click="openUpload('file')">
            ⬆ Upload Files
          </button>
          <button class="btn-secondary" style="width:auto;padding:10px 18px;white-space:nowrap;" @click="openUpload('folder')">
            📁 New Folder
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-row" style="margin-bottom:28px;">
        <div class="stat-card">
          <div class="stat-top">
            <div class="stat-icon" style="background:#eef7ff;color:#1c5db6;">📄</div>
            <span class="stat-badge" style="background:#eef7ff;color:#1c5db6;">Files</span>
          </div>
          <div class="stat-val">{{ fileCount }}</div>
          <div class="stat-label">Study Files</div>
        </div>
        <div class="stat-card">
          <div class="stat-top">
            <div class="stat-icon" style="background:#fff4e6;color:#b25f11;">📁</div>
            <span class="stat-badge" style="background:#fff4e6;color:#b25f11;">Folders</span>
          </div>
          <div class="stat-val">{{ folderCount }}</div>
          <div class="stat-label">Folders</div>
        </div>
        <div class="stat-card">
          <div class="stat-top">
            <div class="stat-icon" style="background:#f4f0ff;color:#7c3aed;">📦</div>
            <span class="stat-badge" style="background:#f4f0ff;color:#7c3aed;">Total</span>
          </div>
          <div class="stat-val">{{ materials.length }}</div>
          <div class="stat-label">Total Items</div>
        </div>
      </div>

      <!-- Drag-and-drop upload zone -->
      <div class="upload-zone" style="margin-bottom:28px;cursor:pointer;"
           :style="dragOver ? 'border-color:var(--indigo);background:var(--indigo-lt);' : ''"
           @click="openUpload('file')"
           @dragover.prevent="dragOver=true"
           @dragleave="dragOver=false"
           @drop.prevent="e => { dragOver=false; openUpload('file'); onDrop(e); }">
        <div class="upload-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.8" fill="none"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
        </div>
        <div class="upload-text">{{ dragOver ? 'Drop files here!' : 'Drop files or folders here, or click to upload' }}</div>
        <div class="upload-sub">PDF, DOCX, PPTX, XLSX, TXT, images, videos — up to 50 MB each</div>
      </div>

      <!-- Filter bar -->
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:20px;flex-wrap:wrap;">
        <button v-if="currentFolder" class="btn-sm" @click="goUpFolder" title="Back to parent folder">
          ← Back
        </button>
        <div class="section-title" style="margin:0;flex-shrink:0;">
          {{ currentFolder ? (currentFolder.original_name || currentFolder.filename) : 'Materials' }}
        </div>
        <div style="display:flex;gap:8px;margin-left:auto;flex-wrap:wrap;">
          <button v-for="ft in ['all','file','folder']" :key="ft"
            class="filter-tab" :class="{ active: filterType === ft }"
            @click="filterType = ft">
            {{ ft === 'all' ? 'All' : ft.charAt(0).toUpperCase()+ft.slice(1)+'s' }}
          </button>
        </div>
        <button class="btn-sm" @click="fetchMaterials" title="Refresh">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="card" style="text-align:center;color:var(--muted);padding:40px;">⏳ Loading…</div>
      <div v-if="error && !loading" class="error-msg" style="margin-bottom:16px;">{{ error }}</div>

      <!-- Content Grid -->
      <div v-if="!loading" class="content-grid">
        <div class="content-card" v-for="item in filtered" :key="item.id"
             draggable="true"
             :style="item.type === 'folder' && draggedItemId && draggedItemId !== item.id ? 'outline:2px dashed var(--indigo);outline-offset:3px;' : ''"
             @dragstart="draggedItemId = item.id"
             @dragend="draggedItemId = null"
             @dragover.prevent="item.type === 'folder' && draggedItemId !== item.id"
             @drop.prevent="onCardDrop(item)"
             @dblclick="openMaterial(item)">
          <div class="content-header">
            <span class="content-type-icon" style="font-size:1.6rem;">{{ iconFor(item) }}</span>
            <div style="display:flex;align-items:center;gap:6px;position:relative;">
              <span style="font-size:.68rem;padding:3px 8px;background:var(--indigo-lt);color:var(--indigo);border-radius:8px;font-weight:700;">
                {{ badgeFor(item) }}
              </span>
              <button class="content-menu-btn" title="More actions" @click.stop="toggleActionMenu(item.id)">⋯</button>
              <div v-if="activeMenuId === item.id" class="content-action-menu" @click.stop>
                <button v-if="item.type === 'folder'" @click="openFolder(item)">Open</button>
                <button v-if="item.type === 'file'" @click="openFileInNewTab(item)">Open</button>
                <button v-if="item.type === 'file'" @click="downloadFile(item)">Download</button>
                <label v-if="folders.filter(folder => folder.id !== item.id).length">
                  Move to
                  <select :value="item.parent_id || ''"
                          @change="moveMaterial(item, $event.target.value ? Number($event.target.value) : null)">
                    <option value="">No folder</option>
                    <option v-for="folder in folders.filter(folder => folder.id !== item.id)" :key="folder.id" :value="folder.id">
                      {{ folder.original_name || folder.filename }}
                    </option>
                  </select>
                </label>
                <button v-if="item.parent_id" @click="moveMaterial(item, null)">Exit Folder</button>
                <button @click="openEdit(item)">Edit</button>
                <button class="danger" @click="deleteMaterial(item.id)">Delete</button>
              </div>
            </div>
          </div>
          <div class="content-title" style="margin-top:8px;cursor:pointer;" @click="openFolder(item)">
            {{ item.original_name || item.filename }}
          </div>
          <div class="content-meta">{{ item.description || 'No description' }}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
            <span v-if="item.subject" style="font-size:.7rem;background:#f4f0ff;color:#7c3aed;padding:2px 8px;border-radius:8px;font-weight:600;">{{ item.subject }}</span>
            <span v-if="item.topic"   style="font-size:.7rem;background:#edf7f0;color:#1f7a4c;padding:2px 8px;border-radius:8px;font-weight:600;">{{ item.topic }}</span>
            <span v-if="item.file_size" style="font-size:.7rem;color:var(--muted);">{{ formatSize(item.file_size) }}</span>
          </div>
          <div class="content-meta" style="margin-top:4px;font-size:.72rem;color:var(--muted);">
            {{ formatDate(item.created_at) }}
          </div>
          <div v-if="item.type === 'folder'" class="content-meta" style="margin-top:4px;font-size:.72rem;color:var(--indigo);">
            Click to open folder
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filtered.length === 0" style="grid-column:1/-1;">
          <div class="card" style="text-align:center;padding:56px 24px;">
            <div style="font-size:3rem;margin-bottom:12px;">📂</div>
            <div style="font-family:'Sora',sans-serif;font-weight:700;font-size:1.1rem;margin-bottom:8px;">No materials found</div>
            <div style="color:var(--muted);font-size:.9rem;margin-bottom:20px;">
              {{ searchQuery ? 'Try a different search.' : 'Upload your first file or create a folder.' }}
            </div>
            <button class="btn-primary" style="width:auto;padding:10px 24px;" @click="openUpload('file')">⬆ Upload Files</button>
          </div>
        </div>
      </div>

      <!-- ── Upload Modal ───────────────────────────────────────────── -->
      <div v-if="showUploadModal" class="modal-overlay" @click.self="showUploadModal=false">
        <div class="modal" style="max-width:520px;">
          <div class="modal-header">
            <h3>{{ uploadMode === 'folder' ? '📁 New Folder' : '⬆ Upload Files' }}</h3>
            <button class="btn-sm" @click="showUploadModal=false">✕</button>
          </div>
          <div class="modal-body">
            <div v-if="uploadError" class="error-msg" style="margin-bottom:12px;">{{ uploadError }}</div>

            <!-- File picker (only in file mode) -->
            <div v-if="uploadMode === 'file'" class="form-field">
              <label>Select Files</label>
              <div style="border:2px dashed var(--border);border-radius:var(--radius-sm);padding:24px;text-align:center;cursor:pointer;transition:border-color .2s;"
                   :style="dragOver ? 'border-color:var(--indigo);background:var(--indigo-lt);' : ''"
                   @click="$refs.fileInput.click()"
                   @dragover.prevent="dragOver=true"
                   @dragleave="dragOver=false"
                   @drop.prevent="e => { dragOver=false; onDrop(e); }">
                <div style="font-size:2rem;margin-bottom:6px;">📂</div>
                <div style="font-size:.88rem;color:var(--muted);">
                  {{ selectedFiles.length ? selectedFiles.length + ' file(s) selected' : 'Click or drag & drop files / folders here' }}
                </div>
                <div v-if="selectedFiles.length" style="font-size:.75rem;color:var(--indigo);margin-top:6px;word-break:break-all;">
                  {{ selectedFileNames }}
                </div>
              </div>
              <input ref="fileInput" type="file" multiple style="display:none;" @change="onFileInput" />
            </div>

            <!-- Folder name (only in folder mode) -->
            <div v-if="uploadMode === 'folder'" class="form-field">
              <label>Folder Name</label>
              <input v-model="uploadForm.subject" placeholder="e.g. Machine Learning XAI" />
            </div>

            <div class="form-field">
              <label>Description <span style="color:var(--muted);font-weight:400;">(optional)</span></label>
              <input v-model="uploadForm.description" placeholder="Brief description" />
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Subject</label>
                <input v-model="uploadForm.subject" placeholder="e.g. Biology" />
              </div>
              <div class="form-field">
                <label>Topic</label>
                <input v-model="uploadForm.topic" placeholder="e.g. Cell Structure" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-sm" @click="showUploadModal=false">Cancel</button>
              <button class="btn-sm primary" @click="doUpload" :disabled="uploading">
                {{ uploading ? 'Uploading…' : (uploadMode === 'folder' ? 'Create Folder' : 'Upload') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Edit Modal ─────────────────────────────────────────────── -->
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal=false">
        <div class="modal">
          <div class="modal-header">
            <h3>✏️ Edit Material</h3>
            <button class="btn-sm" @click="showEditModal=false">✕</button>
          </div>
          <div class="modal-body">
            <div v-if="editError" class="error-msg" style="margin-bottom:12px;">{{ editError }}</div>
            <div class="form-field">
              <label>Name</label>
              <input v-model="editForm.filename" placeholder="Filename or title" />
            </div>
            <div class="form-field">
              <label>Description</label>
              <input v-model="editForm.description" placeholder="Brief description" />
            </div>
            <div class="form-row">
              <div class="form-field">
                <label>Subject</label>
                <input v-model="editForm.subject" placeholder="e.g. Biology" />
              </div>
              <div class="form-field">
                <label>Topic</label>
                <input v-model="editForm.topic" placeholder="e.g. Cell Structure" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-sm" @click="showEditModal=false">Cancel</button>
              <button class="btn-sm primary" @click="saveEdit" :disabled="editSaving">
                {{ editSaving ? 'Saving…' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  });
});
