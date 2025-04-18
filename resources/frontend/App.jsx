import { useTranslation } from "react-i18next";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { NavMenu } from "@shopify/app-bridge-react";
import PolarisProvider from "./components/providers/PolarisProvider";
import HomePage from "./pages";
import HistoryPage from "./pages/history";
import PlanPage from "./pages/plan";
import ProductsPage from "./pages/products";

const queryClient = new QueryClient();

export default function App() {
    const { t } = useTranslation();

    return (
        <PolarisProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <NavMenu>
                        <Link to="/" rel="home"/>
                        <Link to="/products">{t("NavigationMenu.products")}</Link>
                        <Link to="/history">{t("NavigationMenu.history")}</Link>
                        <Link to="/plan">{t("NavigationMenu.plan")}</Link>
                    </NavMenu>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/products" element={<ProductsPage/>}/>
                        <Route path="/plan" element={<PlanPage/>}/>
                        <Route path="/history" element={<HistoryPage/>}/>
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </PolarisProvider>
    )
}
