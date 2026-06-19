Guía rápida: Desplegar Backend y Base de Datos en Railway

1) Crear cuenta y conectar GitHub
- Ve a https://railway.app y regístrate con GitHub.
- Crea un nuevo Project -> Deploy from GitHub -> selecciona tu repo `Comecyt`.

2) Configurar servicio backend
- En Railway, crea un nuevo Service y elige `Deploy from GitHub` apuntando al repo.
- Root Directory: `Backend`
- Build Command: `npm install`
- Start Command: `npm start`

3) Provisionar base de datos
- Dentro del Project, click `Add Plugin` -> elige `Postgres` (recomendado, tu `config/database.js` usa pg)
- Railway creará una base y te dará una `DATABASE_URL`.

4) Variables de entorno (Environment Variables)
Añade en el Service Backend:
- `DATABASE_URL` = (valor que Railway generó)
- `JWT_SECRET` = valor secreto
- `OPENAI_API_KEY` = tu key
- `WHATSAPP_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
- `NODE_ENV` = production

5) Importar datos MySQL locales (si tienes dump)
- Si tienes un `mysqldump` de MySQL, tendrás que convertir o exportar a SQL compatible con Postgres o usar una BD MySQL en Railway.
- Opción A: Crear plugin `MySQL` en Railway y hacer import directo:
  - Añade MySQL plugin -> obtén host/port/user/password/database
  - Importar con MySQL client:

```powershell
mysql -h <HOST> -P <PORT> -u <USER> -p <DB_NAME> < comecyt_dump.sql
```

- Opción B: Migrar a Postgres (herramienta externa como `pgloader` o manual) — más trabajo.

6) Despliegue final
- Tras setear variables, Railway hará build automático cuando conectes el repo o cuando hagas push.
- Revisa logs en Railway -> Service -> Logs.

7) URL pública
- Railway te dará una URL tipo `https://<nombre>.up.railway.app`. Usa esa URL en `VITE_API_URL` para el frontend.

8) Notas importantes
- Webhooks (WhatsApp) requieren que la URL esté accesible públicamente y sea HTTPS.
- Asegúrate que `CERTS_DIR` y archivos estáticos están en el repo y que tu backend los sirve desde rutas relativas.
