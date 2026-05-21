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
        window.location.href = 'dashboard.html';
      }, 900);
    },
  },
}).mount('#app');
