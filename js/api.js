// js/api.js
// Thin fetch wrapper for the PrepPal REST API.
// Sends the JWT Bearer token in the Authorization header.

window.PrepPalAPI = (function () {
  // Change this if your backend runs elsewhere.
  const BASE_URL = window.PREPPAL_API_BASE || 'http://localhost:4000/api';

  async function request(path, options = {}) {
    const token = localStorage.getItem('preppal_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const res = await fetch(BASE_URL + path, { ...options, headers });

    if (res.status === 401 && !path.endsWith('/login') && !path.endsWith('/register')) {
      // Clear credentials and redirect to login page
      localStorage.removeItem('preppal_token');
      localStorage.removeItem('preppal_profile');
      const atViews = /\/views\//.test(window.location.pathname);
      const rootRel = atViews ? '../../' : '';
      window.location.href = rootRel + 'index.html';
      throw new Error('Session expired. Please log in again.');
    }

    if (!res.ok) {
      let message = res.statusText;
      try {
        const body = await res.json();
        if (body.error) message = body.error;
      } catch (e) { /* no JSON body */ }
      throw new Error(message);
    }

    if (res.status === 204) return null;
    return res.json();
  }

  function qs(params) {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
    const s = new URLSearchParams(clean).toString();
    return s ? `?${s}` : '';
  }

  return {
    // Quizzes
    getQuizzes: (params = {}) => request('/quizzes' + qs(params)),
    getQuizFilters: () => request('/quizzes/meta/filters'),
    getQuiz: (id) => request(`/quizzes/${id}`),
    createQuiz: (data) => request('/quizzes', { method: 'POST', body: JSON.stringify(data) }),
    updateQuiz: (id, data) => request(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteQuiz: (id) => request(`/quizzes/${id}`, { method: 'DELETE' }),
    submitQuizAttempt: (id, answers) => request(`/quizzes/${id}/attempts`, { method: 'POST', body: JSON.stringify({ answers }) }),
    getMyQuizAttempts: () => request('/quizzes/attempts/mine'),
    getQuizAttempt: (attemptId) => request(`/quizzes/attempts/${attemptId}`),

    // Flashcard decks
    getDecks: (params = {}) => request('/decks' + qs(params)),
    getDeckFilters: () => request('/decks/meta/filters'),
    getDeck: (id) => request(`/decks/${id}`),
    createDeck: (data) => request('/decks', { method: 'POST', body: JSON.stringify(data) }),
    updateDeck: (id, data) => request(`/decks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteDeck: (id) => request(`/decks/${id}`, { method: 'DELETE' }),
    submitDeckAttempt: (id, results) => request(`/decks/${id}/attempts`, { method: 'POST', body: JSON.stringify({ results }) }),
    getMyDeckAttempts: () => request('/decks/attempts/mine'),
    getDeckAttempt: (attemptId) => request(`/decks/attempts/${attemptId}`),

    // Users
    getMe: () => request('/users/me'),
    getUsers: () => request('/users'),
    createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateProfile: (data) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
    login: (email, password) => request('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (name, email, password) => request('/users/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

    // Admin functions
    getAdminStats: () => request('/admin/stats'),
    createAdminTutor: (data) => request('/admin/tutors', { method: 'POST', body: JSON.stringify(data) }),
    updateAdminTutor: (id, data) => request(`/admin/tutors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteAdminTutor: (id) => request(`/admin/tutors/${id}`, { method: 'DELETE' }),
    toggleTutorStatus: (id, status) => request(`/admin/tutors/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    getAdminBookings: () => request('/admin/bookings'),
    deleteAdminBooking: (id) => request(`/admin/bookings/${id}`, { method: 'DELETE' }),
    getFlaggedContent: () => request('/admin/moderation'),
    updateFlaggedStatus: (id, status) => request(`/admin/moderation/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    deleteFlaggedContent: (id) => request(`/admin/moderation/${id}/content`, { method: 'DELETE' }),
    getAnnouncements: () => request('/admin/announcements'),
    createAnnouncement: (data) => request('/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
    deleteAnnouncement: (id) => request(`/admin/announcements/${id}`, { method: 'DELETE' }),

    // Tutors and Bookings on Student side
    getStudentTutors: () => request('/users/tutors'),
    createStudentBooking: (data) => request('/users/bookings', { method: 'POST', body: JSON.stringify(data) }),
    getStudentBookings: () => request('/users/bookings/mine'),

    // Tutor Role Functions
    getTutorDashboard: () => request('/tutors/dashboard'),
    getTutorBookings: () => request('/tutors/bookings'),
    updateTutorStatus: (status) => request('/tutors/status', { method: 'PUT', body: JSON.stringify({ status }) }),
    updateTutorRate: (rate) => request('/tutors/rate', { method: 'PUT', body: JSON.stringify({ rate }) }),
    updateTutorAvailability: (availability) => request('/tutors/availability', { method: 'PUT', body: JSON.stringify({ availability }) }),
    getTutorStudents: () => request('/tutors/students'),
    completeTutorBooking: (id) => request(`/tutors/bookings/${id}/complete`, { method: 'PUT' }),

    // Planner Tasks
    getPlannerTasks: () => request('/planner'),
    createPlannerTask: (data) => request('/planner', { method: 'POST', body: JSON.stringify(data) }),
    updatePlannerTask: (id, data) => request(`/planner/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletePlannerTask: (id) => request(`/planner/${id}`, { method: 'DELETE' }),

    // Reminders
    getReminders: () => request('/planner/reminders'),
    createReminder: (data) => request('/planner/reminders', { method: 'POST', body: JSON.stringify(data) }),
    deleteReminder: (id) => request(`/planner/reminders/${id}`, { method: 'DELETE' }),

    // Study Materials
    getMaterials: () => request('/planner/materials'),
    createMaterial: (data) => request('/planner/materials', { method: 'POST', body: JSON.stringify(data) }),

    // AI Schedule
    getAISchedule: () => request('/planner/schedule'),
    generateAISchedule: () => request('/planner/generate-schedule', { method: 'POST' }),

    // Analytics
    getAnalyticsRecords: () => request('/analytics'),
    createAnalyticsRecord: (data) => request('/analytics', { method: 'POST', body: JSON.stringify(data) }),
    generateSkillGaps: () => request('/analytics/skill-gaps', { method: 'POST' }),

    // Content Hub
    getMaterials:    ()        => request('/content'),
    createMaterial:  (data)    => request('/content',       { method: 'POST',   body: JSON.stringify(data) }),
    updateMaterial:  (id, data)=> request(`/content/${id}`, { method: 'PUT',    body: JSON.stringify(data) }),
    deleteMaterial:  (id)      => request(`/content/${id}`, { method: 'DELETE'                             }),

    // Exam & Assignment Tracker
    getTrackerItems:    ()        => request('/tracker'),
    getTrackerStats:    ()        => request('/tracker/stats'),
    createTrackerItem:  (data)    => request('/tracker',              { method: 'POST',  body: JSON.stringify(data) }),
    updateTrackerItem:  (id, data)=> request(`/tracker/${id}`,        { method: 'PUT',   body: JSON.stringify(data) }),
    toggleTrackerDone:  (id)      => request(`/tracker/${id}/complete`,{ method: 'PATCH'                           }),
    deleteTrackerItem:  (id)      => request(`/tracker/${id}`,        { method: 'DELETE'                           }),

    // Expose raw request for advanced use
    request,
  };
})();
