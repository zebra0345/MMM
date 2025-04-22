import { atom, selector } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist({
  key: "user",
  storage: localStorage,
});

export const userAtom = atom({
  key: "userAtom",
  default: {
    userId: null,
    email: "",
    isLoggedIn: false,
    autoLogin: false
  },
  effects_UNSTABLE: [persistAtom],
});

export const isLoginSelector = selector({
  key: "isLoginSelector",
  get: ({ get }) => {
    const user = get(userAtom);
    return user.isLoggedIn;
  },
});