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

La versión 1 debe organizarse en cinco grandes fases, sin perder de vista que el producto debe evolucionar sobre el mismo enlace publicado.

### Fase 1: Base del producto

Consolidar la invitación actual como punto de partida, ordenar la visión funcional y preparar la experiencia para evolucionar hacia el Centro de Recuerdos.

### Fase 2: Acceso al Centro de Recuerdos

Incorporar el acceso mediante nombre, código del evento y persistencia del dispositivo, manteniendo una experiencia simple para invitados.

### Fase 3: Álbumes de invitados

Permitir que cada invitado tenga un álbum personal, pueda subir múltiples fotos y un único video, y pueda gestionar únicamente su propio contenido.

### Fase 4: Administración

Habilitar funciones administrativas dentro de la misma página mediante código administrador, permitiendo gestionar contenido, corregir nombres y descargar material.

### Fase 5: Experiencia de recuerdos

Completar la experiencia del Centro de Recuerdos con álbum oficial, muro general, favoritos y modo presentación.

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
