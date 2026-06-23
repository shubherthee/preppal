const { createApp } = Vue;

createApp({
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      loading: false,
      registerError: '',
      successMsg: '',
    };
  },
  methods: {
    async handleRegister() {
      this.registerError = '';
      this.successMsg = '';

      // 1. Validations
      if (!this.name.trim() || !this.email.trim() || !this.password) {
        this.registerError = 'Please fill in all fields.';
        return;
      }
      if (!this.email.includes('@')) {
        this.registerError = 'Please enter a valid email address.';
        return;
      }
      if (this.password.length < 4) {
        this.registerError = 'Password must be at least 4 characters long.';
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.registerError = 'Passwords do not match.';
        return;
      }

      this.loading = true;
      try {
        const data = await PrepPalAPI.register(
          this.name.trim(),
          this.email.trim(),
          this.password
        );
        
        this.loading = false;
        
        if (data && data.token) {
          this.successMsg = 'Account created successfully! Logging you in...';
          
          // Store token and profile (normalizing 'student' -> 'Student' for frontend sidebar)
          localStorage.setItem('preppal_token', data.token);
          
          const userProfile = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: 'Student', // Seeded as 'student' on backend, capitalized to 'Student' for UI
            initials: data.user.initials,
            bio: 'A passionate student eager to learn and improve skills.',
            avatarBg: 'linear-gradient(135deg, var(--indigo), var(--mint))'
          };
          localStorage.setItem('preppal_profile', JSON.stringify(userProfile));
          
          // Redirect to dashboard after a brief delay so the user sees the success message
          setTimeout(() => {
            window.location.href = '../dashboard/dashboard.html';
          }, 800);
        } else {
          this.registerError = 'Invalid response from server.';
        }
      } catch (err) {
        this.loading = false;
        this.registerError = err.message || 'Registration failed. Please try again.';
      }
    },
  },
}).mount('#app');
