// app/(main)/layout.jsx
import ClienteWrapper from "@/_EXTRAS/LadoCliente/ClienteWraper";
import Header from "@/_pages/main/layoutmain/Header/header";
import Footer from "@/_pages/main/layoutmain/Footer/footer";
export default function MainLayout({ children }) {
  return (
    <>
      <div>
        <ClienteWrapper>
          <Header></Header>
        </ClienteWrapper>
      </div>
      {children}
      <div>
        <ClienteWrapper>
          <Footer></Footer>
        </ClienteWrapper>
      </div>
    </>
  );
}