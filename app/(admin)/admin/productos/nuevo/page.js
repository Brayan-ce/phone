import ProductoForm from "@/_pages/admin/Contenido/productos/nuevo_editar/producto-form";

export const metadata = {
  title: "Nuevo producto | Admin M Importaciones",
  robots: { index: false, follow: false },
};

export default function NuevoProductoPage() {
  return <ProductoForm />;
}