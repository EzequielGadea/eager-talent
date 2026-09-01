Para correr el servidor de desarrollo luego de clonar el repo y entrar al
directorio

```bash
bun install
# Establecer URL de la base de datos en Linux
export DATABASE_URL="postgresql://{user}:{password}@localhost:5432/{database}"
# o si estas usando Windows
$env:DATABASE_URL = "postgresql://{user}:{password}@localhost:5432/{database}"
# Generar cliente de Prisma
bun run db:generate
# Correr migraciones
bun run db:migrate
# Finalmente iniciar el servidor de desarrollo
bun run dev
```
Abri [http://localhost:3000](http://localhost:3000) para ver la pagina.

## Base de datos local
Para desarrollar la app es necesario instalar localmente PostgreSQL y configurar
un usuario y base de datos para la aplicación, puede hacerse de la siguiente
manera en la consola de PostgreSQL

```sql
CREATE USER eager_talent WITH PASSWORD '12345678';

ALTER USER eager_talent CREATEDB;

CREATE DATABASE eager_talent_db OWNER eager_talent;
```

