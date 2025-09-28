// Simple notification service that stores a notifier callback set by the React provider
const notificationService = {
  _notifyFn: null,
  setNotifyFn(fn) {
    this._notifyFn = fn;
  },
  notify(payload) {
    if (this._notifyFn) this._notifyFn(payload);
    // otherwise noop
  }
};

export default notificationService;
