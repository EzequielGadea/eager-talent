# Eager Talent

## Desarrollo local

Requisitos: Git, Node.js 20 o superior y Bun 1.2.20. En local utiliza Prisma Dev (PGlite).

```bash
bun install
bun run setup:local
bun run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

`setup:local` inicia la base local, aplica las migraciones y genera Prisma Client. Una base nueva queda sin datos de aplicación hasta ejecutar el seed.

### Seed (cargar datos iniciales)

```bash
bun run db:seed
```

El seed (en este momento) crea un único administrador de prueba (rol `Recruiter`):

- Email: `admin@example.com`
- Contraseña: `admin123`


`src/server/db/prisma/seed-data.ts` queda como plantilla para futuros datos de prueba (solo permite PostgreSQL local!!). No se ejecuta durante la instalación, el build, `setup:local` ni la aplicación de migraciones.


### Consultar la DB local

**Prisma Studio**

Ejecutar `bun run db:studio --port 5555` y abrir [http://localhost:5555](http://localhost:5555).

Si Studio muestra `Schema metadata unavailable` o un error `26000`, cerrar la ventana de Studio y reiniciar Prisma Dev antes de abrirlo nuevamente:

```bash
bun run db:local:stop
bun run db:local
bun run db:studio --port 5555
```

[**DBeaver**](https://dbeaver.io/download/)

1. Iniciar Prisma Dev con `bun run db:local`.
2. Elegir **Database → New Database Connection → PostgreSQL** y deshabilitar SSL
   para esta conexión local.

   | Campo    | Valor       |
   | -------- | ----------- |
   | Host     | `localhost` |
   | Port     | `51214`     |
   | Database | `template1` |
   | Username | `postgres`  |
   | Password | `postgres`  |

3. Pulsar **Test Connection**, descargar el driver si lo solicita y pulsar **Finish**.
4. Abrir **Schemas → public → Tables**, elegir una tabla y abrir **Data**.
