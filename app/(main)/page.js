import { Suspense } from "react";
import Contenido from "@/_pages/main/Contenido/contenido";

export default function Page() {
  return (
    <Suspense>
      <Contenido />
    </Suspense>
  );
}