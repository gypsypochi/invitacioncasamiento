# PRODUCT VISION

## 1. Visión del producto

El proyecto comienza como una invitación digital de casamiento para Marcela y Jorge, diseñada para compartir información clave del evento de manera simple, elegante y accesible desde cualquier dispositivo.

La visión del producto es evolucionar esa invitación inicial hacia una plataforma de recuerdos del evento, manteniendo el mismo enlace publicado. De esta forma, la web no finaliza su utilidad el día del casamiento: se transforma progresivamente en un espacio vivo donde los invitados y los novios pueden conservar, organizar y revivir los momentos más importantes de la celebración.

El objetivo principal es reunir todos los recuerdos del casamiento en un único lugar: fotos, videos, comentarios, álbumes personales, álbum oficial, favoritos y experiencias de visualización pensadas para disfrutar después del evento.

La plataforma debe mantener la simpleza de una invitación digital, pero sumar capacidades colaborativas y administrativas sin perder claridad, velocidad ni facilidad de uso.

---

## 2. Objetivos

- Brindar una experiencia simple para los invitados, sin registros tradicionales ni pasos innecesarios.
- Ofrecer una experiencia premium para los novios, permitiendo conservar y administrar los recuerdos del evento.
- Mantener una web rápida, liviana y fácil de acceder desde el enlace original.
- Ser compatible con Netlify como plataforma de publicación del frontend.
- Utilizar Firebase como backend para persistencia, almacenamiento y seguridad.
- Priorizar el uso desde celular, considerando que la mayoría de los invitados accederá desde dispositivos móviles.
- Centralizar los recuerdos del casamiento en una única experiencia digital.
- Permitir colaboración de invitados sin comprometer la seguridad ni la administración del contenido.
- Facilitar la visualización posterior del evento mediante álbumes, favoritos y modo presentación.
- Preservar la estética emocional y elegante de la invitación original.

---

## 3. Público objetivo

### Invitados

Personas que reciben el enlace de la invitación y acceden desde celular, tablet o computadora para consultar información del evento y, luego del casamiento, participar en el Centro de Recuerdos.

Los invitados deben poder interactuar de manera sencilla, sin crear cuentas, sin email y sin contraseña. Su experiencia debe enfocarse en ver recuerdos, subir contenido propio, comentar, dar likes y acceder a álbumes de otros invitados.

### Novios / Administradores

Marcela y Jorge son los administradores principales del producto. Necesitan una experiencia de administración clara, segura y accesible, sin tener que abandonar la página pública ni utilizar herramientas técnicas.

Los administradores deben poder gestionar contenido, corregir nombres, eliminar publicaciones, descargar fotos y mantener ordenado el Centro de Recuerdos.

---

## 4. Flujo del invitado

El flujo del invitado debe ser directo, natural y optimizado para celular.

1. El invitado ingresa al sitio mediante el enlace publicado.
2. Visualiza la invitación digital con la información principal del casamiento.
3. Después del evento, el mismo enlace permite acceder al Centro de Recuerdos.
4. Para participar, el invitado ingresa su nombre.
5. Luego ingresa el código del evento.
6. El sistema recuerda el dispositivo para evitar pedir nuevamente los datos en cada visita.
7. Al validar el acceso, se crea automáticamente un álbum personal asociado a ese invitado.
8. El álbum personal permanece oculto mientras no tenga contenido.
9. Cuando el invitado sube fotos o video, su álbum aparece dentro de los álbumes de invitados.

El invitado puede subir:

- Múltiples fotos.
- Un único video.

El invitado puede realizar las siguientes acciones:

- Comentar contenido.
- Dar likes.
- Editar su nombre.
- Eliminar únicamente su propio contenido.
- Visualizar álbumes de otros invitados.
- Ver el álbum oficial.
- Acceder al muro general.
- Marcar o consultar favoritos, según el alcance definido para la versión correspondiente.

El invitado no puede:

- Modificar contenido ajeno.
- Eliminar contenido de otros usuarios.
- Editar nombres de otros invitados.
- Acceder a funciones administrativas.
- Descargar contenido masivo si esa función está reservada al administrador.

---

## 5. Flujo del administrador

El administrador accede desde la misma página pública, sin cambiar de sitio ni entrar a una aplicación separada.

1. El administrador ingresa el código administrador.
2. El sistema valida el código.
3. Sin cambiar de página, aparecen automáticamente las funciones administrativas disponibles.
4. La interfaz pública se mantiene, pero se habilitan controles adicionales para gestión de contenido.

