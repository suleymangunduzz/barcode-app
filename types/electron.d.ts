export {};

declare global {
  interface Window {
    api: {
      getItems: () => Promise<any[]>;
      getCategories: () => Promise<any[]>;
    };
  }
}
