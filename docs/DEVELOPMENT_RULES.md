# DEVELOPMENT RULES

## 1. Objetivo del documento

Este documento define la metodología oficial de desarrollo del proyecto. Su propósito es establecer reglas claras para analizar, diseñar, implementar, probar, revisar y entregar cambios de forma ordenada, segura y consistente.

Debe ser utilizado como guía permanente por cualquier persona o IA que trabaje en este repositorio, con el objetivo de preservar la calidad del producto, evitar cambios innecesarios y mantener una evolución controlada de la aplicación.

---

## 2. Filosofía del proyecto

La filosofía del proyecto se basa en construir una experiencia simple, rápida y mantenible, priorizando siempre el valor para los invitados y los administradores del evento.

Principios principales:

- Mantener una aplicación rápida.
- Utilizar HTML, CSS y JavaScript Vanilla como base tecnológica principal.
- Evitar frameworks salvo que exista una justificación técnica fuerte, documentada y aprobada.
- Priorizar la simplicidad en la arquitectura, el diseño y la experiencia de usuario.
- Priorizar la experiencia móvil, considerando que la mayoría de los usuarios accederá desde celulares.
- Pensar siempre en reutilizar el producto para múltiples eventos, evitando decisiones demasiado acopladas a un único caso puntual.
- Mantener el funcionamiento actual estable mientras se incorporan nuevas capacidades.
- Favorecer soluciones progresivas antes que cambios disruptivos.

---

## 3. Metodología de desarrollo (Flujo oficial)

El proyecto se desarrollará de forma estrictamente incremental e iterativa estructurado mediante **Sprints**. Para garantizar la calidad y orden en la evolución de la plataforma, se prohíbe mezclar el desarrollo visual de la interfaz con la integración de backend, dividiendo el trabajo claramente en dos etapas (Etapa 1: Frontend completo, Etapa 2: Integración con Firebase y backend).

El desarrollo de cualquier cambio debe seguir rigurosamente el siguiente flujo oficial:

1. **Seleccionar Sprint:** Identificar el Sprint activo en el Roadmap.
2. **Seleccionar Issue:** Tomar un único Issue del Sprint actual para su resolución.
3. **Analizar:** Investigar el contexto, código existente y archivos implicados.
4. **Explicar el plan:** Presentar detalladamente al usuario el enfoque técnico propuesto y las historias de usuario a cubrir.
5. **Esperar aprobación:** No realizar modificaciones en el código hasta recibir la confirmación explícita del usuario.
6. **Implementar:** Escribir el código estrictamente necesario para cumplir con el alcance del Issue.
7. **Probar:** Validar el cambio en múltiples resoluciones (mobile-first) y escenarios de error.
8. **Revisar:** Inspeccionar la calidad del código, asegurando que sea limpio y libre de duplicación.
9. **Commit:** Realizar el commit semántico correspondiente registrando el avance del Issue.
10. **Marcar Issue como completado:** Registrar el Issue como resuelto en la lista del Sprint.
11. **Cerrar Sprint (cuando todos sus Issues estén completos):**
    - Cerrar el Sprint formalmente.
    - Actualizar su estado en el Roadmap global.
    - Crear un Tag de Git (si corresponde).

---

## 4. Trabajo mediante Sprints e Issues

Para garantizar entregas pequeñas, seguras y altamente auditables, se adopta un sistema de trabajo estructurado estrictamente en Sprints e Issues:

- **Componentes del Sprint:** Cada Sprint está compuesto por una lista cerrada de varios **Issues** numerados secuencialmente.
- **Unidad de Valor:** Cada Issue representa una única historia de usuario pequeña o una funcionalidad específica bien delimitada.
- **Alcance Acotado:** Cada Issue debe poseer un alcance pequeño, evitando a toda costa agrupar múltiples responsabilidades en una sola tarea.
- **Validación Individual:** Cada Issue debe poder desarrollarse, probarse, verificarse y aprobarse de manera completamente autónoma e independiente.

