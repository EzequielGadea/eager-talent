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

### Seed (cargar o reiniciar datos iniciales)

```bash
bun run db:seed
```

El script de seed (`src/server/db/prisma/seed-data.ts`) es **idempotente**: se puede ejecutar N veces sin duplicar datos. Solo se permite ejecutar contra PostgreSQL local.

- **Administrador principal (con credenciales de login):**
   - **Rol:** `Recruiter`
   - **Email:** `admin@example.com`
   - **Contraseña:** `admin123`



#### Reiniciar la base de datos local desde cero

Por si en algún momento es necesario vaciar completamente la instancia local de Prisma Dev y empezar de cero:

```bash
bun run db:local:remove
bun run setup:local
bun run db:seed
```


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

## Worfklow de implementación de una funcionalidad
Existen varios pasos a seguir para implementar correctamente una funcionalidad y mantener una buena gestión de los artefactos. 
A continuación tienen disponible un esquema para esto.

En primer lugar, si existe una card en ClickUp para la funcionalidad que van a implementar o testear, 
DEBEN estar asignados a ella (y no olviden mantener un resgistro riguroso del tiempo).
Luego, en caso de que esten desarrollando DEBEN crear una branch desde el último
commit de `dev` con un nombre en el formato `feature-*`, todo minúsculas y los espacios se reemplazan por guiones (-).
Esto se hace facilmente en GitHub, en el menú que se despliega al intentar cambiar de branch, es suficiente escribir
el nombre y muestra la opción de crear. No olviden correr `git pull` para obtener la nueva branch y `git switch feature-*`
para establecerla como branch actual.

Es en este momento cuando pueden abrir su editor de texto favorito e implementar sus funcionalidades.

Una vez que la funcionalidad esté implementada (quizás correctamente), DEBEN abrir una Pull Request (PR) hacia `dev` y asignar
como Reviewer al tester con quien se hayan coordinado. DEBEN poner el identificador de la card sobre la que trabajaron en alguna
parte del comentario de la PR y/o un enlace.

> Abrir una PR y *luego* asignar un tester permite que se hagan comentarios en el panel de la PR, para una mejor gestión de los cambios.

Antes de hacer merge de la PR hacia `dev` DEBERÍAN hacer un rebase de su branch, es decir `feature-*` sobre `dev`.
En pocas palabras, un rebase es un método para unir dos branches, que rebobina el commit `HEAD` hasta el commit más reciente de
la branch base (en este caso `dev`) y reproduce (es decir, vuelve a aplicar) sus commits sobre `HEAD`. Esto tiene el objetivo de 
que el historial sea más limpio y que al presional el botón de Merge de la PR aparezcan pocos (o ningún) conflicto.

> Warning! Hacer un rebase sobreescribe el historial de la branch. Si algun colaborador no hizo un push de sus cambios antes de
> hacer el rebase, podría potencialmente perder su trabajo. Es importante que se coordinen antes de hacer el rebase y solo hacerlo
> cuando sepan que no agregarán más commits.

> `HEAD` es una "variable" que mantiene la referencia (el SHA-1 de un commit) del commit más reciente de la branch actual.

<img width="950" height="600" alt="image" src="https://github.com/user-attachments/assets/9d5b95e5-fba1-41e1-b3e1-8d346bde3272" />

En la imagen anterior se puede apreciar el efecto que tiene un rebase sobre una branch. La branch `B` representa la branch donde 
desarrollaron su funcionalidad, mientras `C` representa la branch destino (en nuestro caso `dev`). Los commits `C4` y `C5` son nuevas
funcionalidades que sus compañeros ya integraron, y con quienes potencialmente podrían tener conflictos. Luego de aplicar el rebase
obtenemos un historial más limpio de la branch donde desarrollaron y sin conflictos.

> Nota: existe un escenario donde aún después de un rebase tengan conflictos con `dev`. Esto sucede cuando alguien hacer Merge de una PR
> justo después de que ustedes hayan comenzado su rebase, pero antes de que hagan Merge hacia `dev`.

PUEDEN ver [Learn Git Rebase in 6 minutes // explained with live animations!](https://www.youtube.com/watch?v=f1wnYdLEpgI) donde se explica
especificamente qué comandos correr. PUEDEN investigar sobre rebase interactivo.

## Sobre los commits
Su flujo de creación de commits NO DEBERÍA ser así

```bash
git add .
git commit -m "agregar alta de usuario, arreglar schema.prisma, corregir un error cuando se redirecciona, reescribir handler para endpoint de formularios externos"
```

Más bien, cada commit individual debería ser pequeño y estar acompañado de un mensaje de commit corto, conciso y descriptivo. 
Para el (contra)ejemplo anterior, su flujo DEBERÍA ser

```bash
git add create-user.ts
git commit -m "feat: alta de usuario"
git add schema.prisma
git commit -m "fix: user_id ahora es FK de User, y no Applicant"
git add home.ts
git commit -m "fix: home ahora redirecciona al usuario correcto y no a identificador hardcodeado"
git add form-handler.ts
git commit -m "refactor: utilizar zod para validación y no validación manual"
```
A continuación una lista no exhaustiva de tipos de commit

| Tipo     | Uso                                                                | Ejemplo                                                |
|----------|--------------------------------------------------------------------|--------------------------------------------------------|
| feat     | Nueva funcionalidad                                                | feat: enviar email de invitacion a nuevo usuario       |
| fix      | Corregir un bug                                                    | fix: evitar caso borde de division por cero            |
| refactor | Cambios en el codigo que NO tienen efectos en funcionalidades o UI | refactor: reemplazar while por for                     |
| chore    | Tareas que no afectan al proyecto en si.                           | chore: configurar eslint                               |
| style    | Commits que solo cambian estilos en el codigo                      | style: eliminar lineas en blanco y trailing whitespace |

## Sobre las verificaciones automáticas de las PRs

Cuando se abre una nueva PR se realizan las siguientes verificaciones

- Que se cumplan las reglas de estilo de ESLint
- Que buildee exitosamente
- Que las migraciones corran exitosamente
- Que no hayan problemas de tipos

Para que una PR pueda ser mergeada hacia dev se DEBEN cumplir

- La lista anterior
- Al menos una aprobación de un reviewer

## Sobre gestión de archivos y buckets de UploadThing

Será necesario implementar adjunatar archivos a formularios. Como las bases de datos relacionales no se llevan bien
con los BLOBs, usaremos UploadThing como bucket para archivos.

UploadThing provee un paquete para facilitar el desarrollo, ya esta instalado en el proyecto. Durante el desarrollo DEBEN crearse
una cuenta, crear un bucket y obtener un API TOKEN para poder probar sus funcionalidades. Los ambientes de PREVIEW y PRODUCTION ya tienen
un API TOKEN configurado que proveen acceso a buckets de la cuenta del Responsable de SCM.

Para más información consulten los (docs de UploadThing)[https://docs.uploadthing.com/getting-started/appdir].
