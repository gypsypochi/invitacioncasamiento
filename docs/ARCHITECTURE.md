# ARCHITECTURE

## 1. Objetivo

La aplicacion sigue siendo una web estatica construida con HTML, CSS Vanilla y JavaScript Vanilla.
Netlify hospeda el frontend y Firebase actua como backend administrado para persistencia, almacenamiento y reglas de seguridad.

La arquitectura sostiene una experiencia unica: una invitacion digital que funciona como puerta de entrada y un Centro de Recuerdos separado en `centro-recuerdos.html`, sin pedir identificacion en la invitacion principal.

---

## 2. Arquitectura general

### Frontend

El frontend muestra la invitacion, mantiene el scroll principal y dirige al usuario hacia el Centro de Recuerdos.

Responsabilidades:

- Mostrar la invitacion digital.
- Mantener la estetica emocional del sitio.
- No pedir identificacion en la invitacion principal.
- Actuar como puerta de entrada visual al Centro de Recuerdos.
- Permitir navegacion hacia la pagina independiente del Centro de Recuerdos.

### Firebase

Firebase sostiene la capa dinamica del producto.

Responsabilidades:

- Persistir datos estructurados.
- Almacenar archivos multimedia.
- Aplicar reglas de acceso por rol y propiedad.
- Mantener la separacion entre contenido publico, propio y administrativo.

### Firestore

Firestore almacena la informacion estructurada.

Responsabilidades:

- Datos del evento.
- Identidad de invitados.
- Albumes personales y oficiales.
- Comentarios y saludos.
- Likes y reacciones.
- Estado de visibilidad de albumes.
- Configuracion de permisos y comportamiento.

### Storage

Firebase Storage almacena los archivos multimedia.

Responsabilidades:

- Fotos de invitados.
- Video permitido por invitado.
- Material del album oficial.
- Archivos usados por la presentacion.

---

## 3. Modulos funcionales

### Invitacion

Modulo de entrada publica.

Responsabilidades:

- Presentar la informacion inicial del casamiento.
- Conservar la estetica emocional de la invitacion.
- Servir como recorrido principal de una sola pagina.
- No solicitar identificacion.

### Acceso

Modulo encargado del popup inicial y la seleccion de rol dentro de `centro-recuerdos.html`.

Responsabilidades:

- Mostrar `Entrar como invitado`.
- Mostrar `Entrar como administrador`.
- Mantener un acceso restringido para `Superadministrador` destinado a pruebas.
- Validar nombre y codigo del evento cuando corresponda.
- Persistir la identidad del invitado en el dispositivo.

### Centro de Recuerdos

Pagina independiente accesible desde la invitacion.

Responsabilidades:

- Mostrar cuatro tarjetas principales.
- Llevar al usuario a cada subseccion.
- Mantener continuidad visual con el resto del proyecto.

### Fotos de los Invitados

Modulo colaborativo principal.

Responsabilidades:

- Crear un album personal por invitado.
- Mostrar albumes con contenido al publico autorizado.
- Mantener ocultos los albumes vacios salvo para su dueno.
- Permitir subir, editar, eliminar, comentar y dar likes sobre contenido propio.
- Permitir ver, comentar y dar likes sobre albumes ajenos sin modificar contenido.

### Album oficial

Modulo administrado por los novios.

Responsabilidades:

- Alojar contenido curado del evento.
- Permitir alta, edicion, borrado y reorganizacion solo al administrador.

### Muro de Comentarios y Saludos

Modulo de mensajes tipo Padlet.

Responsabilidades:

- Permitir saludos y mensajes breves.
- Permitir moderacion por administradores.
- Mantener una lectura simple y afectiva.

### Presentacion

Modulo visual inmersivo.

Responsabilidades:

- Mostrar fotos aleatorias de todas las subidas.
- Reproducir musica disponible en la biblioteca existente.
- Ejecutarse en pantalla completa.
- Avanzar automaticamente con transiciones.

---

## 4. Reglas de navegacion

La navegacion debe respetar estas propiedades:

- Desde la invitacion se ingresa al Centro de Recuerdos desde una ilustracion de acceso.
- Desde el popup inicial de `centro-recuerdos.html` se ingresa al rol elegido.
- Desde el saludo de bienvenida se continua recorriendo el Centro de Recuerdos.
- Desde cualquier subseccion se puede volver al recorrido principal o a la invitacion.

Esto debe mantenerse como una constante arquitectonica.

---

## 5. Reglas de visibilidad

La visibilidad del contenido sigue estas reglas:

- El album personal vacio solo lo ve el dueno.
- Al subir la primera foto, el album se vuelve visible para otros invitados.
- En albumes ajenos, solo se permite lectura e interaccion no destructiva.
- El album oficial solo se modifica desde el rol administrador.
- El superadministrador restringido se usa solo para pruebas y no para el recorrido publico.

---

## 6. Seguridad

La seguridad del sistema debe sostenerse sobre permisos claros.

### Invitado

Puede:

- Ver contenido permitido.
- Subir contenido propio.
- Editar y eliminar su propio contenido.
- Comentar y dar likes dentro de los permisos definidos.

No puede:

- Modificar contenido ajeno.
- Reorganizar el album oficial.
- Acceder a controles administrativos.

### Administrador

Puede:

- Administrar el album oficial.
- Moderar el libro de mensajes.
- Eliminar contenido incorrecto.
- Corregir nombres cuando corresponda.

### Superadministrador restringido

Puede:

- Cambiar de usuario.
- Cerrar sesion.
- Simular escenarios de prueba.
- Validar permisos y estados.

No forma parte de la experiencia publica.

### Firebase Security Rules

Las reglas deben proteger:

- Lectura.
- Escritura.
- Eliminacion.
- Visibilidad de albumes vacios.
- Privilegios del administrador.
- Restricciones del superadministrador de pruebas.

---

## 7. Organizacion futura

La estructura futura del proyecto debe mantenerse simple.

Areas conceptuales:

- Invitacion.
- Acceso.
- Centro de Recuerdos.
- Fotos de los Invitados.
- Fotos Profesionales.
- Muro de Comentarios y Saludos.
- Presentacion.
- Administracion.
- Integracion Firebase.
- Utilidades compartidas.

Reglas:

- No mover archivos sin autorizacion.
- No introducir frameworks.
- No sobredimensionar la arquitectura.
- Mantener el enfoque mobile first.

---

## 8. Alcance de la version 1

La V1 debe consolidar:

- La invitacion como entrada.
- El popup inicial con dos roles visibles dentro de `centro-recuerdos.html`.
- El superadministrador restringido para pruebas.
- El saludo personalizado.
- El Centro de Recuerdos separado en su propia pagina y accesible desde la invitacion.
- Las fotos de los invitados con visibilidad progresiva.
- Las fotos profesionales administradas por novios.
- El muro de comentarios y saludos tipo Padlet.
- La presentacion con musica existente.

El objetivo no es construir una red social. El objetivo es preservar y revivir recuerdos del casamiento dentro de una experiencia unica, sensible y ordenada.
