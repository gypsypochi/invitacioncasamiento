# ARCHITECTURE

## 1. Objetivo

Este documento describe la arquitectura funcional y técnica del proyecto.

La aplicación debe seguir siendo una web estática construida con:

- HTML.
- CSS Vanilla.
- JavaScript Vanilla.

Netlify hospeda el frontend.
Firebase actúa como Backend as a Service para persistencia, almacenamiento y reglas de seguridad.

La arquitectura debe sostener una experiencia única: una invitación digital que se transforma en un Centro de Recuerdos sin cambiar el enlace principal.

---

## 2. Arquitectura general

### Frontend

El frontend es la interfaz visible para invitados, administradores y superadministración restringida.

Responsabilidades:

- Mostrar la invitación digital.
- Presentar el popup inicial de acceso.
- Pedir nombre y código del evento cuando corresponda.
- Recordar la identidad del invitado en el dispositivo.
- Mostrar el saludo `Hola, [Nombre] ❤️`.
- Renderizar el Home del Centro de Recuerdos.
- Permitir navegación entre las cuatro secciones principales.
- Mantener la opción de volver atrás hasta el Home desde cualquier sección.

### Firebase

Firebase sostiene la capa dinámica del producto.

Responsabilidades:

- Persistir datos estructurados.
- Almacenar archivos multimedia.
- Aplicar reglas de acceso por rol y propiedad.
- Mantener la separación entre contenido público, propio y administrativo.

### Firestore

Firestore almacena la información estructurada.

Responsabilidades:

- Datos del evento.
- Identidad de invitados.
- Álbumes personales y oficiales.
- Comentarios y saludos.
- Likes y reacciones.
- Estado de visibilidad de álbumes.
- Configuración de permisos y comportamiento.

### Storage

Firebase Storage almacena los archivos multimedia.

Responsabilidades:

- Fotos de invitados.
- Video permitido por invitado.
- Material del álbum oficial.
- Archivos usados por la presentación.

---

## 3. Módulos funcionales

### Invitación

Módulo de entrada pública.

Responsabilidades:

- Presentar la información inicial del casamiento.
- Conservar la estética emocional de la invitación.
- Servir como puerta de acceso al resto del producto.

### Acceso

Módulo encargado del popup inicial y la selección de rol.

Responsabilidades:

- Mostrar `Entrar como invitado`.
- Mostrar `Entrar como administrador`.
- Mantener un acceso restringido para `Superadministrador` destinado a pruebas.
- Validar nombre y código del evento cuando corresponda.
- Persistir la identidad del invitado en el dispositivo.

### Home del Centro de Recuerdos

Centro de navegación principal.

Responsabilidades:

- Mostrar cuatro tarjetas principales.
- Llevar al usuario a cada sección.
- Actuar como punto de regreso universal.

### Álbumes de invitados

Módulo colaborativo principal.

Responsabilidades:

- Crear un álbum personal por invitado.
- Mostrar álbumes con contenido al público autorizado.
- Mantener ocultos los álbumes vacíos salvo para su dueño.
- Permitir subir, editar, eliminar, comentar y dar likes sobre contenido propio.
- Permitir ver, comentar y dar likes sobre álbumes ajenos sin modificar contenido.

### Álbum oficial

Módulo administrado por los novios.

Responsabilidades:

- Alojar contenido curado del evento.
- Permitir alta, edición, borrado y reorganización solo al administrador.

### Muro de comentarios y saludos

Módulo de mensajes tipo Padlet.

Responsabilidades:

- Permitir saludos y mensajes breves.
- Permitir moderación por administradores.
- Mantener una lectura simple y afectiva.

### Presentación

Módulo visual inmersivo.

Responsabilidades:

- Mostrar fotos aleatorias de todas las subidas.
- Reproducir música disponible en la biblioteca existente.
- Ejecutarse en pantalla completa.
- Avanzar automáticamente con transiciones.

---

## 4. Modelo de datos conceptual

### Evento

Representa el casamiento principal.

Relaciones:

- Tiene configuración.
- Tiene invitados.
- Tiene álbumes personales.
- Tiene un álbum oficial.
- Tiene mensajes y reacciones asociadas.

### Invitado

Representa a una persona identificada por nombre, código de evento y dispositivo.

Relaciones:

