# PRODUCT VISION

## 1. Visión del producto

El proyecto nace como una invitación digital de casamiento para Marcela y Jorge y evoluciona hacia un espacio emocional y colaborativo llamado **Centro de Recuerdos**.

La experiencia debe sostener un único enlace de entrada y una invitación principal con scroll continuo. La invitación conserva toda su estética original y funciona como puerta de entrada hacia una página independiente del Centro de Recuerdos, sin convertir el sitio en una aplicación genérica.

El producto no debe sentirse como una red social. Debe sentirse como una cápsula compartida de recuerdos del casamiento: íntima, ordenada, elegante y simple de usar.

---

## 2. Flujo rector

El flujo principal obligatorio es el siguiente:

1. El usuario entra al enlace de la invitación.
2. Se muestra el popup inicial con dos opciones visibles: `Entrar como invitado` y `Entrar como administrador`.
3. Para pruebas y desarrollo existe un rol de `Superadministrador` oculto o restringido, pensado para cerrar sesión, cambiar de usuario, simular distintos usuarios y probar permisos.
4. Si entra como invitado, ingresa su nombre y, cuando corresponda, el código del evento.
5. El sistema guarda su identidad en el dispositivo y crea automáticamente su álbum personal.
6. Luego aparece el saludo `Hola, [Nombre] ❤️`, con posibilidad de cerrarlo.
7. Al cerrar ese mensaje, el usuario continúa recorriendo la misma página.
8. El Centro de Recuerdos se abre como una página independiente desde las tarjetas de la invitación.
9. Desde el Centro de Recuerdos se puede volver a la invitación principal sin perder la sesión.

Este flujo es la referencia principal para toda la experiencia del producto.

---

## 3. Orden de la invitación

La invitación debe mantenerse como una sola experiencia vertical con este orden funcional:

1. Portada con reproductor.
2. Contador.
3. Centro de Recuerdos.
4. Lugar y horario.
5. Dress Code.
6. Confirmación de asistencia.
7. Mesa de regalos.
8. Playlist de Spotify.
9. Footer.

No se deben eliminar, mover ni reemplazar las secciones existentes. El Centro de Recuerdos se agrega como una sección natural del recorrido y respeta la continuidad visual del sitio.

---

## 4. Objetivos

- Mantener la invitación digital como punto de entrada emocional.
- Integrar el Centro de Recuerdos dentro del mismo recorrido.
- Permitir participación simple, sin cuentas tradicionales, email ni contraseña.
- Ofrecer una experiencia clara para invitados, administradores y pruebas internas.
- Preservar la velocidad, la estabilidad y la compatibilidad con Netlify.
- Garantizar que el uso desde celular sea la prioridad de diseño.
- Reunir fotos, videos y mensajes en una sola cápsula del evento.
- Evitar complejidad innecesaria y cualquier deriva hacia una red social generalista.

---

## 5. Público objetivo

### Invitados

Personas que reciben el enlace del evento y acceden principalmente desde el celular.

Su experiencia debe permitir:

- Identificarse con su nombre.
- Ingresar el código del evento cuando se solicite.
- Recibir su álbum personal automáticamente.
- Ver álbumes de otros invitados.
- Subir contenido propio.
- Comentar y dar likes según permisos.
- Participar del Muro de Comentarios y Saludos y de la Presentación.

### Administradores

Marcela y Jorge, o quien ellos autoricen, administran el contenido del evento.

Su experiencia debe permitir:

- Acceder al álbum oficial.
- Moderar contenido y mensajes.
- Corregir nombres cuando sea necesario.
- Organizar y mantener ordenado el Centro de Recuerdos.
- Resolver incidencias sin abandonar la misma página.

### Superadministrador de pruebas

Rol interno, oculto o restringido, destinado a desarrollo y validación.

Su propósito es:

- Cerrar sesión.
- Cambiar de invitado.
- Simular usuarios distintos.
- Probar permisos y restricciones.
- Verificar escenarios límite sin afectar la experiencia pública.

Este rol no forma parte del recorrido normal del usuario final.

---

## 6. Centro de Recuerdos

El Centro de Recuerdos se abre como una página propia, pero conserva la identidad visual, emocional y colaborativa del proyecto.

Debe mostrar cuatro tarjetas principales:

- `Fotos de los Invitados`
- `Fotos Profesionales`
- `Muro de Comentarios y Saludos`
- `Presentación`

La página debe respetar la estética actual, la alternancia de colores, las tipografías, los espaciados, las animaciones y el comportamiento responsive del resto del proyecto.

No debe sentirse como una aplicación ajena a la invitación; debe sentirse como su continuación natural.

---

## 7. Flujo del invitado

El flujo del invitado debe ser directo y sin fricción.

1. Entra al enlace.
2. Ve el popup inicial.
3. Elige `Entrar como invitado`.
4. Ingresa su nombre y el código del evento cuando corresponda.
5. El sistema lo recuerda en el dispositivo.
6. Se crea su álbum personal de forma automática.
7. Se muestra el saludo `Hola, [Nombre] ❤️`.
8. Al cerrar el saludo, continúa recorriendo la misma invitación.
9. Llega al acceso al Centro de Recuerdos desde la invitación y entra en su página independiente.

Reglas del invitado:

- Puede ver su propio álbum aunque esté vacío.
- Ese álbum vacío solo lo ve él.
- Cuando sube la primera foto, su álbum pasa a mostrarse públicamente.
- Puede subir hasta 20 fotos por carga.
- Puede subir 1 video por álbum, con un máximo de 100 MB.
- Puede editar y eliminar su propio contenido.
- Puede comentar y dar likes sobre su propio contenido.
- Puede ver, comentar y dar likes en álbumes de otros invitados, pero no editarlos ni borrarlos.

