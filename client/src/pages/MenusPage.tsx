import { Plus } from "lucide-react";
import MenuCard from "../components/menus/MenuCard";
import { useMenus } from "../hooks/useMenus";

export default function MenusPage() {
  const { menus, isLoading, deleteMenu } = useMenus();

  const openModal = () => window.dispatchEvent(new CustomEvent("open-create-menu"));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis Menús</h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
        >
          <Plus size={18} />
          Nuevo Menú
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Cargando menús...</div>
      ) : !menus || menus.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">Aún no tienes menús</p>
          <button
            onClick={openModal}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            Crea tu primer menú con IA
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {menus.map((menu: any) => (
            <MenuCard key={menu.id} menu={menu} onDelete={deleteMenu} />
          ))}
        </div>
      )}
    </div>
  );
}
