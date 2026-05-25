import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ConfigPage from "./pages/ConfigPage";
import MenusPage from "./pages/MenusPage";
import MenuDetailPage from "./pages/MenuDetailPage";
import ExplorePage from "./pages/ExplorePage";
import FavoritesPage from "./pages/FavoritesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ConfigPage />} />
        <Route path="/menus" element={<MenusPage />} />
        <Route path="/menus/:id" element={<MenuDetailPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
