# ARCHITECTURE

## 1. Objetivo

Este documento describe la arquitectura general del proyecto y establece los lineamientos técnicos que deben respetarse durante su evolución.

La aplicación continuará siendo una aplicación web desarrollada con:

- HTML.
- CSS.
- JavaScript Vanilla.

El frontend será hospedado en Netlify, manteniendo una publicación simple, rápida y compatible con sitios estáticos.

Firebase será utilizado como Backend as a Service para resolver persistencia, almacenamiento de archivos y reglas de seguridad, sin incorporar frameworks frontend ni modificar la filosofía técnica definida para el proyecto.

La arquitectura debe acompañar la evolución desde una invitación digital de casamiento hacia un Centro de Recuerdos del evento, manteniendo el mismo enlace publicado antes y después del casamiento.

---

## 2. Arquitectura general

La arquitectura se organiza en capas simples y claramente separadas.

### Frontend

El frontend es la capa visible para invitados y administradores. Se construye con HTML, CSS y JavaScript Vanilla.

Responsabilidades principales:

- Mostrar la invitación digital.
- Presentar el Centro de Recuerdos después del evento.
- Gestionar interacciones de usuario.
- Validar flujos básicos de experiencia.
- Conectarse con Firebase para leer y escribir datos.
- Mantener una experiencia rápida, responsive y optimizada para celular.

### Firebase

Firebase actúa como Backend as a Service del producto.

Responsabilidades principales:

- Proveer servicios administrados para persistencia y almacenamiento.
- Centralizar el acceso a datos dinámicos.
- Aplicar reglas de seguridad mediante Firebase Security Rules.
- Permitir que el producto evolucione sin construir un backend propio tradicional.

### Firestore

Firestore es la base de datos principal para información estructurada.

Responsabilidades principales:

- Guardar datos del evento.
- Guardar invitados identificados por dispositivo.
- Guardar álbumes.
- Guardar metadatos de fotos y videos.
- Guardar comentarios.
- Guardar likes.
- Guardar configuración funcional del producto.
- Diferenciar contenido público, contenido propio y contenido administrativo.

### Storage

Firebase Storage es la capa destinada a archivos multimedia.

Responsabilidades principales:

- Almacenar fotos subidas por invitados.
- Almacenar el video permitido por invitado.
- Almacenar fotos del álbum oficial.
- Permitir que los metadatos de Firestore referencien archivos almacenados.
- Respetar permisos de lectura, escritura y eliminación definidos por rol.

### Servicios externos

El proyecto puede seguir integrándose con servicios externos cuando aporten valor y no contradigan la arquitectura definida.

Servicios externos actuales o esperados:

- Netlify para hosting del frontend.
- Google Maps para ubicación del evento.
- Google Calendar para agendar el evento.
- Spotify para experiencia musical externa cuando aplique.
- Google Forms si se mantiene algún flujo externo de confirmación durante la transición.

---

## 3. Arquitectura funcional

La arquitectura funcional se compone de módulos conceptuales. Estos módulos no implican necesariamente carpetas o archivos actuales; representan responsabilidades que deben mantenerse separadas al evolucionar el producto.

### Invitación

Módulo responsable de presentar la información inicial del casamiento.

Responsabilidades:

- Mostrar nombres, fecha y datos principales del evento.
- Mostrar ubicación, dress code, confirmación de asistencia, regalos y música sugerida.
- Mantener el valor emocional y visual de la invitación original.
- Servir como punto de entrada antes del evento.

### Centro de Recuerdos

Módulo principal de la etapa posterior al evento.

Responsabilidades:

- Reemplazar el concepto tradicional de galería.
- Agrupar recuerdos del evento en una experiencia colaborativa.
- Mostrar álbumes de invitados, álbum oficial, muro general, favoritos y modo presentación.
- Mantener la navegación simple desde el mismo enlace publicado.

### Álbumes

Módulo responsable de organizar contenido por invitado.

Responsabilidades:

- Crear un álbum personal para cada invitado validado.
- Mantener ocultos los álbumes vacíos.
- Mostrar álbumes con contenido a todos los invitados autorizados.
- Permitir edición únicamente al dueño del álbum y al administrador.

### Álbum oficial

Módulo administrado por los novios.

Responsabilidades:

- Contener fotos seleccionadas o material destacado.
- Diferenciar el contenido oficial del contenido subido por invitados.
- Permitir administración exclusiva por parte del rol administrador.

### Comentarios

Módulo responsable de interacciones escritas.

Responsabilidades:

