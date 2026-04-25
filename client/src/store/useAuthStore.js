import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('vaakcare_user')) || null,
  setUser: (user) => {
    if (user) {
      localStorage.setItem('vaakcare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('vaakcare_user');
    }
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('vaakcare_user');
    set({ user: null });
  }
}));

export default useAuthStore;
