# ÁGORA | Plataforma de e-learning COMECYT

La aplicación usa React con Vite, Node.js con Express y MySQL.

## Desarrollo local

Para trabajar desde otra PC, actualiza la rama `main` del [repositorio de la plataforma](https://github.com/alex7845828/plataforma_sinergia_comecyt) con `git pull --ff-only` y abre en VS Code la carpeta `Comecyt` del clon, donde están este README y el `package.json` que contiene `dev:api` y `dev:web`.

Los comandos de la raíz usan las siguientes carpetas.

| Componente | Carpeta |
| --- | --- |
| Frontend | `Comecyt/RedesSociales/Comecyt/RedesSociales` |
| API MySQL | `Comecyt/Backend` |
| Catálogo del curso | `Comecyt/RedesSociales/Comecyt/RedesSociales/src/curso/catalogo.json` |

Los comandos de la raíz arrancan la combinación React + MySQL. También puedes ejecutar `npm run dev` desde `Comecyt/RedesSociales`, que delega el arranque al frontend de la tabla.

1. Instala las dependencias con Node.js 22 en cada paquete.

   ```powershell
   npm.cmd --prefix Comecyt/Backend ci
   npm.cmd --prefix Comecyt/RedesSociales/Comecyt/RedesSociales ci
   ```

2. En el clon nuevo, copia `Comecyt/Backend/.env.example` a `Comecyt/Backend/.env`. Configura los datos de tu instancia MySQL y un `JWT_SECRET` propio. Vite redirige las solicitudes a la API local. En producción, sirve `/api`, `/avatars` y `/certificados` desde el mismo origen del frontend o configura `VITE_API_URL` con el origen público de la API antes de compilar.
3. Para una instalación nueva, crea en MySQL la base indicada en `DB_NAME` e importa `bd_comecyt_schema.sql` en ella. El volcado incluye instrucciones `DROP TABLE`. Si ya tienes una base con usuarios o progreso, pasa al siguiente paso. Para conservar los usuarios y el avance de otra PC, restaura un respaldo de esa base.
4. Revisa los IDs y sincroniza el catálogo en la base de destino.

   ```powershell
   npm.cmd run catalogo:revisar
   npm.cmd run catalogo:aplicar
   ```

   La revisión consulta MySQL sin persistir cambios. La sincronización agrega los registros faltantes y unifica los títulos y los totales de lecciones dentro de una transacción. Si encuentra IDs ocupados por otros módulos, evaluaciones con una relación distinta o numeración de lecciones incompatible, cancela la operación. Los IDs de módulos, resultados y certificados históricos se conservan.

5. Desde la raíz del repositorio, inicia la API en una terminal de VS Code y el frontend en otra.

   ```powershell
   npm.cmd run dev:api
   npm.cmd run dev:web
   ```

   El frontend abre [la pantalla de inicio de sesión](http://localhost:5173/login). Si el puerto `5173` está ocupado, Vite usa el siguiente puerto libre. Consulta la dirección `Local` que aparece en la terminal. Para compilar el frontend, ejecuta `npm.cmd run build:web`.

   Para probar desde un teléfono en la misma red, inicia el frontend con `npm.cmd --prefix Comecyt/RedesSociales/Comecyt/RedesSociales run dev -- --host 0.0.0.0` y abre `http://IP-DE-TU-PC:5173/login` en el teléfono. Si Vite eligió otro puerto, usa el que muestra la terminal.

6. Inicia sesión como **alumno** con Pedro o con una cuenta creada desde [la pantalla de registro](http://localhost:5173/registro). En localhost, el modo de acreditación guarda avances por defecto. Para abrir cualquier lección en una sesión de práctica, selecciona **Explorar en vista previa** desde Inicio.

   Para conservar la cuenta y el avance de Pedro al cambiar de PC, conecta la API a la misma instancia MySQL o restaura un respaldo de la base.

## Constancias por módulo

Puedes empezar cualquier módulo desde el inicio o el temario. Al completar sus lecciones y aprobar la evaluación correspondiente, descarga su constancia en **Inicio** o en **Mi perfil → Constancias por módulo**. Retos Educaplay se acredita al completar sus retos y la lección de cierre.

Ejecuta `npm.cmd run catalogo:aplicar` para instalar la evaluación de Cobros Digitales y Finanzas en MySQL. Si estás explorando en vista previa, selecciona **Volver al modo de acreditación** en Inicio para guardar el avance y obtener constancias.

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
