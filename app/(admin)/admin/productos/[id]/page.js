import ProductoForm from "@/_pages/admin/Contenido/productos/nuevo_editar/producto-form";
import { use } from "react";
export const metadata = {
  title: "Editar producto | Admin M Importaciones",
  robots: { index: false, follow: false },
};

export default function EditarProductoPage({ params }) {
  const { id } = use(params);
  return <ProductoForm id={id} />;
}