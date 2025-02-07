import { connectToChild, connectToParent, Connection, Methods } from "penpal";
import { create, StoreApi, UseBoundStore } from "zustand";
import { ConnectToChildOptions, ConnectToParentOptions } from "./types";

type StoreState<T extends Record<string, any> = Record<string, any>> = T;

export class IframeBridgeStore<
  T extends Record<string, any> = Record<string, any>
> {
  private connection: Connection | null = null;
  private store: UseBoundStore<StoreApi<T>> | null = null;
  private initialState: StoreState<T> = {} as T;
  private methods: Methods = {};
  private test = 1;

  constructor(
    options: {
      initialState?: StoreState<T>;
      methods?: Methods;
    } = {}
  ) {
    this.initialState = options.initialState || ({} as T);
    this.methods = options.methods || {};
    console.log("this.initialState", this.initialState, this.test);
  }

  // 创建共享状态存储----1121312
  private createStore() {
    return create<StoreState<T>>((set) => ({
      ...this.initialState,
      setState: (newState: Partial<StoreState<T>>) => {
        set(newState);
        // 同步状态到另一端
        this.syncState(newState);
      },
    }));
  }

  // 连接父应用（在子应用中调用）
  async connectToParent(options: ConnectToParentOptions) {
    this.store = this.createStore();

    this.connection = connectToParent({
      ...options,
      methods: {
        ...this.methods,
        updateState: (newState: Partial<StoreState<T>>) => {
          this.store?.setState(newState);
        },
      },
    });

    return this.connection.promise;
  }

  // 连接子应用（在父应用中调用）
  async connectToChild(options: ConnectToChildOptions) {
    this.store = this.createStore();

    this.connection = connectToChild({
      ...options,
      methods: {
        ...this.methods,
        updateState: (newState: Partial<StoreState<T>>) => {
          this.store?.setState(newState);
        },
      },
    });

    return this.connection.promise;
  }

  // 同步状态到另一端
  private syncState(newState: Partial<StoreState<T>>) {
    console.log("newState", newState);
    if (!this.connection) return;

    this.connection.promise
      .then((api) => {
        console.log("api", api);
        if ("updateState" in api) {
          (api as any).updateState(newState);
        }
      })
      .catch((error) => {
        console.error("Failed to sync state:", error);
      });
  }

  // 获取 store
  getStore() {
    return this.store;
  }
}
