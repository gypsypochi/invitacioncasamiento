# AGENTS.md

Este documento define la guía obligatoria de colaboración para cualquier agente de IA que trabaje en este repositorio.

## Descripción del proyecto

El proyecto comenzó como una invitación digital de casamiento para Marcela y Jorge y evoluciona hacia **Centro de Recuerdos**, una experiencia emocional y colaborativa que conserva el mismo enlace antes y después de la celebración.

La experiencia principal debe seguir este flujo:

1. El usuario entra al enlace de la invitación.
2. Ve un popup inicial con `Entrar como invitado` y `Entrar como administrador`.
3. Existe un `Superadministrador` oculto o restringido para pruebas, cambio de usuarios y validación de permisos.
4. El invitado ingresa su nombre y, cuando corresponda, el código del evento.
5. El sistema guarda su identidad en el dispositivo y crea automáticamente su álbum personal.
6. Se muestra el saludo `Hola, [Nombre] ❤️`.
7. Al cerrarlo, se accede al Home del Centro de Recuerdos.
8. El Home muestra cuatro tarjetas:
   - Álbumes de Invitados
   - Álbum Oficial
   - Muro de Comentarios y Saludos
   - Presentación
9. Desde cualquier sección se puede volver atrás hasta regresar al Home.

## Tecnologías

- HTML
- CSS Vanilla
- JavaScript Vanilla
- Firebase
- Firestore
- Storage
- Security Rules
- Netlify

## Tecnologías prohibidas

- Bootstrap
- Tailwind
- React
- Vue
- Angular
- Cualquier otro framework CSS
- Cualquier otro framework JavaScript

## Documentación obligatoria

Antes de analizar, proponer o modificar cualquier línea de código, es obligatorio leer:

- `docs/PRODUCT_VISION.md`
- `docs/DEVELOPMENT_RULES.md`
- `docs/ARCHITECTURE.md`

## Filosofía

- Mantener la estética existente, elegante y emocional.
- No romper la experiencia actual.
- Hacer cambios pequeños e incrementales.
- Resolver una historia de usuario por vez.
- Mantener compatibilidad con Netlify.
- Priorizar Mobile First.
- Evitar convertir el producto en una red social compleja.
- Tratar el Centro de Recuerdos como una cápsula de recuerdos del evento.

## Forma de trabajo

### Antes de modificar código

1. Analizar el contexto y los archivos afectados.
2. Explicar el plan técnico al usuario.
3. Esperar aprobación explícita antes de implementar cambios.

### Después de modificar código

1. Resumir los cambios realizados y su justificación.
2. Indicar con precisión los archivos modificados.
3. Explicar cómo probar la funcionalidad.

## Reglas operativas

- No realizar refactors masivos sin autorización.
- No cambiar nombres, rutas o estructura sin necesidad expresa.
- No introducir dependencias innecesarias.
- No eliminar funcionalidades existentes sin autorización explícita.
- No modificar más archivos de los necesarios.
- Mantener el foco en el flujo principal del Centro de Recuerdos.
