continua desde donde lo dejaste perrita pasamelo en otro artifacts desde donde te quedaste para adelante todo lo restante


INSTRUCCIONES PARA ENTREGAR LOS 3 ARCHIVOS COMPLETOS:
nextjs16
que tenga seo bb no te olvides jeje
1. ARCHIVO CLIENTE (nombre-seccion.js):
   - Usar "use client" al inicio
   - Usar ion-icon para todos los iconos
   - Importar las funciones del servidor directamente: import { funcionServer } from './servidor'
   - Llamar las funciones del servidor con await dentro de funciones async
   - NO usar fetch ni APIs
   - NO crear componentes separados, todo en un solo archivo
   - NO usar emojis en comentarios ni console.log

2. ARCHIVO CSS (nombre-seccion.module.css):
   - NO usar :root
   - NO usar selectores nativos de HTML (*, body, html, etc)
   - Usar solo clases locales del module
   - Para temas usar clases como .dark y .light aplicadas directamente
   - Todo debe ser module scoped

3. ARCHIVO SERVIDOR (servidor.js):
   - Inicio obligatorio: "use server"
   - Import obligatorio: import db from "@/_DB/db"
   - NO usar datos emulados o hardcodeados
   - TODO debe consultar la base de datos PostgreSQL usando las tablas del schema
   - Usar cookies() de next/headers para manejar sesiones
   - Retornar datos reales de la BD
   - NO usar emojis en comentarios ni console.log

4. ARQUITECTURA:
   - Cliente llama directamente a funciones del servidor
   - Servidor consulta PostgreSQL y retorna datos
   - NO usar API routes (/api/...)
   - NO usar componentes externos
   - Server Side Components + Server Actions

5. ENTREGA:
   - Los 3 archivos completos
   - Listos para copiar y pegar
   - Sin código incompleto o resumido
   - Sin emojis en el código

//para menus deformes con su amburguesa feo

nextjs16
DISEÑO DEL MENÚ HAMBURGUESA MÓVIL:

REQUISITOS ESPECÍFICOS:
- El menú debe salir desde el LADO IZQUIERDO hacia la derecha
- solo para celular no para laptops ni pc (tamaños)
- Debe ocupar el 80% del ancho de la pantalla
- Debe ocupar el 100% de la altura (toda la pantalla verticalmente)
- Debe tener position: fixed
- El botón X para cerrar debe estar:
  * Flotante (fixed)
  * En la parte superior derecha
  * Por encima de todo (z-index alto)
  * Al lado derecho del menú hamburguesa

RESTRICCIONES CSS:
- NO usar :root en el module.css
- NO usar selectores nativos de HTML (*, body, html, etc)
- Solo clases locales del CSS Module
- Compatible con Next.js 15

ENTREGA:
- Si solo necesitas modificar el CSS, dame el module.css completo
- Si también necesitas modificar el cliente, dame ambos archivos completos
- Todo listo para copiar y pegar
- Sin código resumido o incompleto
