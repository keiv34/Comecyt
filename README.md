# ÁGORA | Plataforma de e-learning COMECYT

La aplicación usa React con Vite, Node.js con Express y MySQL.

## Desarrollo local

Los comandos de la raíz usan las siguientes carpetas.

| Componente | Carpeta |
| --- | --- |
| Frontend | `Comecyt/RedesSociales/Comecyt/RedesSociales` |
| API MySQL | `Comecyt/Backend` |
| Catálogo del curso | `Comecyt/RedesSociales/Comecyt/RedesSociales/src/curso/catalogo.json` |

El repositorio conserva el frontend exterior `Comecyt/RedesSociales/src` y el backend PostgreSQL `Comecyt/RedesSociales/Comecyt/Backend` como referencias de la estructura anterior. Usa los comandos de la raíz para arrancar la combinación React + MySQL.

1. Instala las dependencias con Node.js 22 en cada paquete.

   ```powershell
   npm.cmd --prefix Comecyt/Backend ci
   npm.cmd --prefix Comecyt/RedesSociales/Comecyt/RedesSociales ci
   ```

2. Configura `Comecyt/Backend/.env` con los valores de tu instancia MySQL y un `JWT_SECRET`. Los dos paquetes incluyen ejemplos de configuración. Define `VITE_API_URL` en el frontend si la API usa una URL distinta de `http://localhost:4000`.
3. En una **base nueva**, importa `bd_comecyt_schema.sql` para crear las tablas. El volcado incluye instrucciones `DROP TABLE`. En una **base existente**, revisa directamente el catálogo con el siguiente comando.
4. Revisa los IDs y sincroniza el catálogo en la base de destino.

   ```powershell
   npm.cmd run catalogo:revisar
   npm.cmd run catalogo:aplicar
   ```

   La revisión consulta MySQL sin persistir cambios. La sincronización agrega los registros faltantes y unifica los títulos y los totales de lecciones dentro de una transacción. Si encuentra IDs ocupados por otros módulos, evaluaciones con una relación distinta o numeración de lecciones incompatible, cancela la operación. Los IDs de módulos, resultados y certificados históricos se conservan.

5. En dos terminales, inicia la API y el frontend.

   ```powershell
   npm.cmd run dev:api
   npm.cmd run dev:web
   ```

   Para compilar el frontend, ejecuta `npm.cmd run build:web`.

## Orden del curso

| ID | Módulo | Lecciones |
| --- | --- | --- |
| 1 | Correo Electrónico | 8 |
| 2 | Facebook y Marketplace | 6 |
| 3 | WhatsApp y WhatsApp Business | 7 |
| 4 | Instagram | 8 |
| 5 | Retos Educaplay | 16 |
| 6 | Cobros Digitales y Finanzas | 6 |
| 7 | Seguridad digital y prevención de fraudes | 6 lecciones y evaluación final |
| 8 | Google Drive y trabajo colaborativo | 3 lecciones y evaluación final |
| 9 | LinkedIn | 3 lecciones y evaluación final |
| 10 | Aplicaciones de transporte y entrega | 3 lecciones y evaluación final |
| 11 | ChatGPT y Gemini | 3 lecciones y evaluación final |

Cada módulo empieza en la lección 1. React usa el catálogo para el temario, la navegación y los totales. MySQL almacena el número de lecciones completadas en `progreso_actual`. La API devuelve el porcentaje y la siguiente lección en campos independientes. Los comandos para sincronizar módulos específicos están en [PLAN_MODULOS.md](PLAN_MODULOS.md).
