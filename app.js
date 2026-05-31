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
    handleLogin() {
      this.loginError = '';
      if (!this.email || !this.password) {
        this.loginError = 'Please enter your email and password.';
        return;
      }
      if (!this.email.includes('@')) {
        this.loginError = 'Please enter a valid email address.';
        return;
      }
      if (this.password.length < 4) {
        this.loginError = 'Password must be at least 4 characters.';
        return;
      }
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
        
        // Sync profile email in localStorage on successful login
        const defaultProfile = {
          name: 'Alex Chen',
          email: this.email,
          role: 'Student',
          initials: 'AC',
          bio: 'A passionate student eager to learn and improve skills.',
          avatarBg: 'linear-gradient(135deg, var(--indigo), var(--mint))'
        };

        const stored = localStorage.getItem('preppal_profile');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            parsed.email = this.email;
            localStorage.setItem('preppal_profile', JSON.stringify(parsed));
          } catch (e) {
            localStorage.setItem('preppal_profile', JSON.stringify(defaultProfile));
          }
        } else {
          localStorage.setItem('preppal_profile', JSON.stringify(defaultProfile));
        }

        window.location.href = 'dashboard.html';
      }, 900);
    },
  },
}).mount('#app');
