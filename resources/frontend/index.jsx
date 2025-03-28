import { createRoot } from "react-dom/client";
import { initI18n } from "./utils/i18nUtils";
import App from "./App";

initI18n().then(() => {
    const root = createRoot(document.getElementById("app"));
    root.render(<App/>);
});
