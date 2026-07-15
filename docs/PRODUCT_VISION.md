# PRODUCT VISION

## 1. Visión del producto

El proyecto nace como una invitación digital de casamiento para Marcela y Jorge y evoluciona hacia un espacio emocional y colaborativo llamado **Centro de Recuerdos**.

La idea central es sostener un único enlace antes, durante y después de la celebración. Primero cumple el rol de invitación elegante, clara y accesible. Luego, sin cambiar de dirección ni de identidad, se transforma en una cápsula viva donde los invitados y los novios conservan fotos, videos, mensajes y momentos del evento.

El producto no debe sentirse como una red social. Debe sentirse como una memoria compartida del casamiento: íntima, ordenada, emotiva y simple de usar.

---

## 2. Principio rector

El flujo principal obligatorio del producto es el siguiente:

1. El usuario entra al enlace de la invitación.
2. Se muestra un popup inicial de bienvenida con dos opciones visibles: `Entrar como invitado` y `Entrar como administrador`.
3. Para pruebas y desarrollo, existe un rol de `Superadministrador` oculto o restringido, pensado para cerrar sesión, cambiar de invitado, simular distintos usuarios y probar permisos.
4. Si entra como invitado, ingresa su nombre y, cuando corresponda, el código del evento.
5. El sistema guarda su identidad en el dispositivo y crea automáticamente su álbum personal.
6. Luego aparece un mensaje de bienvenida: `Hola, [Nombre] ❤️`, con posibilidad de cerrarlo.
7. Al cerrar el mensaje, se muestra el Home del Centro de Recuerdos.
8. Desde el Home, el usuario navega entre las cuatro secciones principales.
9. Desde cualquier sección, siempre puede volver atrás hasta regresar al Home.

Este flujo es la referencia principal para toda la experiencia del producto.

---

## 3. Objetivos

- Mantener una invitación digital elegante y emocional como punto de entrada.
- Convertir el mismo enlace en un Centro de Recuerdos después de la celebración.
- Permitir participación simple, sin cuentas tradicionales, email ni contraseña.
- Ofrecer una experiencia clara para invitados, administradores y pruebas internas.
- Preservar la velocidad, la estabilidad y la compatibilidad con Netlify.
- Garantizar que el uso desde celular sea la prioridad de diseño.
- Reunir fotos, videos y mensajes en una sola cápsula del evento.
- Evitar complejidad innecesaria y cualquier deriva hacia una red social generalista.

---

## 4. Público objetivo

### Invitados

Personas que reciben el enlace del evento y acceden principalmente desde el celular.

Su experiencia debe permitir:

- Identificarse con su nombre.
- Ingresar el código del evento cuando se solicite.
- Recibir su álbum personal automáticamente.
- Ver álbumes de otros invitados.
- Subir contenido propio.
- Comentar y dar likes según permisos.
- Participar del muro de mensajes y de la presentación.

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

## 5. Home del Centro de Recuerdos

Luego del mensaje de bienvenida, el Home concentra la navegación principal del producto.

Debe mostrar cuatro tarjetas principales:

- `Álbumes de Invitados`
- `Álbum Oficial`
- `Muro de Comentarios y Saludos`
- `Presentación`

El Home actúa como centro de navegación y no como una página secundaria aislada. Desde allí el usuario entra a cada sección y puede volver siempre al punto de partida.

---

## 6. Flujo de invitado

El flujo del invitado debe ser directo y sin fricción.

1. Entra al enlace.
2. Ve el popup inicial.
3. Elige `Entrar como invitado`.
4. Ingresa su nombre y el código del evento si corresponde.
5. El sistema lo recuerda en el dispositivo.
6. Se crea su álbum personal de forma automática.
7. Se muestra el saludo `Hola, [Nombre] ❤️`.
8. Al cerrar el saludo, accede al Home.
9. Navega por las secciones del Centro de Recuerdos.

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

## 7. Álbumes de invitados

Los álbumes de invitados son el corazón colaborativo del Centro de Recuerdos.

Cada invitado tiene un álbum personal asociado a su identidad en el dispositivo.

Reglas principales:

- El álbum personal existe desde que el invitado se identifica.
- Si está vacío, solo lo ve el dueño.
- Al subir la primera foto, el álbum se vuelve visible para todos los invitados.
- En el álbum propio, el usuario puede subir contenido, editarlo, eliminarlo, comentar y reaccionar.
- En álbumes ajenos, cualquier usuario autorizado puede mirar, comentar y dar likes, pero no modificar contenido.

Esta lógica debe conservar orden, privacidad mínima y pertenencia emocional sobre cada recuerdo.

---

## 8. Álbum oficial

El Álbum Oficial pertenece exclusivamente a los novios o administradores.

Debe funcionar como la colección curada del evento:

- Solo el administrador puede subir contenido.
- Solo el administrador puede editar.
- Solo el administrador puede eliminar.
- Solo el administrador puede reorganizar el material.

Este espacio representa la mirada oficial del casamiento y debe mantenerse diferenciado del aporte de los invitados.

---

## 9. Muro de comentarios y saludos

El muro funciona como un libro de mensajes tipo Padlet.

Su objetivo es permitir que los invitados dejen saludos, recuerdos y mensajes breves en un espacio común y emocional.

Reglas principales:

- Los invitados pueden publicar mensajes.
- Los administradores pueden moderarlos.
- La experiencia debe ser simple, visual y cercana.
- El muro no debe evolucionar hacia una red social generalista.

---

## 10. Presentación

La Presentación es una experiencia inmersiva para revivir el evento.

Debe:

- Mostrar fotos aleatorias de todas las subidas.
- Usar la música disponible en la biblioteca existente.
- Ejecutarse en pantalla completa.
- Avanzar con transición automática.

La Presentación debe funcionar como una pieza emocional del Centro de Recuerdos, no como un visor técnico de archivos.

---

## 11. Reglas de experiencia

La experiencia general del producto debe cumplir con estas reglas:

- Mantener estética elegante y coherente con la invitación.
- Priorizar móvil.
- Evitar pasos innecesarios.
- Mostrar cargas y progreso de forma clara.
- Confirmar acciones destructivas.
- Ofrecer navegación consistente para volver al Home desde cualquier sección.
- Preservar el sentimiento de cápsula de recuerdos.
- Evitar sumar funciones que se parezcan a una red social tradicional.

---

## 12. Objetivos técnicos

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

## 13. Seguridad y permisos

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

## 14. Alcance de la versión 1

La versión 1 debe consolidar el flujo principal del Centro de Recuerdos:

- Entrada por el mismo enlace de la invitación.
- Popup de bienvenida con acceso de invitado y administrador.
- Soporte interno restringido para superadministración.
- Creación automática del álbum personal del invitado.
- Home con cuatro tarjetas principales.
- Álbumes de invitados con visibilidad progresiva.
- Álbum oficial administrado solo por novios o administradores.
- Muro de comentarios y saludos.
- Presentación a pantalla completa con música existente.

La V1 no debe abrir el camino a una red social compleja. Su foco es conservar recuerdos del casamiento con una experiencia limpia, íntima y colaborativa.
