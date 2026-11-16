<div align="center">

# Isleta 🏝️

**Construye tu rincón en el mar.** Un juego acogedor de construir y decorar tu propia isla, en el navegador.

[![Jugar ahora](https://img.shields.io/badge/▶_Jugar_ahora-en_el_navegador-4fc3e0?style=for-the-badge)](https://virtuanista.github.io/isleta/)

![JavaScript](https://img.shields.io/badge/JavaScript-sin_dependencias-f7df1e?logo=javascript&logoColor=black)
![Canvas 2D](https://img.shields.io/badge/Canvas_2D-isométrico-e34c26)
![Web Audio](https://img.shields.io/badge/Web_Audio-sintetizado-orange)
![Licencia MIT](https://img.shields.io/badge/licencia-MIT-blue)

![Pantalla de título](docs/capturas/titulo.jpg)

</div>

## Qué es

Llegas a una isleta casi vacía y Marea, la tortuga guardiana, te ayuda a convertirla en el rincón más bonito del mar. Construyes casas y negocios, plantas naturaleza, decoras, cambias los suelos y completas misiones para ganar monedas y atraer vecinos.

![Primera partida](docs/capturas/partida.jpg)

## Cómo jugar

- **En el navegador:** entra en **[virtuanista.github.io/isleta](https://virtuanista.github.io/isleta/)**. También funciona en el móvil.
- **Sin conexión:** descarga el repositorio y abre `index.html` con doble clic. No hace falta instalar nada.

La partida se guarda sola en el almacenamiento local del navegador, y puedes tener varias islas.

## Contenido

- **Más de 40 elementos** para construir, en 4 categorías: casas, negocios, naturaleza y decoración.
- **Herramientas** para mover, rotar, cambiar los suelos y quitar elementos.
- **Personaliza tu isla**: avatar, nombre y estilo (Primavera, Tropical u Otoño).
- **Misiones** que te guían y te dan monedas y experiencia.
- **Ciclo de día y noche**, música y efectos.

## Curiosidades técnicas

- **Ni una imagen ni un archivo de sonido**: la isla, los edificios y los personajes se dibujan con Canvas 2D en perspectiva isométrica, y la música y los efectos se sintetizan con Web Audio.
- **Sin dependencias ni compilación**: HTML, CSS y JavaScript a pelo, repartidos en `js/data.js` (catálogo), `js/draw.js` (dibujo), `js/game.js` (motor y guardado), `js/ui.js` (interfaz) y `js/audio.js` (sonido).

## Licencia

Código, arte y sonido originales, publicados con licencia [MIT](LICENSE). La tipografía Fredoka (SIL Open Font License) se carga desde Google Fonts.

<details>
<summary><b>In English</b></summary>

*Isleta* is a cozy island-building game for the browser: build, decorate and complete quests to turn a tiny island into the nicest spot in the sea. All graphics are drawn with Canvas 2D and all sound is synthesized with Web Audio, with no dependencies. [Play it in your browser](https://virtuanista.github.io/isleta/).

</details>
