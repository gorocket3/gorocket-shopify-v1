import { createRoot } from "react-dom/client";
import { initStorage } from "./utils/hooks";
import { initI18n } from "./utils/i18nUtils";
import App from "./App";

initI18n().then(() => {
    initStorage();

    const root = createRoot(document.getElementById("app"));
    root.render(<App/>);
});