- Permitir comentarios sobre contenido o espacios definidos del Centro de Recuerdos.
- Asociar cada comentario a un invitado o administrador.
- Permitir eliminación por autor cuando corresponda.
- Permitir eliminación por administrador.

### Likes

Módulo responsable de reacciones simples.

Responsabilidades:

- Permitir que invitados indiquen contenido favorito o valorado.
- Asociar cada like a un invitado o identificador de dispositivo.
- Evitar interacciones duplicadas cuando aplique.
- Alimentar la experiencia de favoritos definida en la visión del producto.

### Reproductor de música

Módulo responsable de la experiencia sonora.

Responsabilidades:

- Mantener una reproducción controlada por el usuario.
- Respetar restricciones de autoplay de navegadores.
- Integrarse con la experiencia visual sin bloquear la navegación.
- Evolucionar de forma compatible con el modo presentación cuando corresponda dentro del roadmap oficial.

### Administración

Módulo que habilita funciones administrativas sin cambiar de página.

Responsabilidades:

- Validar el código administrador.
- Mostrar controles administrativos solo cuando corresponda.
- Permitir eliminar fotos, videos y comentarios.
- Permitir editar nombres.
- Permitir subir el álbum oficial.
- Permitir descargar fotos y álbumes.
- Mantener separación clara entre experiencia de invitado y capacidades administrativas.

### Firebase

Módulo conceptual de integración con servicios backend.

Responsabilidades:

- Centralizar lectura y escritura de datos.
- Centralizar subida y referencia de archivos.
- Respetar Firebase Security Rules.
- Evitar que la lógica de permisos dependa únicamente del frontend.

---

## 4. Modelo de datos

El modelo de datos debe entenderse de forma conceptual. Su objetivo es representar las entidades principales del producto y sus relaciones, sin definir una implementación específica.

### Evento

Representa el casamiento o evento principal.

Relaciones:

- Tiene una configuración asociada.
- Tiene invitados.
- Tiene álbumes.
- Tiene un álbum oficial.
- Tiene comentarios y contenido vinculado.

### Invitado

Representa a una persona que accede al Centro de Recuerdos mediante nombre, código del evento e identificador de dispositivo.

Relaciones:

- Pertenece a un evento.
- Tiene un identificador único por dispositivo.
- Tiene un álbum personal.
- Puede crear fotos, un video, comentarios y likes.
- Puede editar su propio nombre según las reglas del producto.

### Álbum

Representa una agrupación de contenido multimedia.

Relaciones:

- Pertenece a un evento.
- Puede pertenecer a un invitado o ser el álbum oficial.
- Contiene fotos.
- Puede contener un video si es álbum de invitado.
- Se oculta automáticamente si no tiene contenido.

### Foto

Representa una imagen subida al Centro de Recuerdos.

Relaciones:

- Pertenece a un álbum.
- Pertenece a un evento.
- Tiene un propietario cuando fue subida por un invitado.
- Puede recibir comentarios y likes.
- Puede ser eliminada por su dueño o por el administrador.

### Video

Representa el video permitido para un invitado.

Relaciones:

- Pertenece a un álbum de invitado.
- Pertenece a un evento.
- Tiene un propietario.
- Puede ser eliminado por su dueño o por el administrador.
- Está limitado a un único video por invitado.

### Comentario

Representa una interacción escrita dentro del Centro de Recuerdos.

Relaciones:

- Pertenece a un evento.
- Puede estar asociado a una foto, video, álbum o muro general según el diseño funcional.
- Tiene un autor.
- Puede ser eliminado por su autor o por el administrador.

### Like

Representa una reacción o marca de favorito.

Relaciones:

- Pertenece a un evento.
- Está asociado a una foto, video u otro contenido habilitado.
- Tiene un autor o identificador de dispositivo.
- Puede alimentar la sección de favoritos.

### Configuración

Representa parámetros funcionales y de experiencia del evento.

Relaciones:

- Pertenece a un evento.
- Define códigos, textos, estados de secciones, límites y comportamientos configurables.
- Debe ser administrada únicamente por el rol autorizado.

### Administrador

Representa a los novios o personas autorizadas para gestionar el contenido.

Relaciones:

- Tiene permisos administrativos sobre el evento.
- Puede administrar álbumes, fotos, videos, comentarios y nombres.
- Puede descargar contenido.
- Accede mediante código administrador, sin cuentas tradicionales.

---

## 5. Seguridad

La seguridad debe mantener la simplicidad del producto sin exponer contenido ni permisos de administración de forma incorrecta.

### Código de invitados

El código de invitados permite acceder al Centro de Recuerdos. Su función es evitar que cualquier persona externa al evento pueda participar libremente.

Permite:

