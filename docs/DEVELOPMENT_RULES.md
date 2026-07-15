# DEVELOPMENT RULES

## 1. Objetivo

Este documento define cómo debe analizarse, diseñarse, implementarse y validarse cualquier cambio del proyecto.

Su objetivo es proteger la experiencia de la invitación digital, mantener el Centro de Recuerdos integrado al recorrido y evitar cambios grandes, ambiguos o innecesarios.

---

## 2. Filosofía de trabajo

El proyecto debe evolucionar con cambios pequeños e incrementales.

Principios obligatorios:

- Mantener la invitación digital como punto de entrada emocional.
- Tratar el Centro de Recuerdos como una sección integrada de la misma página.
- Priorizar HTML, CSS Vanilla y JavaScript Vanilla.
- Mantener compatibilidad con Netlify.
- Usar Firebase solo como backend administrado.
- Priorizar mobile first en diseño, pruebas y revisión.
- Evitar comportamientos que conviertan el producto en una red social compleja.
- Preservar la continuidad visual y funcional del sitio.

---

## 3. Flujo oficial de trabajo

Todo cambio debe seguir este orden:

1. Analizar el contexto y los archivos involucrados.
2. Identificar el objetivo del cambio en una sola historia de usuario.
3. Explicar el plan técnico antes de modificar archivos.
4. Esperar aprobación explícita del usuario cuando el cambio lo requiera.
5. Implementar solo el alcance acordado.
6. Probar en móvil y escritorio.
7. Revisar que no se rompa la experiencia existente.
8. Registrar el cambio de forma clara si corresponde.

Regla central:

- No mezclar frontend, backend, seguridad, diseño y documentación en una sola tarea si no es estrictamente necesario.

---

## 4. Unidad de trabajo

La unidad de trabajo debe ser siempre una sola historia de usuario pequeña y verificable.

Cada tarea debe:

- Tener un alcance acotado.
- Poder probarse de forma independiente.
- Evitar refactors masivos.
- Evitar cambios colaterales.
- Respetar la arquitectura vigente.

Si una solicitud parece grande, debe dividirse antes de implementarse.

---

## 5. Flujo principal del producto

Toda implementación relacionada con experiencia de usuario debe respetar este recorrido:

1. El usuario entra al enlace de la invitación.
2. Aparece el popup inicial con `Entrar como invitado` y `Entrar como administrador`.
3. Existe un `Superadministrador` oculto o restringido solo para pruebas y desarrollo.
4. El invitado ingresa su nombre y, cuando corresponda, el código del evento.
5. El sistema guarda su identidad en el dispositivo y crea su álbum personal.
6. Se muestra el saludo `Hola, [Nombre] ❤️`.
7. Al cerrarlo, el usuario continúa recorriendo la misma página.
8. El Centro de Recuerdos aparece como una sección integrada dentro del scroll.
9. Desde el acceso al Centro de Recuerdos se navega entre:
   - Fotos de los Invitados
   - Fotos Profesionales
   - Muro de Comentarios y Saludos
   - Presentación
10. Desde cualquier sección se puede volver al recorrido anterior sin perder la invitación.

Ningún cambio de experiencia debe contradecir este flujo.

---

## 6. Reglas de implementación

Toda modificación debe cumplir estas reglas:

- Cambiar solo los archivos necesarios.
- No eliminar funcionalidades existentes sin autorización explícita.
- No introducir frameworks nuevos.
- No introducir dependencias nuevas sin justificación.
- No alterar rutas, nombres o estructura sin necesidad.
- Mantener la experiencia visual elegante y emocional.
- Mantener las interacciones simples y comprensibles.
- Mostrar estados de carga cuando haya esperas reales.
- Confirmar acciones destructivas.
- Respetar la navegación dentro de la misma página.

---

## 7. Reglas sobre roles y permisos

La lógica de roles debe seguir esta jerarquía:

- Invitado.
- Administrador.
- Superadministrador restringido.

Reglas mínimas:

- El invitado solo puede gestionar su propio contenido.
- El álbum personal vacío solo lo ve su dueño.
- Al subir la primera foto, el álbum se vuelve visible para otros invitados.
- En álbumes ajenos, el invitado puede ver, comentar y dar likes, pero no editar ni eliminar.
- El álbum oficial pertenece exclusivamente a los administradores.
- El libro de mensajes puede ser moderado por administradores.
- El superadministrador solo se usa para pruebas, cambio de usuarios y validación de permisos.

---

## 8. Calidad mínima

Toda funcionalidad nueva debe cumplir con estos criterios:

- Funcionar en móvil y escritorio.
- Mantener una navegación clara.
- Ser consistente con la estética actual.
- No romper la versión previa.
- Tener manejo básico de errores.
- No introducir sobreingeniería.
- Encajar con el objetivo del Centro de Recuerdos como cápsula emocional del evento.

---

## 9. Proceso antes de modificar

Antes de tocar archivos, se debe:

- Revisar el contexto real del proyecto.
- Entender qué parte del flujo principal afecta el cambio.
- Identificar el impacto sobre el invitado, el administrador o ambos.
- Verificar si el cambio pertenece a documentación, estilo, funcionalidad o arquitectura.
- Explicar al usuario el plan propuesto.

---

## 10. Proceso después de modificar

Al terminar un cambio, se debe:

- Resumir qué se hizo.
- Indicar qué archivos se modificaron.
- Explicar por qué el cambio era necesario.
- Indicar cómo probarlo.
- Aclarar si quedaron riesgos o tareas pendientes.
- Confirmar que no se alteró nada fuera del alcance solicitado.

---

## 11. Alcance de la versión 1

La V1 tiene como objetivo consolidar la transición desde invitación digital a Centro de Recuerdos sin perder simplicidad.

La versión 1 debe priorizar:

- Acceso por el mismo enlace.
- Entrada por invitado y administrador.
- Superadministración interna restringida para pruebas.
- Álbum personal automático.
- Centro de Recuerdos separado en `centro-recuerdos.html` y accesible desde la invitación.
- Cuatro secciones principales dentro del Centro de Recuerdos.
- Fotos de los Invitados con `Mi Álbum` y álbumes públicos.
- Fotos Profesionales con modo invitado y modo administrador.
- Muro de Comentarios y Saludos.
- Presentación con música existente.

Todo cambio debe evaluarse según su aporte a ese recorrido principal.