El administrador puede:

- Subir álbum oficial.
- Eliminar cualquier foto.
- Eliminar videos.
- Eliminar comentarios.
- Editar nombres.
- Descargar todas las fotos.
- Descargar álbumes.
- Administrar contenido.
- Revisar y ordenar el material publicado.
- Corregir errores de carga o identificación de invitados.
- Mantener visible únicamente el contenido apropiado para el Centro de Recuerdos.

Las funciones administrativas deben integrarse de forma discreta, clara y segura, evitando alterar la experiencia normal de los invitados.

---

## 6. Centro de Recuerdos

El Centro de Recuerdos reemplaza el concepto tradicional de "galería".

No se trata solo de mostrar imágenes, sino de construir un espacio emocional y colaborativo donde el evento pueda revivirse después del casamiento.

Debe incluir las siguientes áreas principales:

### 📸 Álbumes de invitados

Espacio donde se agrupan automáticamente los álbumes personales creados por cada invitado. Cada álbum representa la mirada de una persona o grupo sobre el evento.

### 👰 Álbum oficial

Álbum administrado por los novios. Contiene fotos seleccionadas, material destacado o imágenes oficiales del casamiento.

### 💬 Muro general

Espacio común para comentarios, mensajes, saludos o interacciones generales relacionadas con el evento.

### ▶ Modo presentación

Experiencia visual pensada para recorrer fotos y recuerdos en pantalla completa, ideal para revivir el evento de forma continua y emocional.

### ❤️ Favoritos

Selección de contenido destacado o marcado como favorito, permitiendo recuperar rápidamente los recuerdos más importantes o más valorados.

---

## 7. Álbumes

Cada invitado posee automáticamente un álbum propio una vez que accede correctamente al Centro de Recuerdos.

El álbum se crea asociado al nombre ingresado y al identificador único del dispositivo. No requiere cuenta, email ni contraseña.

Reglas principales de los álbumes:

- Cada invitado tiene un álbum personal.
- Todos los invitados pueden ver los álbumes con contenido.
- Solo el dueño del álbum puede modificar su propio contenido.
- El administrador puede modificar o eliminar contenido de cualquier álbum.
- Si un álbum queda vacío, vuelve a ocultarse automáticamente.
- Los álbumes vacíos no deben mostrarse en el listado público.
- El álbum sirve como agrupador natural de fotos y video de cada invitado.

Este modelo permite una experiencia colaborativa simple, manteniendo orden y pertenencia sobre el contenido publicado.

---

## 8. Seguridad

La seguridad del producto debe equilibrar simpleza de uso y control suficiente para proteger el contenido del evento.

El sistema no utiliza cuentas tradicionales. No requiere email, contraseña ni registro formal.

Elementos principales de seguridad:

### Código del evento

Código compartido con los invitados para permitir el acceso al Centro de Recuerdos y evitar participación completamente pública.

### Código administrador

Código reservado para los novios o administradores. Habilita funciones administrativas dentro de la misma página, sin cambiar de aplicación.

### Identificador único por dispositivo

Identificador persistido en el dispositivo del invitado para recordar su acceso, asociar su álbum personal y permitir que gestione únicamente su propio contenido.

### Firebase Security Rules

Las reglas de seguridad de Firebase deben proteger el acceso a datos y archivos, diferenciando claramente entre invitado, dueño de contenido y administrador.

Principios de seguridad:

- Sin cuentas tradicionales.
- Sin email.
- Sin contraseña.
- Acceso de invitados mediante código del evento.
- Administración mediante código administrador.
- Control de permisos por propietario del contenido.
- Validación de lectura, escritura y eliminación mediante Firebase Security Rules.
- Protección especial sobre fotos, videos, comentarios y funciones administrativas.

---

## 9. Experiencia de usuario

La experiencia de usuario debe ser clara, emocional, rápida y principalmente móvil.

Requisitos de experiencia:

- Indicador de carga para operaciones que requieran espera.
- Subidas múltiples de fotos.
- Límite de un video por invitado.
- Visualización en pantalla completa.
- Búsqueda de álbumes.
- Diseño responsive.
- Optimización para celular.
- Interacciones simples y comprensibles.
- Mensajes de error claros.
- Confirmaciones para acciones destructivas.
- Navegación fluida entre invitación, álbumes, muro y modo presentación.
- Persistencia del acceso para evitar fricción en visitas posteriores.

