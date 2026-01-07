import { useEffect } from "react";

function App() {
  useEffect(() => {
    window.api.getItems().then((items) => {
      console.log("ITEMS FROM DB:", items);
    });

    window.api.getCategories().then((categories) => {
      console.log("CATEGORIES FROM DB:", categories);
    });
  }, []);

  return (
    <div className="h-[300px] flex items-center justify-center bg-slate-900">
      <h1 className="text-4xl font-bold text-red-100">Barcode System</h1>
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <h1 className="text-white text-4xl font-bold">Tailwind is WORKING</h1>
        <div className="bg-red-500">test</div>
      </div>
    </div>
  );
}

export default App;
