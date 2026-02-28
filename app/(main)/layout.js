import { Suspense } from "react";
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Header from "@/_pages/main/layoutmain/Header/header";
import Footer from "@/_pages/main/layoutmain/Footer/footer";

export default function MainLayout({ children }) {
  return (
    <>
      <Suspense>
        <ClienteWrapper>
          <Header />
        </ClienteWrapper>
      </Suspense>
      {children}
      <ClienteWrapper>
        <Footer />
      </ClienteWrapper>
    </>
  );
}