La plataforma debe sentirse cercana y elegante, evitando interfaces complejas o excesivamente técnicas.

---

## 10. Tecnologías

Tecnologías definidas para el producto:

- HTML.
- CSS.
- JavaScript.
- Firebase.
- Firestore.
- Storage.
- Netlify.
- Git.
- GitHub.

Estas tecnologías permiten mantener una base simple para el frontend, publicar la aplicación como sitio estático y sumar capacidades de backend mediante servicios administrados.

---

## 11. Roadmap versión 1

La versión 1 se organiza en dos grandes etapas consecutivas, estructuradas a través de Sprints individuales para garantizar que no se mezcle el desarrollo del frontend con el del backend.

### Primera Etapa: Frontend Completo (Sin Firebase)

Esta etapa se enfoca en construir, pulir y validar toda la interfaz de usuario, navegación, estética y flujos visuales antes de incorporar servicios dinámicos.

#### Sprint 0: Infraestructura y Configuración
- **Estado:** Completado
- **Objetivo:** Preparar la base del entorno, repositorios y control de versiones.
- **Descripción:** Configuración inicial del repositorio, flujo de trabajo de desarrollo, entorno local de trabajo y redacción de la documentación base del sistema.
- **Lista de Issues:**
  - **Issue 0.1:** Creación del repositorio Git e inicialización del proyecto con la estructura de directorios y archivos base.
  - **Issue 0.2:** Configuración de la integración continua y el despliegue automático del frontend del sitio en la plataforma Netlify.
  - **Issue 0.3:** Redacción y estructuración de la documentación técnica y de arquitectura del proyecto (`docs/PRODUCT_VISION.md`, `docs/DEVELOPMENT_RULES.md`, `docs/ARCHITECTURE.md`).
  - **Issue 0.4:** Configuración inicial del entorno para Gemini CLI y creación del archivo de control del agente autónomo (`AGENTS.md`).
- **Criterio de finalización:** Repositorio en GitHub configurado, Netlify desplegando correctamente en cada cambio y documentación base cargada en la carpeta `docs/`.

#### Sprint 1: Base Técnica y Estructura
- **Estado:** Completado
- **Objetivo:** Centralizar configuraciones y preparar las estructuras base del frontend.
- **Descripción:** Preparación de scripts para Firebase en formato estático condicional, maquetación base de modales y desarrollo preliminar de la persistencia de sesión a nivel de navegador.
- **Lista de Issues:**
  - **Issue 1.1:** Crear el archivo de configuración centralizada `firebase-config.js` y preparar la carga condicional estática de scripts de Firebase.
  - **Issue 1.2:** Crear la maquetación HTML base y estilos iniciales de los modales para el ingreso de nombres, validaciones y alertas en `index.html`.
  - **Issue 1.3:** Programar en JS la lógica para persistir en `localStorage` el nombre e identificador simulado del dispositivo del invitado al iniciar sesión de forma local.
  - **Issue 1.4:** Maquetar la estructura y contenedores preliminares de la vista de "Centro de Recuerdos" (sección preview) integrada en el flujo principal del sitio.
- **Criterio de finalización:** Modales y contenedores base maquetados, carga condicional de scripts de Firebase lista, y datos locales de sesión simulada persistiendo correctamente en el navegador.

#### Sprint 2: Pulido Frontend y UX
- **Estado:** Completado
- **Objetivo:** Mejorar y refinar la experiencia visual sin agregar backend ni bases de datos dinámicas.
- **Descripción:** Reemplazo de emojis, adición de transiciones estéticas, aplicación rigurosa de la paleta oficial y optimización del reproductor musical.
- **Lista de Issues:**
  - **Issue 2.1:** Reemplazar todos los emojis de texto de la interfaz pública por iconos consistentes de una librería de iconografía (como Font Awesome o SVG dedicados).
  - **Issue 2.2:** Programar animaciones de entrada suaves y transiciones visuales para revelar elegantemente la sección "Centro de Recuerdos".
  - **Issue 2.3:** Aplicar la alternancia cromática crema/violeta oficial del diseño original en todas las tarjetas, botones y fondos del Centro de Recuerdos.
  - **Issue 2.4:** Diseñar y refinar las tarjetas individuales de recuerdos (fotos y videos) en el frontend agregando sombras suaves, bordes redondeados y efectos hover.
  - **Issue 2.5:** Mostrar de manera dinámica el nombre personalizado del invitado en el encabezado del Centro de Recuerdos tras su validación (ej. "Hola, Mica ❤️").
  - **Issue 2.6:** Diseñar la interfaz del reproductor musical integrado para que soporte una lista de reproducción, agregando controles finos y sutiles.
  - **Issue 2.7:** Ajustar y optimizar con CSS todas las nuevas secciones para asegurar un comportamiento responsive perfecto en smartphones bajo enfoque Mobile-First.
