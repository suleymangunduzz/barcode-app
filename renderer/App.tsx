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

  return <h1>Barcode System</h1>;
}

export default App;
