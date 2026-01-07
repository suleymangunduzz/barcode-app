import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function App() {
  useEffect(() => {
    window.api.getItems().then((items) => {
      console.log("ITEMS FROM DB:", items);
    });

    window.api.getCategories().then((categories) => {
      console.log("CATEGORIES FROM DB:", categories);
    });
  }, []);

  const { t, i18n } = useTranslation();

  console.log("Current language:", i18n.language);

  return (
    <div className="h-[300px] flex items-center justify-center bg-slate-900">
      <h1 className="text-4xl font-bold text-red-100">Barcode System</h1>
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <h1 className="text-white text-4xl font-bold">Tailwind is WORKING</h1>
        <div className="bg-red-500">test</div>
        <h1>{t("text")}</h1>
      </div>
    </div>
  );
}

export default App;