- **Criterio de finalización:** Interfaz libre de emojis con iconos consistentes, estilo crema/violeta validado, saludo personalizado dinámico visible en la cabecera y visualización móvil fluida y elegante.

#### Sprint 3: Frontend - Álbumes
- **Estado:** Pendiente
- **Objetivo:** Construir la interfaz completa para la gestión visual de álbumes.
- **Descripción:** Maquetación completa y simulación interactiva local de álbumes de invitados, álbum oficial de los novios, álbum personal y estados vacíos.
- **Lista de Issues:**
  - **Issue 3.1:** Diseñar y maquetar la sección de visualización de los "Álbumes de Invitados", organizándolos en una cuadrícula de portadas con nombres.
  - **Issue 3.2:** Diseñar e implementar la interfaz del "Álbum Personal" del invitado, integrando visualmente los botones de subida multimedia y la lista de sus fotos/videos locales.
  - **Issue 3.3:** Maquetar la galería dedicada para el "Álbum Oficial" administrado por los novios, utilizando un diseño de cuadrícula o carrusel elegante.
  - **Issue 3.4:** Diseñar y maquetar los "Estados Vacíos" (empty states) con gráficos o tipografía elegante para álbumes o secciones que aún no tengan contenido.
  - **Issue 3.5:** Desarrollar un sistema de notificaciones/alertas elegantes en pantalla (toasts flotantes) para informar al usuario sobre éxitos o errores al simular interacciones.
- **Criterio de finalización:** Secciones de álbumes de invitados, álbum oficial y álbum personal maquetados con datos de prueba, estados vacíos visualmente atractivos y sistema de toasts completamente funcional a nivel local.

#### Sprint 4: Frontend - Panel Administrador
- **Estado:** Pendiente
- **Objetivo:** Construir toda la interfaz visual y controles para el rol de administrador.
- **Descripción:** Flujo de ingreso de contraseña administrativa y controles visuales integrados de forma discreta para la moderación del contenido.
- **Lista de Issues:**
  - **Issue 4.1:** Diseñar y maquetar el modal de ingreso de código de administrador y su proceso de validación simulado por frontend.
  - **Issue 4.2:** Desarrollar la lógica en JS para alternar dinámicamente la UI a "modo administrador", revelando los controles especiales de forma fluida.
  - **Issue 4.3:** Integrar botones de eliminación (por ejemplo, iconos de papelera discretos) sobre las fotos, videos y comentarios en las vistas públicas al estar en modo administrador.
  - **Issue 4.4:** Añadir campos de texto interactivos in-line para que el administrador pueda editar de forma simulada los nombres de los álbumes o invitados.
  - **Issue 4.5:** Diseñar e integrar el botón y control visual para la descarga masiva de fotos o álbumes en el panel del administrador.
- **Criterio de finalización:** Modal de código administrativo funcional en local, revelando correctamente controles discretos de borrado, edición de nombres y descarga interactivos sobre los elementos correspondientes.

#### Sprint 5: Frontend - Presentación y Experiencia
- **Estado:** Pendiente
- **Objetivo:** Diseñar la experiencia visual interactiva de recuerdos del Centro de Recuerdos.
- **Descripción:** Desarrollo del visualizador de fotos a pantalla completa (modo presentación), sistema de favoritos interactivo y fluidez de navegación general.
- **Lista de Issues:**
  - **Issue 5.1:** Programar el "Modo Presentación" interactivo a pantalla completa para que permita recorrer de forma secuencial fotos con controles de play/pausa/avance.
  - **Issue 5.2:** Implementar la interfaz visual de marcación de "Favoritos" en las fotos/videos mediante un botón interactivo en forma de corazón que alterne su estado.
  - **Issue 5.3:** Aplicar transiciones y micro-interacciones suaves de CSS para la navegación continua entre las diferentes vistas (invitación, álbumes, muro, favoritos).
- **Criterio de finalización:** Modo presentación a pantalla completa operativo con controles interactivos, botón de favoritos con cambio de estado visual y navegación general fluida sin saltos abruptos.

---

### Segunda Etapa: Integración con Firebase y Backend