- Pertenece a un evento.
- Posee un álbum personal.
- Crea fotos, un video, comentarios y likes.
- Puede ser administrado en términos de visibilidad o permisos según la configuración del producto.

### Álbum

Representa una colección de recuerdos multimedia.

Relaciones:

- Pertenece a un invitado o al álbum oficial.
- Puede contener fotos y, en el caso de invitados, un único video.
- Puede estar oculto si no tiene contenido.

### Foto

Representa una imagen subida al Centro de Recuerdos.

Relaciones:

- Pertenece a un álbum.
- Tiene propietario cuando fue subida por un invitado.
- Puede recibir comentarios y likes.
- Puede ser eliminada por su dueño o por el administrador.

### Video

Representa el único video permitido por invitado.

Relaciones:

- Pertenece a un álbum de invitado.
- Tiene un propietario.
- Puede ser eliminado por el dueño o por el administrador.

### Comentario

Representa un mensaje escrito.

Relaciones:

- Pertenece al muro o a un contenido concreto, según el diseño funcional.
- Tiene un autor.
- Puede ser moderado o eliminado por el administrador.

### Like

Representa una reacción simple.

Relaciones:

- Pertenece a un contenido.
- Tiene un autor o un identificador de dispositivo.
- Permite valorar contenido sin convertir el producto en una red social compleja.

### Configuración

Representa parámetros del evento y del comportamiento general.

Relaciones:

- Define códigos.
- Define límites de carga.
- Define visibilidad.
- Define reglas de acceso y permisos.

---

## 5. Reglas de navegación

La navegación debe respetar estas propiedades:

- Desde el popup inicial se ingresa al rol elegido.
- Desde el saludo de bienvenida se accede al Home.
- Desde el Home se entra a cada sección principal.
- Desde cualquier sección se puede volver atrás hasta el Home.

Esto debe mantenerse como una constante arquitectónica.

---

## 6. Reglas de visibilidad

La visibilidad del contenido sigue estas reglas:

- El álbum personal vacío solo lo ve el dueño.
- Al subir la primera foto, el álbum se vuelve visible para otros invitados.
- En álbumes ajenos, solo se permite lectura e interacción no destructiva.
- El álbum oficial solo se modifica desde el rol administrador.
- El superadministrador restringido se usa solo para pruebas y no para el recorrido público.

---

## 7. Seguridad

La seguridad del sistema debe sostenerse sobre permisos claros.

### Invitado

Puede:

- Ver contenido permitido.
- Subir contenido propio.
- Editar y eliminar su propio contenido.
- Comentar y dar likes dentro de los permisos definidos.

No puede:

- Modificar contenido ajeno.
- Reorganizar el álbum oficial.
- Acceder a controles administrativos.

### Administrador

Puede:

- Administrar el álbum oficial.
- Moderar el muro.
- Eliminar contenido incorrecto.
- Corregir nombres cuando corresponda.

### Superadministrador restringido

Puede:

- Cambiar de usuario.
- Cerrar sesión.
- Simular escenarios de prueba.
- Validar permisos y estados.

No forma parte de la experiencia pública.

### Firebase Security Rules

Las reglas deben proteger:

- Lectura.
- Escritura.
- Eliminación.
- Visibilidad de álbumes vacíos.
- Privilegios del administrador.
- Restricciones del superadministrador de pruebas.

---

## 8. Organización futura

La estructura futura del proyecto debe mantenerse simple.

Áreas conceptuales:

- Invitación.
- Acceso.
- Home.
- Álbumes.
- Muro de mensajes.
- Presentación.
- Administración.
- Integración Firebase.
- Utilidades compartidas.

Reglas:

- No mover archivos sin autorización.
- No introducir frameworks.
- No sobredimensionar la arquitectura.
- Mantener el enfoque mobile first.

---

## 9. Alcance de la versión 1

La V1 debe consolidar:

- La invitación como entrada.
- El popup inicial con dos roles visibles.
- El superadministrador restringido para pruebas.
- El saludo personalizado.
- El Home con cuatro secciones.
- Los álbumes de invitados con visibilidad progresiva.
- El álbum oficial administrado por novios.
- El muro de mensajes tipo Padlet.
- La presentación a pantalla completa con música existente.

El objetivo no es construir una red social. El objetivo es preservar y revivir recuerdos del casamiento dentro de una experiencia única, sensible y ordenada.
