# Versionado

La web tiene una única versión, la del `package.json` de la raíz. Es un repositorio de una sola aplicación, así que no hay prefijos ni manifiestos por app: un número, una etiqueta `vX.Y.Z` por release.

El esquema toma la forma de [release-please](https://github.com/googleapis/release-please) (un manifiesto con la última versión publicada, commits convencionales que deciden el salto y un changelog), pero los pasos se ejecutan a mano, en la pull request que hace el trabajo.

## Los archivos que guardan el estado

| Archivo                               | Contiene                                                                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [`.versions.json`](../.versions.json) | La última versión **estable** (`{ ".": "0.1.0" }`). Equivale al manifiesto de release-please. Solo una release lo modifica. |
| [`package.json`](../package.json)     | La versión **actual**: un release candidate `X.Y.Z-rc.N` mientras haya trabajo sin publicar.                                |
| [`CHANGELOG.md`](../CHANGELOG.md)     | Una entrada por release, con _Features_ y _Bug Fixes_.                                                                      |

La versión **0.1.0** es la que está en producción (`master`) desde la fase F0. `1.0.0` queda reservada para cuando la web se dé por terminada.

## La regla

**Toda pull request hacia `develop` que toque el código de la app sube la versión a un release candidate.** El tamaño del salto sale del tipo de trabajo, medido desde la última versión estable:

| Tipo de commit                                                    | Salto | Ejemplo desde 0.1.0 |
| ----------------------------------------------------------------- | ----- | ------------------- |
| `feat`                                                            | minor | `0.2.0-rc.1`        |
| `fix`, `chore`, `refactor`, `perf`, `style`, `test`, `docs`, `ci` | patch | `0.1.1-rc.1`        |
| `feat!` (o cualquier `tipo!:`), o un pie `BREAKING CHANGE:`       | major | `1.0.0-rc.1`        |

Los major son raros a propósito: antes de 1.0.0 un cambio incompatible es solo un minor.

Cuando varias pull requests se acumulan antes de una release, **gana el salto mayor** y el contador de candidatos se reinicia debajo de él:

| #   | Trabajo            | Versión antes | Versión después |
| --- | ------------------ | ------------- | --------------- |
| 1   | `fix:`             | `0.1.0`       | `0.1.1-rc.1`    |
| 2   | `chore:`           | `0.1.1-rc.1`  | `0.1.1-rc.2`    |
| 3   | `feat:`            | `0.1.1-rc.2`  | `0.2.0-rc.1`    |
| 4   | `fix:`             | `0.2.0-rc.1`  | `0.2.0-rc.2`    |
| —   | release a `master` | `0.2.0-rc.2`  | `0.2.0`         |

El candidato siempre describe _todo lo acumulado desde la última estable_, no solo la última pull request. Un `fix` encima de un `feat` no devuelve la versión a un patch (paso 4).

## Cómo subir la versión

En la rama que hace el trabajo, cuando el cambio esté completo y los commits hechos:

```bash
npm run version:bump
```

El script lee la última estable de `.versions.json`, infiere el salto a partir de los commits de la rama desde el punto de bifurcación con `origin/develop` (o `develop` si no hay remoto; se puede forzar con la variable `BASE_REF`) y escribe el nuevo candidato en `package.json` y en `package-lock.json`. Si los tipos de commit se quedan cortos, se indica el salto a mano:

```bash
npm run version:bump -- minor
```

Haz commit del resultado como parte de la pull request: `chore: bump to 0.2.0-rc.1` es un buen mensaje. La CI lo comprueba: una pull request que toca la app sin mover la versión falla, igual que una que la mueve hacia atrás o que quita el sufijo `-rc`.

Para comprobarlo en local antes de abrir la PR:

```bash
npm run version:check -- origin/develop
```

## Publicar una release

Una release es la pull request `develop` → `master`. En ella:

1. Quita el sufijo `-rc.N` de `package.json` (y de `package-lock.json`): `0.2.0-rc.2` → `0.2.0`.
2. Copia la versión nueva en [`.versions.json`](../.versions.json).
3. Escribe la entrada de [`CHANGELOG.md`](../CHANGELOG.md): los commits desde la última estable, agrupados en **Features** y **Bug Fixes**, como hace release-please.
4. Haz merge y etiqueta lo publicado:

```bash
git tag v0.2.0 && git push --tags
```

Contra `master`, la CI exige que la versión sea estable y coincida con `.versions.json`.

## Cuándo no subir la versión

Los cambios que no son código de la app (esta documentación, `design/`, los workflows de `.github/`, los scripts, los tests) no mueven la versión. La comprobación solo exige un salto cuando la pull request toca `src/**`, `public/**`, `package.json`, `package-lock.json`, `next.config.*`, `postcss.config.*`, `tsconfig.json` o `vercel.json`.

Para el caso raro de un cambio dentro de la app que de verdad no lleva versión (corregir un comentario, por ejemplo), añade la etiqueta `skip-version-check` a la pull request y la CI lo dejará pasar.

## Cómo está conectado en la CI

La comprobación es un paso (`Check the version bump`) del job `verify` de [`PR.yml`](../.github/workflows/PR.yml), que es el check obligatorio de la rama. El `checkout` usa `fetch-depth: 0` para poder comparar con `origin/<rama base>`. Los scripts están en [`scripts/`](../scripts) (Node, sin dependencias, iguales en Windows y en Linux) y la aritmética de versiones, en `scripts/lib/version.mjs`, con tests en `tests/version.test.ts`.
