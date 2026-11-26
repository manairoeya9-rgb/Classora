\# Workflow Git - Classora



\## Branches

\- main : code stable, protégée, seules les releases en partent.

\- dev : intégration de l'équipe, protégée. Un push déclenche le build complet.

\- feature/<sujet> : une fonctionnalité, créée depuis dev.



\## Cycle de travail

1\. git switch dev puis git pull

2\. git switch -c feature/mon-sujet

3\. Commits, puis git push -u origin feature/mon-sujet

4\. Pull Request vers dev : Jenkins lance "Build \& Smoke"

5\. Review (1 approbation) puis Squash and merge



Jamais de commit direct sur main ni dev.



\## Commits

Format : type(portée): message

Types : feat, fix, docs, refactor, test, build, ci, chore

Exemple : feat(homework): add homework service



\## Versions (tags)

Format vX.Y.Z (SemVer). Un tag poussé depuis main déclenche le "Build versionné".

git tag -a v1.0.0 -m "Release v1.0.0"

git push origin v1.0.0

Un tag n'est jamais supprimé : en cas d'erreur, on publie v1.0.1.

