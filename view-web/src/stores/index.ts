import { defineStore } from "pinia";
import { getApiList } from "../server";
import type { RootObject, AreaTree, Today, Total } from "./type";

export const useStore = defineStore({
  id: "counter",
  state: () => ({
    list: <RootObject>{},
    item: <AreaTree[]>[],
    chinaAdd: <Today>{},
    chinaTotal: <Total>{},
  }),
  actions: {
    async getList() {
      const result = await getApiList();
      this.list = result;
      this.chinaAdd = this.list.chinaTotal.today;
      this.chinaTotal = this.list.chinaTotal.total;
    },
  },
});