Una vez validada la experiencia de usuario (UX) y el frontend en su totalidad, se inicia la conexión e integración con la infraestructura de Firebase.

#### Sprint 6: Firebase y Configuración
- **Estado:** Pendiente
- **Objetivo:** Conexión y configuración definitiva de los servicios de Firebase.
- **Descripción:** Importación de librerías, inicialización de clientes de Firestore y Storage en base a la configuración y documentación del esquema de datos.
- **Lista de Issues:**
  - **Issue 6.1:** Importar las dependencias reales del SDK de Firebase (Firestore y Storage) en la estructura del frontend sustituyendo la carga simulada.
  - **Issue 6.2:** Inicializar los servicios de Firestore y Firebase Storage utilizando la configuración real alojada en `firebase-config.js`.
  - **Issue 6.3:** Crear y documentar formalmente en el proyecto los esquemas lógicos de colecciones de base de datos (`invitados`, `albumes`, `recuerdos`, `comentarios`).
- **Criterio de finalización:** Consola del navegador libre de errores de inicialización y cliente de Firebase conectado exitosamente a la base de datos Firestore y Storage del proyecto.

#### Sprint 7: Autenticación e Identificación
- **Estado:** Pendiente
- **Objetivo:** Implementar la validación de acceso mediante código de invitado y persistencia de dispositivo.
- **Descripción:** Validación real de códigos contra Firestore, generación de UUID de dispositivo persistente y vinculación de identidades.
- **Lista de Issues:**
  - **Issue 7.1:** Desarrollar la consulta real a Firestore para verificar la validez del código de acceso de invitado ingresado en el modal.
  - **Issue 7.2:** Implementar la generación y guardado seguro de un identificador único persistente (`UUID`) en el almacenamiento local del dispositivo del invitado.
  - **Issue 7.3:** Almacenar el registro de vinculación entre el nombre del invitado y el UUID del dispositivo en la colección correspondiente de Firestore para persistir su sesión real.
- **Criterio de finalización:** Validación de código conectada a Firestore, permitiendo el ingreso únicamente con códigos autorizados y recordando permanentemente el dispositivo del invitado.

#### Sprint 8: Storage e Infraestructura Multimedia
- **Estado:** Pendiente
- **Objetivo:** Configurar el almacenamiento en Firebase Storage y las reglas básicas de acceso.
- **Descripción:** Estructuración del almacenamiento en la nube, establecimiento de reglas de seguridad de Storage y optimización de flujos de carga multimedia.
- **Lista de Issues:**
  - **Issue 8.1:** Configurar la arquitectura de rutas y carpetas dentro de Firebase Storage para organizar correctamente el contenido oficial y de invitados.
  - **Issue 8.2:** Escribir y subir las Firebase Security Rules para Storage, garantizando que solo los clientes validados con UUID activo puedan realizar subidas.
  - **Issue 8.3:** Implementar funciones en JavaScript para la preparación, dimensionamiento y preprocesamiento de archivos de imagen/video en el cliente previo a su transmisión.
- **Criterio de finalización:** Reglas de Firebase Storage aplicadas en consola de Firebase, carpetas organizadas y funciones de procesamiento listas y probadas.

#### Sprint 9: Gestión y Subida de Fotos
- **Estado:** Pendiente
- **Objetivo:** Implementar la subida múltiple de fotos y la persistencia de metadatos.
- **Descripción:** Subida real de fotos a Firebase Storage, creación de registros asociados en Firestore y renderizado de álbumes desde la base de datos.
- **Lista de Issues:**
  - **Issue 9.1:** Conectar el control de subida múltiple con Firebase Storage para enviar los archivos de imagen reales de forma asíncrona, actualizando barras de progreso en la UI.
  - **Issue 9.2:** Implementar el registro en Firestore de los metadatos de las fotos subidas exitosamente (URL de Storage, marca de tiempo, UUID del dueño).
  - **Issue 9.3:** Conectar la galería de "Álbumes de Invitados" con Firestore para listar dinámicamente y en tiempo real los álbumes con fotos activas.
  - **Issue 9.4:** Programar el borrado real de fotos en Firestore y Storage, validando que el UUID del dispositivo que solicita el borrado coincida con el dueño de la foto.
- **Criterio de finalización:** Subida de múltiples fotos real a Storage con registro de metadatos en Firestore, carga dinámica de la galería desde la base de datos y funcionalidad de borrado propio validada.