El flujo operativo de trabajo se rige estrictamente bajo las siguientes pautas:

- **Todo desarrollo comienza seleccionando un Sprint:** Se identifica y selecciona el Sprint activo y prioritario dentro de la planificación de la versión 1.
- **Luego se selecciona un Issue:** Se escoge un único Issue numerado de la lista del Sprint activo para su resolución inmediata.
- **Se implementa únicamente ese Issue:** Se focaliza el esfuerzo de codificación única y exclusivamente en el alcance delimitado de ese Issue, sin mezclar otras funcionalidades o realizar refactorizaciones ajenas.
- **Se prueba:** Se realizan pruebas completas del cambio en entornos mobile-first para garantizar que funciona sin fallos.
- **Se revisa:** Se inspecciona la calidad y consistencia del código frente a los estándares de desarrollo del proyecto.
- **Se realiza commit:** Se efectúa el commit semántico correspondiente que registra los cambios limpios de la tarea.
- **Se marca el Issue como completado:** Se cambia el estado de dicho Issue a resuelto o completado en la lista del Sprint.
- **Cuando todos los Issues estén completos, se cierra el Sprint:** Se procede a dar por terminado el Sprint en el Roadmap general únicamente cuando se han validado y finalizado la totalidad de los Issues que lo componen.

---

## 5. Criterios para finalizar un Sprint

Para asegurar un progreso robusto y libre de errores acumulativos, se imponen las siguientes reglas al cierre de cada ciclo:
- **Finalización con Commit:** Cada Sprint finaliza obligatoriamente con un commit semántico que agrupa exclusivamente los cambios de ese ciclo.
- **Uso de Tags de Git:** Cada conjunto importante de Sprints completados (o fases críticas) podrá marcarse con un Tag de Git (por ejemplo, `v1.0-frontend`, `v1.1-auth`, etc.) para facilitar puntos de retorno estables.
- **Secuencialidad Estricta:** No se permite comenzar un Sprint nuevo bajo ninguna circunstancia hasta que el Sprint anterior haya sido completamente aprobado, validado y cerrado.

---

## 6. Flujo de trabajo

El proceso oficial de trabajo debe respetar las siguientes etapas:

1. Analizar la necesidad, el contexto del proyecto y el impacto potencial del cambio.
2. Diseñar la solución antes de implementarla, identificando alcance, archivos afectados y riesgos.
3. Implementar únicamente lo necesario para cumplir la tarea definida.
4. Probar el cambio en los escenarios relevantes.
5. Revisar el resultado, verificando que no rompa funcionalidades existentes.
6. Recién después hacer commit.
7. Crear Pull Request con una descripción clara del cambio.
8. Realizar el merge únicamente cuando el Pull Request esté aprobado.

Reglas adicionales del flujo de trabajo:

- Nunca se deben implementar varias funcionalidades grandes en una sola tarea.
- Cada tarea debe tener un alcance claro y verificable.
- Si una necesidad requiere múltiples cambios grandes, debe dividirse en tareas más pequeñas.
- Antes de modificar archivos críticos, se debe comprender cómo funcionan actualmente.
- Los cambios deben ser incrementales y fáciles de revisar.

---

## 7. Convenciones Git

El proyecto utiliza commits semánticos para mantener un historial claro y fácil de entender.

Formato recomendado:

```text
<tipo>: <descripción breve>
```

Tipos permitidos y cuándo utilizarlos:

- `feat:` para nuevas funcionalidades visibles para el usuario o capacidades nuevas del producto.
- `fix:` para correcciones de errores o comportamientos incorrectos.
- `docs:` para cambios exclusivamente de documentación.
- `refactor:` para cambios internos de estructura que no modifican el comportamiento observable.
- `style:` para cambios de formato, estilos visuales o ajustes que no alteran lógica funcional.
- `perf:` para mejoras de rendimiento.
- `chore:` para tareas de mantenimiento, configuración o cambios operativos que no afectan directamente la funcionalidad.

