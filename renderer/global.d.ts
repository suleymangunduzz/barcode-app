export {};

declare global {
  interface Window {
    api: {
      getAllItems: () => Promise<any[]>;
      getAllCategories: () => Promise<any[]>;
    };
  }
}
