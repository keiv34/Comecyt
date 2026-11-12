# Ampliación del curso

Los módulos 7 al 11 están incorporados al catálogo del curso.

## Preparación realizada

- El [README](README.md) identifica el frontend React y la API MySQL que arrancan desde la raíz.
- Retos Educaplay conserva el ID 5, que usa la versión MySQL del repositorio y el flujo de certificados existente. Cobros Digitales y Finanzas ocupa el ID 6.
- Inicio, Temario, Perfil y las rutas de lecciones comparten el mismo catálogo. Se conservaron redirecciones de los enlaces históricos con numeración global.
- El registro de avance acepta los campos anteriores y guarda un conteo por módulo. La API calcula el porcentaje y valida el acceso secuencial a las lecciones.
- El catálogo se puede revisar antes de sincronizarlo en MySQL. La revisión informa IDs que ya están ocupados fuera de los módulos activos.

## Módulo 7

Los seis temas del programa se presentan como lecciones del módulo 7. Cada lección incluye un caso de práctica con retroalimentación. La evaluación final se califica en Node.js y se aprueba con 80 de 100 puntos. Se registra el resultado en MySQL y se utiliza el progreso habitual del curso.

Para registrar únicamente este módulo en una base con los cursos anteriores, ejecuta desde `Comecyt/Backend`.

```powershell
node scripts/sincronizarCatalogo.js --modulo=7
node scripts/sincronizarCatalogo.js --modulo=7 --aplicar
```

La ponderación de prácticas y cuestionarios, la entrega de evidencias y la constancia específica quedan pendientes de definir. El examen final y el avance ya se guardan con el modelo existente.

## Módulos 8 a 11

Cada módulo incluye tres lecciones, tres casos prácticos y una evaluación de cinco preguntas. Node.js calcula la calificación y guarda el resultado. La calificación mínima es de 80 sobre 100.

Para sincronizar solo estos cuatro módulos, ejecuta desde `Comecyt/Backend`.

```powershell
node scripts/sincronizarCatalogo.js --modulo=8,9,10,11
node scripts/sincronizarCatalogo.js --modulo=8,9,10,11 --aplicar
```

La vista previa local se activa para una cuenta de alumno con `MODULOS_VISTA_PREVIA_CORREO` y una lista de IDs en `MODULOS_VISTA_PREVIA_IDS`. Permite revisar lecciones y ensayar la evaluación sin registrar avance ni calificaciones.
