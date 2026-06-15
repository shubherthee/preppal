// js/api.js
// Thin fetch wrapper for the PrepPal REST API.
// Sends the current user's id as `x-user-id` so the backend can enforce
// "edit/delete only your own quizzes/decks" and visibility rules.

window.PrepPalAPI = (function () {
  // Change this if your backend runs elsewhere.
  const BASE_URL = window.PREPPAL_API_BASE || 'http://localhost:4000/api';

  async function request(path, options = {}) {
    const user = PrepPalCore.getCurrentUser();
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': user.id,
      ...(options.headers || {}),
    };

    const res = await fetch(BASE_URL + path, { ...options, headers });

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
  };
})();