Buenas prácticas:

- El mensaje debe ser claro, breve y específico.
- Cada commit debe representar una unidad lógica de cambio.
- No mezclar cambios no relacionados en el mismo commit.
- No incluir archivos modificados accidentalmente.
- Revisar el estado de Git antes de confirmar cambios.

---

## 8. Reglas para modificaciones

Toda modificación debe ser mínima, intencional y alineada con el objetivo de la tarea.

Reglas obligatorias:

- Nunca cambiar nombres de archivos sin autorización explícita.
- Nunca eliminar funcionalidades existentes sin autorización explícita.
- Nunca hacer refactors masivos sin aprobación previa.
- Nunca modificar más archivos de los necesarios.
- No introducir dependencias innecesarias.
- Mantener compatibilidad con Netlify.
- Evitar cambios de comportamiento no solicitados.
- Preservar la experiencia actual salvo que la tarea indique lo contrario.
- Documentar decisiones relevantes cuando afecten la arquitectura o el producto.
- Mantener una separación clara entre documentación, estilos, estructura y lógica.

---

## 9. Reglas para Codex

Codex debe trabajar de forma explícita, controlada y verificable.

Antes de modificar código, Codex debe:

- Comprender la tarea solicitada.
- Revisar el contexto necesario del proyecto.
- Explicar qué piensa hacer.
- Identificar los archivos que podrían verse afectados.
- Confirmar si el cambio es de documentación, funcionalidad, estilo, configuración o mantenimiento.

Al finalizar, Codex debe:

- Resumir los cambios realizados.
- Indicar los archivos modificados.
- Indicar posibles riesgos.
- Indicar cómo probar la funcionalidad.
- Informar si no se ejecutaron pruebas y explicar el motivo.
- Verificar que no haya archivos modificados accidentalmente.

Reglas específicas para Codex:

- No debe modificar archivos fuera del alcance de la tarea.
- No debe introducir dependencias sin justificación y autorización.
- No debe refactorizar por iniciativa propia.
- No debe cambiar nombres, rutas o estructura sin autorización.
- No debe mezclar implementación con documentación salvo que la tarea lo requiera.

---

## 10. Criterios de calidad

Toda funcionalidad nueva debe cumplir con criterios mínimos de calidad antes de considerarse lista.

Debe:

- Ser responsive.
- Funcionar correctamente en escritorio y móvil.
- Mantener la accesibilidad existente.
- Evitar duplicación de código.
- Mantener un rendimiento adecuado.
- Respetar la estética y experiencia general del producto.
- Ser comprensible para futuros mantenedores.
- Manejar estados de error cuando corresponda.
- Evitar complejidad innecesaria.
- Integrarse sin romper el flujo actual de la invitación.

---

## 11. Criterios para dar una tarea por terminada

Una tarea solamente se considera finalizada cuando:

- Funciona correctamente.
- Fue probada.
- No rompe funcionalidades existentes.
- Fue revisada.
- Está lista para commit.
- El alcance implementado coincide con lo solicitado.
- No quedan cambios accidentales fuera de la tarea.
- Los archivos modificados son los mínimos necesarios.
- La documentación fue actualizada si el cambio lo requiere.

Si alguno de estos puntos no se cumple, la tarea debe considerarse incompleta o pendiente de revisión.

---

## 12. Alcance de la versión 1

El objetivo principal de la versión 1 es convertir la invitación digital en un Centro de Recuerdos del evento, manteniendo el mismo enlace publicado y preservando una experiencia simple para invitados y administradores.

La V1 debe enfocarse en consolidar la transición desde una invitación estática hacia una experiencia colaborativa de recuerdos, sin perder rendimiento, claridad ni compatibilidad con Netlify.

Cualquier tarea de la versión 1 debe evaluarse según su contribución directa a este objetivo principal y su alineación con el roadmap oficial del producto.
