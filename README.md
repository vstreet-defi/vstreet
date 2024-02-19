# vStreet

## Reglas
- Antes de comenzar a desarrollar, es necesario tener en cuenta los siguientes puntos:
1. No se debe desarrollar nada que no forme parte de un ticket/incidencia en Jira (Historia de usuario, Defecto, Tarea técnica), el cuál debe pasar por un refinamiento funcional + técnico en caso de tratarse de una Historia de usuario, o sólo un refinamiento técnico en caso de tratarse de una Tarea técnica. Además el mismo debe encontrarse dentro del sprint activo.
2. Antes de comenzar un desarrollo, debemos asegurarnos que estamos sobre la rama Master `git branch` y luego asegurarnos de que nuestra rama Master local, esté actualizada con la rama Master remota `git pull`. Si nos encontramos sobre una rama distinta a Master, simplemente ejecutar `git switch master` y luego hacer el pull.
3. Luego se debe crear una nueva rama para ese desarrollo, aquí unos ejemplos dependiendo el tipo de incidencia:
    - `git checkout -b feature/vst-1-descripcion-breve`.                                                          
    - `git checkout -b fix/vst-2-descripcion-breve`.                                                          
    - `git checkout -b task/vst-3-descripcion-breve`.
4. Realiza tus cambios y haz commits a tu nueva rama `git commit -m 'Descripción de los cambios correspondientes a ese commit'`.
5. Sube la rama con tus cambios a al repositorio remoto `git push origin feature/vst-1-descripcion-breve`.
6. Crea un nuevo Pull Request, a continuación unos puntos a tener en cuenta:
    - Branch Base: `Master`.
    - Branch to compare: mi rama -> `feature/vst-1-descripcion-breve`.
    - En el título respeta el siguiente formato: `[Feature][VST-1]: Nombre del ticket`.
    - La descripción debe contener un resumen de todos los cambios realizados.
    - En Reviewers agrega al resto de desarrolladores.
    - En Assignees debes asignarte a ti mismo.
8. Comparte la URL de la Pull Request con el equipo por el chat de texto "github" del canal de Discord para notificarles también por ese medio de que hay un PR pendiente. Este último debe ser aprobado por al menos una persona antes de mergear. Para los reviewers, unos puntos a tener en cuenta:
    -  Baja la rama al tu repositorio local -> Estando sobre la rama Master actualizada, ejecutar `git checkout nombreDeLaRama`.
    -  Prueba la solución ofrecida por tu compañero, siendo critico para mantener la rama Master libre de errores inesperados.
    -  Revisa el código en busca de logs, comentarios, malas prácticas o porciones de código en donde se puedan realizar posibles mejoras.
    -  Al aprobar un PR defectuoso o con errores, ante cualquier repercusión grave en la rama Master y en entornos productivos, compartes la responsabilidad con el desarrollador que escribió el código.
    -  Una vez el PR pase las revisiones satisfactoriamente, esta en condiciones de ser aprobado y mergeado a Master.

## Rules
- Before starting development, it is necessary to consider the following points:
1. Do not develop anything that is not part of a ticket/issue in Jira (User Story, Defect, Technical Task), which must go through functional + technical refinement if it is a User Story, or only technical refinement if it is a Technical Task. Additionally, it must be within the active sprint.
2. Before starting development, make sure you are on the Master branch `git branch` and then ensure that your local Master branch is updated with the remote Master branch `git pull`. If you are on a different branch than Master, simply execute `git switch master` and then pull.
3. Then create a new branch for that development, here are some examples depending on the type of issue:
    - `git checkout -b feature/vst-1-brief-description`.
    - `git checkout -b fix/vst-2-brief-description`.
    - `git checkout -b task/vst-3-brief-description`.
4. Make your changes and commit to your new branch `git commit -m 'Description of changes corresponding to this commit'`.
5. Push the branch with your changes to the remote repository `git push origin feature/vst-1-brief-description`.
6. Create a new Pull Request, here are some points to consider:
    - Branch Base: `Master`.
    - Branch to compare: my branch -> `feature/vst-1-brief-description`.
    - In the title, follow this format: `[Feature][VST-1]: Ticket Name`.
    - The description should contain a summary of all the changes made.
    - Add the rest of the developers as Reviewers.
    - Assign yourself as Assignees.
7. Share the URL of the Pull Request with the team through the "github" text chat on the Discord channel to notify them through that medium that there is a pending PR. This must be approved by at least one person before merging. For reviewers, some points to consider:
    - Checkout the branch to your local repository -> Being on the updated Master branch, execute `git checkout branchName`.
    - Test the solution provided by your teammate, being critical to keep the Master branch free of unexpected errors.
    - Review the code for logs, comments, bad practices, or code portions where possible improvements can be made.
    - Approving a defective or erroneous PR, in the event of any serious repercussions on the Master branch and in production environments, shares responsibility with the developer who wrote the code.
    - Once the PR passes the reviews satisfactorily, it is ready to be approved and merged into Master.