#### Sprint 10: Comentarios y Likes
- **Estado:** Pendiente
- **Objetivo:** Habilitar interactividad social en el Centro de Recuerdos.
- **Descripción:** Conexión del muro de comentarios, interactividad de likes sobre fotos/videos en tiempo real y prevención de abuso de interacciones.
- **Lista de Issues:**
  - **Issue 10.1:** Conectar el formulario de comentarios del muro con Firestore para almacenar y renderizar en orden cronológico los saludos de los invitados.
  - **Issue 10.2:** Desarrollar el sistema de "Likes" interactivos, almacenando y actualizando el recuento de reacciones asociadas a cada archivo multimedia en Firestore.
  - **Issue 10.3:** Implementar oyentes de cambios en tiempo real (`onSnapshot`) para que las nuevas fotos, comentarios y likes se actualicen inmediatamente en pantalla sin recargar la página.
  - **Issue 10.4:** Implementar validación local y en Firestore para limitar la cantidad de likes permitidos por dispositivo (UUID) sobre un mismo recuerdo.
- **Criterio de finalización:** Muro de comentarios y contador de likes operando de manera síncrona en tiempo real con Firestore para todos los visitantes conectados concurrentemente.

#### Sprint 11: Administrador Real y Permisos
- **Estado:** Pendiente
- **Objetivo:** Conectar las funciones de administración y aplicar reglas de seguridad restrictivas.
- **Descripción:** Conexión de privilegios contra Firestore, moderación física de contenidos, descarga masiva de archivos y despliegue de Firebase Security Rules finales.
- **Lista de Issues:**
  - **Issue 11.1:** Conectar el ingreso de código de administrador con una consulta de validación real en un documento de Firestore protegido.
  - **Issue 11.2:** Implementar las operaciones de moderación del administrador en Firestore y Storage, permitiendo eliminar de forma real cualquier foto, video o comentario.
  - **Issue 11.3:** Programar la capacidad para que el administrador pueda sobrescribir y corregir los nombres de invitados en sus registros de Firestore.
  - **Issue 11.4:** Desarrollar el script del administrador para empaquetar y descargar masivamente todo el contenido de fotos cargado en Storage en un solo lote.
  - **Issue 11.5:** Diseñar, auditar y desplegar las Firebase Security Rules definitivas para Firestore, bloqueando cualquier escritura a usuarios que no sean administradores o dueños legítimos del contenido.
- **Criterio de finalización:** Flujo administrativo conectado con borrado real en Firestore y Storage, descarga de contenido multimedia operativa y Firebase Security Rules auditadas y de alta seguridad aplicadas.

#### Sprint 12: Optimización, Performance y Deploy Final
- **Estado:** Pendiente
- **Objetivo:** Pruebas de rendimiento, compresión de activos, validación final responsive y despliegue definitivo.
- **Descripción:** Optimización automatizada de imágenes del lado del cliente, lazy loading de galería, auditoría multidispositivo y deploy definitivo de producción.
- **Lista de Issues:**
  - **Issue 12.1:** Implementar compresión automática de imágenes utilizando librerías nativas en JS de forma previa a la subida a Storage, limitando la resolución máxima y el peso.
  - **Issue 12.2:** Configurar carga diferida (lazy loading) para todas las fotos en la galería del Centro de Recuerdos para optimizar el rendimiento y el consumo de datos móviles.
  - **Issue 12.3:** Realizar auditoría de rendimiento en dispositivos reales (Android, iOS) y solucionar cualquier retraso o bug visual detectado en el renderizado responsive móvil.
  - **Issue 12.4:** Validar la compilación estática final, realizar el deploy definitivo en Netlify de producción y verificar el correcto funcionamiento del dominio personalizado y SSL.
- **Criterio de finalización:** Aplicación optimizada de carga ultra-rápida en conexiones móviles, compresión del lado del cliente funcional, libre de errores de performance y desplegada de forma estable en el enlace de producción de Netlify.

---

## 12. Funcionalidades futuras (No implementar)

Las siguientes funcionalidades quedan fuera de la versión 1. No deben implementarse inicialmente, pero forman parte de la visión futura del producto.

- Estadísticas básicas.
- Playlist configurable, con hasta 4 canciones para el modo presentación.
- Presentación automática con música.
- Descarga inteligente.
- Compresión automática.
- PWA.
- Búsqueda avanzada.

Estas ideas deberán evaluarse luego de validar la versión 1, priorizando siempre la estabilidad, la experiencia móvil y la conservación segura de los recuerdos del evento.
