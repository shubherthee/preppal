// js/pages/users.js
// Admin User Management Vue Script

PrepPalCore.mountApp({
  data() {
    return {
      users: [],
      loading: false,
      error: '',
      
      // Edit User Modal State
      showEditModal: false,
      editForm: {
        id: null,
        name: '',
        email: '',
        role: ''
      },
      editError: '',
      editLoading: false,
      
      // Add User Modal State
      showAddModal: false,
      addForm: {
        name: '',
        email: '',
        password: '',
        role: 'student'
      },
      addError: '',
      addLoading: false,
      
      searchQuery: ''
    };
  },
  computed: {
    filteredUsers() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return this.users;
      return this.users.filter(user => 
        (user.name && user.name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.role && user.role.toLowerCase().includes(query))
      );
    }
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      this.error = '';
      try {
        const data = await PrepPalAPI.getUsers();
        this.users = (data || []).map(u => ({
          ...u,
          role: u.role
        }));
      } catch (err) {
        this.error = err.message || 'Failed to load users list.';
      } finally {
        this.loading = false;
      }
    },
    getRoleBadgeStyle(role) {
      if (role === 'admin') {
        return { background: 'var(--rose-lt)', color: 'var(--rose)' };
      }
      if (role === 'tutor') {
        return { background: '#fff4e6', color: '#b25f11' }; // amber badge
      }
      return { background: 'var(--indigo-lt)', color: 'var(--indigo)' }; // student blue-indigo
    },
    
    // Add User Methods
    openAddModal() {
      this.addError = '';
      this.addForm = {
        name: '',
        email: '',
        password: '',
        role: 'student'
      };
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
    },
    async createNewUser() {
      this.addError = '';
      if (!this.addForm.name.trim() || !this.addForm.email.trim() || !this.addForm.password) {
        this.addError = 'Name, email, and password are required.';
        return;
      }
      if (!this.addForm.email.includes('@')) {
        this.addError = 'Please enter a valid email address.';
        return;
      }

      this.addLoading = true;
      try {
        const res = await PrepPalAPI.createUser({
          name: this.addForm.name.trim(),
          email: this.addForm.email.trim(),
          password: this.addForm.password,
          role: this.addForm.role
        });

        if (res && res.status === 'success') {
          this.users.push(res.user);
          this.closeAddModal();
        } else {
          this.addError = 'Failed to create user.';
        }
      } catch (err) {
        this.addError = err.message || 'Error occurred while creating user.';
      } finally {
        this.addLoading = false;
      }
    },

    // Edit User Methods
    openEditModal(user) {
      this.editError = '';
      this.editForm = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editForm = { id: null, name: '', email: '', role: '' };
    },
    async saveUserChanges() {
      this.editError = '';
      if (!this.editForm.name.trim() || !this.editForm.email.trim()) {
        this.editError = 'Name and Email cannot be empty.';
        return;
      }

      this.editLoading = true;
      try {
        const res = await PrepPalAPI.updateUser(this.editForm.id, {
          name: this.editForm.name.trim(),
          email: this.editForm.email.trim(),
          role: this.editForm.role
        });

        if (res && res.status === 'success') {
          const idx = this.users.findIndex(u => u.id === this.editForm.id);
          if (idx !== -1) {
            this.users[idx].name = res.user.name;
            this.users[idx].email = res.user.email;
            this.users[idx].role = res.user.role;
            this.users[idx].initials = res.user.initials;
          }
          this.closeEditModal();
        } else {
          this.editError = 'Failed to update user details.';
        }
      } catch (err) {
        this.editError = err.message || 'Error saving user changes.';
      } finally {
        this.editLoading = false;
      }
    },
    async deleteUser(userId) {
      if (userId === this.currentUserId) {
        alert('You cannot delete your own admin account.');
        return;
      }

      const confirmDelete = confirm('Are you sure you want to delete this user? This action cannot be undone.');
      if (!confirmDelete) return;

      try {
        const res = await PrepPalAPI.deleteUser(userId);
        if (res && res.status === 'success') {
          this.users = this.users.filter(u => u.id !== userId);
        } else {
          alert('Failed to delete user.');
        }
      } catch (err) {
        alert(err.message || 'Error occurred while deleting user.');
      }
    }
  },
  mounted() {
    this.fetchUsers();
  },
  template: `
    <div class="greeting">
      <h1>User Management</h1>
      <p>Configure role memberships, details, and delete users from the system.</p>
    </div>

    <!-- Search & Add user bar card -->
    <div class="card" style="padding: 16px; margin-bottom: 20px; display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
      <div class="search-wrap" style="flex: 1; max-width: 400px; margin-bottom: 0;">
        <span class="search-icon">🔍</span>
        <input type="text" v-model="searchQuery" placeholder="Search by name, email or role..." style="width: 100%;" />
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="color: var(--muted); font-size: 0.88rem; font-weight: 500;">
          Total: {{ filteredUsers.length }} users
        </div>
        <button class="btn-primary" @click="openAddModal" style="width: auto; padding: 10px 20px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; height: 40px; margin: 0; color: white;">
          ➕ Add User
        </button>
      </div>
    </div>

    <!-- Users Table card -->
    <div class="card" style="padding: 0; overflow-x: auto;">
      <div v-if="loading" style="padding: 40px; text-align: center; color: var(--muted); font-weight: 500;">
        <span style="display: inline-block; animation: spin 1s linear infinite; margin-bottom: 8px;">⏳</span> Loading users list...
      </div>
      <div v-else-if="error" style="padding: 40px; text-align: center; color: var(--rose); font-weight: 500;">
        ⚠️ {{ error }}
      </div>
      <div v-else-if="filteredUsers.length === 0" style="padding: 40px; text-align: center; color: var(--muted); font-weight: 500;">
        No users found matching query.
      </div>
      <table v-else class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; min-width: 600px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border); background: var(--indigo-lt);">
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em; border-top-left-radius: var(--radius-sm);">User</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em;">Email Address</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em;">Role</th>
            <th style="padding: 14px 20px; font-size: 0.82rem; font-weight: 700; color: var(--indigo); text-transform: uppercase; letter-spacing: 0.05em; text-align: right; border-top-right-radius: var(--radius-sm);">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" style="border-bottom: 1px solid var(--border); transition: background 0.15s; vertical-align: middle;">
            <td style="padding: 14px 20px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div class="avatar" style="width: 36px; height: 36px; font-size: 0.84rem; font-weight: 700; flex-shrink: 0; background: linear-gradient(135deg, var(--indigo), var(--mint)); display: flex; align-items: center; justify-content: center; color: white; border-radius: 50%;">
                  {{ user.initials }}
                </div>
                <div style="font-weight: 600; color: var(--text);">{{ user.name }}</div>
              </div>
            </td>
            <td style="padding: 14px 20px; color: var(--muted); font-size: 0.9rem;">{{ user.email }}</td>
            <td style="padding: 14px 20px;">
              <span style="font-size: 0.74rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em;"
                    :style="getRoleBadgeStyle(user.role)">
                {{ user.role }}
              </span>
            </td>
            <td style="padding: 14px 20px; text-align: right;">
              <div style="display: inline-flex; gap: 8px;">
                <button class="btn-secondary" @click="openEditModal(user)" style="padding: 6px 12px; font-size: 0.8rem; width: auto; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; height: 32px;">
                  ✏️ Edit
                </button>
                <button class="btn-primary" @click="deleteUser(user.id)" style="padding: 6px 12px; font-size: 0.8rem; width: auto; font-weight: 600; background: var(--rose); border-color: var(--rose); color: white; display: inline-flex; align-items: center; gap: 4px; height: 32px;" :disabled="user.id === currentUserId">
                  🗑️ Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:2000;">
      <div style="background:var(--bg); border:1.5px solid var(--border); border-radius:var(--radius-md); width:92%; max-width:440px; padding:24px; box-shadow:var(--shadow-lg); position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--text); margin: 0;">Add New User</h3>
          <button @click="closeAddModal" style="background: none; border: none; font-size: 1.5rem; color: var(--muted); cursor: pointer; padding: 0; line-height: 1;">&times;</button>
        </div>

        <div v-if="addError" class="error-msg" style="margin-bottom: 16px; background: #fff1f0; border: 1px solid #ffa39e; color: #f5222d; padding: 8px 12px; border-radius: 4px; font-size: 0.88rem;">{{ addError }}</div>

        <div class="field" style="margin-bottom: 16px;">
          <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 6px;">Full Name</label>
          <input type="text" v-model="addForm.name" placeholder="Alex Chen" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);" required />
        </div>

        <div class="field" style="margin-bottom: 16px;">
          <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 6px;">Email Address</label>
          <input type="email" v-model="addForm.email" placeholder="alex@school.edu" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);" required />
        </div>

        <div class="field" style="margin-bottom: 16px;">
          <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 6px;">Password</label>
          <input type="password" v-model="addForm.password" placeholder="••••••••" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);" required />
        </div>

        <div class="field" style="margin-bottom: 24px;">
          <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 6px;">Role</label>
          <select v-model="addForm.role" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);">
            <option value="student">student</option>
            <option value="tutor">tutor</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 16px;">
          <button class="btn-secondary" style="width: auto; padding: 10px 18px; height: 38px; font-size: 0.88rem;" @click="closeAddModal" :disabled="addLoading">Cancel</button>
          <button class="btn-primary" style="width: auto; padding: 10px 18px; height: 38px; font-size: 0.88rem; color: white;" @click="createNewUser" :disabled="addLoading">
            {{ addLoading ? 'Creating...' : 'Create User' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:2000;">
      <div style="background:var(--bg); border:1.5px solid var(--border); border-radius:var(--radius-md); width:92%; max-width:440px; padding:24px; box-shadow:var(--shadow-lg); position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--text); margin: 0;">Edit User</h3>
          <button @click="closeEditModal" style="background: none; border: none; font-size: 1.5rem; color: var(--muted); cursor: pointer; padding: 0; line-height: 1;">&times;</button>
        </div>

        <div v-if="editError" class="error-msg" style="margin-bottom: 16px; background: #fff1f0; border: 1px solid #ffa39e; color: #f5222d; padding: 8px 12px; border-radius: 4px; font-size: 0.88rem;">{{ editError }}</div>

        <div class="field" style="margin-bottom: 16px;">
          <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 6px;">Full Name</label>
          <input type="text" v-model="editForm.name" placeholder="Alex Chen" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);" required />
        </div>

        <div class="field" style="margin-bottom: 16px;">
          <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 6px;">Email Address</label>
          <input type="email" v-model="editForm.email" placeholder="alex@school.edu" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);" required />
        </div>

        <div class="field" style="margin-bottom: 24px;">
          <label style="display: block; font-size: .82rem; font-weight: 600; color: var(--text); margin-bottom: 6px;">Role</label>
          <select v-model="editForm.role" style="width:100%; height:40px; border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:0 12px; font-family:inherit; font-size:.95rem; outline:none; background:var(--bg);">
            <option value="student">student</option>
            <option value="tutor">tutor</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 16px;">
          <button class="btn-secondary" style="width: auto; padding: 10px 18px; height: 38px; font-size: 0.88rem;" @click="closeEditModal" :disabled="editLoading">Cancel</button>
          <button class="btn-primary" style="width: auto; padding: 10px 18px; height: 38px; font-size: 0.88rem; color: white;" @click="saveUserChanges" :disabled="editLoading">
            {{ editLoading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  `
});
