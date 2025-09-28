import axios from 'axios';
import notificationService from './notificationService';

const instance = axios.create();

// Optional: set a baseURL if your backend is always on the same origin
// instance.defaults.baseURL = 'http://localhost:8080';

instance.interceptors.response.use(
  (resp) => resp,
  (error) => {
    try {
      const status = error.response ? error.response.status : null;
      // try to extract a useful message from backend
      let serverMessage = null;
      if (error.response && error.response.data) {
        const data = error.response.data;
        // if backend sends { message: '...' }
        serverMessage = data.message || data.error || JSON.stringify(data);
      }

      const title = status ? `Error ${status}` : 'Network Error';
      const message = serverMessage || (error.message || 'An error occurred');
      // notify front-end
      notificationService.notify({ type: 'error', title, message });
      // mark the error so callers can avoid duplicate notifications
      try { error._notified = true; } catch (e) { /* ignore */ }
    } catch (e) {
      // swallow notification errors
      console.error('Notification failed', e);
    }

    return Promise.reject(error);
  }
);

export default instance;
