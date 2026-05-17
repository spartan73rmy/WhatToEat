import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ConfigPage from "./pages/ConfigPage";
import MenusPage from "./pages/MenusPage";
import MenuDetailPage from "./pages/MenuDetailPage";
import ExplorePage from "./pages/ExplorePage";
import FavoritesPage from "./pages/FavoritesPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ConfigPage />} />
        <Route path="/menus" element={<MenusPage />} />
        <Route path="/menus/:id" element={<MenuDetailPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
