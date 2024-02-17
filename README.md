# vStreet

## Reglas
- Antes de comenzar a desarrollar, es necesario tener en cuenta los siguientes puntos:
1. No se debe desarrollar nada que no forme parte de un ticket/incidencia en Jira (Historia de usuario, Defecto, Tarea técnica), el cuál debe pasar por un refinamiento funcional + técnico en caso de tratarse de una Historia de usuario, o sólo un refinamiento técnico en caso de tratarse de una Tarea técnica. Además el mismo debe encontrarse dentro del sprint activo.
2. Antes de comenzar un desarrollo, debemos asegurarnos que estamos sobre la rama Master (`git branch`) y luego asegurarnos de que nuestra rama Master local, esté actualizada con la rama Master remota (`git pull`).
3. Luego se debe crear una nueva rama para ese desarrollo, aquí unos ejemplos dependiendo el tipo de incidencia:
    - (`git checkout -b feature/vst-1-nombre-del-ticket`).                                                          
    - (`git checkout -b fix/vst-2-nombre-del-ticket`).                                                          
    - (`git checkout -b task/vst-3-nombre-del-ticket`).
4. Realiza tus cambios y haz commits a tu nueva rama (`git commit -m 'Descripción de los cambios correspondientes a ese commit'`).
5. Sube la rama con tus cambios a al repositorio remoto (`git push origin feature/vst-1-nombre-del-ticket`).
6. Crea un nuevo Pull Request.

## Rules
- Before starting development, it's necessary to consider the following points:
1. Do not develop anything that is not part of a ticket/issue in Jira (User Story, Defect, Technical Task), which must go through functional + technical refinement if it's a User Story, or only technical refinement if it's a Technical Task. Additionally, it must be within the active sprint.
2. Before starting development, ensure that you are on the Master branch (`git branch`) and then ensure that your local Master branch is up to date with the remote Master branch (`git pull`).
3. Then create a new branch for that development, here are some examples depending on the type of issue:
    - (`git checkout -b feature/vst-1-ticket-name`).                                                          
    - (`git checkout -b fix/vst-2-ticket-name`).                                                          
    - (`git checkout -b task/vst-3-ticket-name`).
4. Make your changes and commit to your new branch (`git commit -m 'Description of changes corresponding to that commit'`).
5. Push the branch with your changes to the remote repository (`git push origin feature/vst-1-ticket-name`).
6. Create a new Pull Request.