- Validar acceso inicial al Centro de Recuerdos.
- Asociar el dispositivo a un invitado.
- Habilitar lectura de contenido autorizado.
- Habilitar escritura de contenido propio.

### Código administrador

El código administrador habilita funciones administrativas dentro de la misma página.

Permite:

- Activar controles administrativos.
- Gestionar contenido de cualquier invitado.
- Subir y administrar el álbum oficial.
- Descargar fotos y álbumes.
- Eliminar contenido inapropiado o incorrecto.

### Identificador único por dispositivo

El identificador único por dispositivo permite reconocer a un invitado sin cuentas tradicionales.

Permite:

- Recordar el acceso del invitado.
- Asociar contenido a un dispositivo.
- Determinar propiedad sobre álbumes, fotos, videos, comentarios y likes.
- Evitar pedir datos repetidamente en cada visita.

### Firebase Security Rules

Firebase Security Rules deben ser la fuente de validación de permisos sobre Firestore y Storage.

Principios:

- El frontend no debe ser la única barrera de seguridad.
- Las reglas deben diferenciar invitado, propietario de contenido y administrador.
- Las reglas deben proteger lectura, escritura y eliminación.
- Las reglas deben impedir que un invitado modifique contenido ajeno.
- Las reglas deben permitir administración global únicamente al rol administrador.

### Permisos por rol

#### Invitado autorizado

Puede leer:

- Información pública del evento.
- Álbumes visibles con contenido.
- Álbum oficial.
- Muro general.
- Comentarios y likes visibles.

Puede escribir:

- Su propio nombre.
- Sus propias fotos.
- Su único video permitido.
- Sus propios comentarios.
- Sus propios likes.

Puede eliminar:

- Sus propias fotos.
- Su propio video.
- Sus propios comentarios.
- Sus propios likes cuando aplique.

No puede:

- Modificar contenido ajeno.
- Eliminar contenido ajeno.
- Editar nombres de otros invitados.
- Acceder a funciones administrativas.

#### Administrador

Puede leer:

- Todo el contenido del evento.
- Álbumes visibles y ocultos.
- Fotos, videos, comentarios y likes.
- Configuración del evento.

Puede escribir:

- Contenido del álbum oficial.
- Configuración permitida del evento.
- Correcciones de nombres.
- Ajustes administrativos sobre contenido.

Puede eliminar:

- Cualquier foto.
- Cualquier video.
- Cualquier comentario.
- Contenido del álbum oficial.
- Contenido incorrecto, duplicado o inapropiado.

---

## 6. Flujo de funcionamiento

### Antes del evento

Antes del casamiento, el enlace funciona principalmente como invitación digital.

El usuario puede:

- Ver la información del evento.
- Consultar ubicación.
- Revisar dress code.
- Confirmar asistencia si el flujo está disponible.
- Agendar el evento.
- Acceder a música sugerida si corresponde.

La prioridad en esta etapa es comunicar información clara, cargar rápido y funcionar correctamente en celular.

### Después del evento

Después del casamiento, el mismo enlace evoluciona hacia el Centro de Recuerdos.

El usuario puede:

- Acceder al Centro de Recuerdos.
- Identificarse con nombre y código del evento.
- Subir fotos.
- Subir un único video.
- Ver álbumes de invitados.
- Ver el álbum oficial.
- Comentar.
- Dar likes.
- Explorar favoritos y modo presentación según el alcance de la V1.

### Invitado

El invitado ingresa al sitio, accede al Centro de Recuerdos, carga su nombre y el código del evento. El sistema recuerda su dispositivo y crea su álbum personal. El álbum permanece oculto hasta tener contenido.

Una vez dentro, puede gestionar únicamente su propio contenido y visualizar el contenido visible de otros invitados.

### Administrador

El administrador ingresa el código administrador desde la misma página. Al validarse el acceso, aparecen funciones administrativas sin cambiar de sitio.

Desde allí puede administrar contenido, corregir nombres, eliminar fotos, videos y comentarios, subir el álbum oficial y descargar material del evento.

---

## 7. Organización futura del proyecto

La estructura futura debe favorecer separación de responsabilidades y crecimiento progresivo, sin mover archivos actuales hasta que una tarea específica lo autorice.

Estructura objetivo conceptual:

- `assets/`: recursos estáticos del proyecto, como imágenes, audio y otros archivos multimedia propios.
- `css/`: hojas de estilo organizadas por base, componentes o secciones cuando el tamaño del proyecto lo justifique.
- `js/`: scripts JavaScript Vanilla organizados por módulos funcionales.
- `docs/`: documentación funcional, técnica, arquitectónica y de desarrollo.

