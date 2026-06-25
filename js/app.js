const { createApp } = Vue;

createApp({
  data() {
    return {
      email: '',
      password: '',
      remember: false,
      loading: false,
      loginError: '',
    };
  },
  methods: {
    async handleLogin() {
      this.loginError = '';

      if (!this.email.trim() || !this.password) {
        this.loginError = 'Please enter both email and password.';
        return;
      }

      this.loading = true;
      try {
        const data = await PrepPalAPI.login(this.email.trim(), this.password);
        this.loading = false;

        if (data && data.token) {
          localStorage.setItem('preppal_token', data.token);

          // Capitalize role for frontend compatibility (e.g., 'student' -> 'Student', 'admin' -> 'Admin', 'tutor' -> 'Tutor')
          const rawRole = data.user.role || 'student';
          const capitalizedRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

          const userProfile = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: capitalizedRole,
            initials: data.user.initials || '??',
            bio: data.user.bio || '',
            avatarBg: 'linear-gradient(135deg, var(--indigo), var(--mint))'
          };
          localStorage.setItem('preppal_profile', JSON.stringify(userProfile));

          // If remember is checked, store email
          if (this.remember) {
            localStorage.setItem('preppal_remember_email', this.email.trim());
          } else {
            localStorage.removeItem('preppal_remember_email');
          }

          if (capitalizedRole === 'Admin') {
            window.location.href = 'views/admins/admins_index.html';
          } else if (capitalizedRole === 'Tutor') {
            window.location.href = 'views/tutors/tutor_dashboard.html';
          } else {
            window.location.href = 'views/dashboard/dashboard.html';
          }
        } else {
          this.loginError = 'Invalid response from server.';
        }
      } catch (err) {
        this.loading = false;
        this.loginError = err.message || 'Login failed. Please check your credentials.';
      }
    }
  },
  mounted() {
    // Populate email if remember me was used previously
    const savedEmail = localStorage.getItem('preppal_remember_email');
    if (savedEmail) {
      this.email = savedEmail;
      this.remember = true;
    }
  }
}).mount('#app');
