import { defineStore } from 'pinia';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    loggedIn: false
  }),
  actions: {
    login(username, password) {
      if (username === 'cxy' && password === 'cxy') {
        this.loggedIn = true;
        return true;
      } else {
        return false;
      }
    },
    logout() {
      this.loggedIn = false;
    }
  }
});