Posibles agrupaciones futuras dentro de `js/`:

- Invitación.
- Centro de Recuerdos.
- Álbumes.
- Comentarios.
- Likes.
- Música.
- Administración.
- Integración Firebase.
- Utilidades compartidas.

Reglas para esta evolución:

- No mover archivos actuales sin autorización explícita.
- No cambiar nombres de archivos sin autorización explícita.
- No introducir estructuras complejas antes de necesitarlas.
- Mantener compatibilidad con Netlify.
- Mantener HTML, CSS y JavaScript Vanilla como base del proyecto.

---

## 8. Decisiones de arquitectura (ADR)

### HTML, CSS y JavaScript Vanilla

Se elige mantener HTML, CSS y JavaScript Vanilla para preservar simplicidad, velocidad, bajo costo de mantenimiento y compatibilidad con hosting estático.

Esta decisión evita incorporar complejidad innecesaria y respeta la filosofía definida para el proyecto.

### Netlify

Se elige Netlify como plataforma de hosting porque permite publicar una aplicación web estática de forma simple, rápida y compatible con el enfoque del proyecto.

Netlify permite mantener el frontend separado del backend administrado por Firebase.

### Firebase

Se elige Firebase como Backend as a Service para resolver persistencia, almacenamiento y seguridad sin construir un backend propio tradicional.

Firebase permite agregar capacidades dinámicas al Centro de Recuerdos manteniendo una arquitectura liviana para el frontend.

### Sin cuentas tradicionales

Se decide no utilizar cuentas tradicionales para reducir fricción en invitados.

El producto no requiere email ni contraseña. El acceso se basa en código del evento, código administrador e identificador único por dispositivo.

### Álbum por invitado

Se decide crear un álbum por invitado para organizar naturalmente el contenido colaborativo.

Este enfoque permite que cada invitado tenga propiedad sobre su propio contenido, mientras el administrador conserva control global.

### Centro de Recuerdos en lugar de galería

Se decide utilizar el concepto de Centro de Recuerdos porque el producto no busca ser solo una galería de imágenes.

El Centro de Recuerdos integra álbumes, contenido oficial, comentarios, likes, favoritos y modo presentación en una experiencia emocional posterior al evento.

### Un único enlace antes y después del casamiento

Se decide mantener un único enlace para simplificar la comunicación con invitados y conservar continuidad entre invitación y recuerdos.

Antes del evento, el enlace funciona como invitación digital. Después del evento, evoluciona hacia el Centro de Recuerdos.

---

## 9. Escalabilidad

La arquitectura permite reutilizar el proyecto para futuros eventos porque separa conceptualmente el evento, la configuración, los invitados, los álbumes y el contenido.

El diseño no debe depender exclusivamente de datos hardcodeados de un único casamiento. La información del evento debe poder representarse como configuración, permitiendo adaptar textos, fechas, álbumes y permisos a nuevos contextos.

El uso de HTML, CSS y JavaScript Vanilla mantiene el frontend simple y transportable. Netlify permite publicar nuevas instancias o evolucionar la misma aplicación con bajo esfuerzo operativo. Firebase permite almacenar datos por evento y aplicar permisos mediante reglas centralizadas.

El modelo de álbum por invitado también facilita reutilización, porque la lógica de participación se mantiene estable aunque cambien los nombres, fechas, textos o recursos visuales del evento.

La escalabilidad del producto debe entenderse como capacidad de reutilización funcional y operativa, no como incorporación prematura de complejidad técnica.

---

## 10. Alcance de la versión 1

La versión 1 tiene como objetivo principal convertir la invitación digital en un Centro de Recuerdos del evento, manteniendo el mismo enlace publicado y una experiencia simple para invitados y administradores.

Funcionalidades pertenecientes a la V1:

- Consolidar la invitación actual como base del producto.
- Preparar la experiencia para evolucionar hacia el Centro de Recuerdos.
- Permitir acceso mediante nombre, código del evento y persistencia del dispositivo.
- Crear álbumes personales para invitados.
- Permitir múltiples fotos por invitado.
- Permitir un único video por invitado.
- Permitir que el invitado gestione únicamente su propio contenido.
- Habilitar administración mediante código administrador desde la misma página.
- Permitir gestión administrativa de fotos, videos, comentarios y nombres.
- Permitir descarga de fotos y álbumes desde administración.
- Incorporar álbum oficial.
- Incorporar muro general.
- Incorporar favoritos.
- Incorporar modo presentación.

La V1 no debe extender el roadmap ni incorporar funcionalidades fuera de la visión funcional ya definida.