---

## 8. Fotos de los Invitados

Las Fotos de los Invitados son el corazón colaborativo del Centro de Recuerdos.

Cada invitado tiene un álbum personal asociado a su identidad en el dispositivo.

Reglas principales:

- El álbum personal existe desde que el invitado se identifica.
- Si está vacío, solo lo ve el dueño.
- Al subir la primera foto, el álbum se vuelve visible para todos los invitados.
- En el álbum propio, el usuario puede subir contenido, editarlo, eliminarlo, comentar y reaccionar.
- En álbumes ajenos, cualquier usuario autorizado puede mirar, comentar y dar likes, pero no modificar contenido.

Esta lógica debe conservar orden, privacidad mínima y pertenencia emocional sobre cada recuerdo.

---

## 9. Álbum oficial

El Álbum Oficial pertenece exclusivamente a los novios o administradores.

Debe funcionar como la colección curada del evento:

- Solo el administrador puede subir contenido.
- Solo el administrador puede editar.
- Solo el administrador puede eliminar.
- Solo el administrador puede reorganizar el material.

Este espacio representa la mirada oficial del casamiento y debe mantenerse diferenciado del aporte de los invitados.

---

## 10. Muro de Comentarios y Saludos

El Muro de Comentarios y Saludos funciona como un muro tipo Padlet.

Su objetivo es permitir que los invitados dejen saludos, recuerdos y mensajes breves en un espacio común y emocional.

Reglas principales:

- Los invitados pueden publicar mensajes.
- Los administradores pueden moderarlos.
- La experiencia debe ser simple, visual y cercana.
- El muro no debe evolucionar hacia una red social generalista.

---

## 11. Presentación

La Presentación es una experiencia inmersiva para revivir el evento.

Debe:

- Mostrar fotos aleatorias de todas las subidas.
- Usar la música disponible en la biblioteca existente.
- Ejecutarse en pantalla completa.
- Avanzar con transición automática.

La Presentación debe funcionar como una pieza emocional del Centro de Recuerdos, no como un visor técnico de archivos.

---

## 12. Reglas de experiencia

La experiencia general del producto debe cumplir con estas reglas:

- Mantener estética elegante y coherente con la invitación.
- Priorizar móvil.
- Evitar pasos innecesarios.
- Mostrar cargas y progreso de forma clara.
- Confirmar acciones destructivas.
- Ofrecer navegación consistente para volver al recorrido principal desde cualquier sección.
- Preservar el sentimiento de cápsula de recuerdos.
- Evitar sumar funciones que se parezcan a una red social tradicional.

---

## 13. Objetivos técnicos

La implementación debe sostenerse sobre tecnologías simples y estables:

- HTML.
- CSS Vanilla.
- JavaScript Vanilla.
- Firebase.
- Firestore.
- Storage.
- Netlify.

El proyecto debe seguir siendo liviano, estático en el frontend y compatible con despliegue simple.

---

## 14. Seguridad y permisos

El acceso y los permisos se sostienen sobre tres ideas:

- Invitado identificado por nombre, código del evento y dispositivo.
- Administrador con permisos de moderación y curaduría.
- Superadministrador restringido para pruebas y soporte interno.

Firebase Security Rules deben diferenciar claramente entre:

- Contenido propio.
- Contenido ajeno.
- Contenido oficial.
- Acciones administrativas.

No deben existir cuentas tradicionales ni contraseñas para invitados.

---

## 15. Alcance de la versión 1

La versión 1 debe consolidar la invitación digital con su Centro de Recuerdos integrado:

- Entrada por el mismo enlace.
- Popup de bienvenida con acceso de invitado y administrador.
- Soporte interno restringido para superadministración.
- Creación automática del álbum personal del invitado.
- Saludo personalizado `Hola, [Nombre] ❤️`.
- Acceso al Centro de Recuerdos desde la invitación principal.
- Fotos de los Invitados con visibilidad progresiva.
- Fotos Profesionales administradas solo por novios o administradores.
- Muro de Comentarios y Saludos.
- Presentación con música existente.

La V1 no debe abrir el camino a una red social compleja. Su foco es conservar recuerdos del casamiento con una experiencia limpia, íntima y colaborativa.

---

## 16. Roadmap

### Sprint 3

Estado: finalizado.

Alcance completado:

- Flujo de acceso con popup inicial.
- Persistencia de identidad del invitado en el dispositivo.
- Mensaje `Hola, [Nombre] ❤️` con posibilidad de cerrarlo.
- Centro de Recuerdos separado en `centro-recuerdos.html`.
- Cuatro tarjetas principales del Centro de Recuerdos.
- Navegación completa hacia `Fotos de los Invitados`, `Fotos Profesionales`, `Muro de Comentarios y Saludos` y `Presentación`.
- Estructura navegable del frontend para cada una de esas secciones.
- Base visual de `Mi Álbum` dentro de `Fotos de los Invitados`.
- Base visual del `Álbum Oficial` con modo invitado y modo administrador.
- Base visual del `Muro de Comentarios y Saludos`.
- Base visual de la `Presentación` con transición automática.

### Sprint 4

Estado: pendiente.

Alcance previsto:

- Separación del Centro de Recuerdos en `centro-recuerdos.html`.
- Migración de la navegación desde la invitación hacia la nueva página.
- Flujo funcional de subida de fotos y video por invitado.
- Lógica de visibilidad del álbum personal vacío y publicado.
- Comentarios, likes y moderación básica.
- Álbum oficial con permisos de administración.
- Persistencia real en Firebase.
- Reglas de seguridad por rol y propiedad.
- Sincronización entre dispositivos.
