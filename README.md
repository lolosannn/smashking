# Smash King

Landing page para Smash King (Burgers &amp; Drinks), hecha en HTML/CSS/JS puro (sin
build step) para poder iterar directo en GitHub Pages y luego desplegar en Vercel sin
configuración extra.

Este sitio parte del esqueleto funcional de [Smash Burger](https://github.com/lolosannn/SmashBurger)
(el mismo layout, preloader, menú admin-editable y armador de pedido por WhatsApp),
adaptado a la identidad visual de Smash King: paleta negro / rosa / dorado, tipografías
Fredoka + Nunito y el mascotón con corona en vez de fotos de stock.

## Ver en local

Abrí `index.html` en el navegador, o serví la carpeta con cualquier servidor estático:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Estructura

```
index.html        # markup y contenido
css/style.css      # design tokens + estilos
js/main.js         # preloader, header on scroll, menú mobile, render del menú
js/order.js        # armador de pedido + envío por WhatsApp
js/about-carousel.js # carrusel de fotos de "Nuestra historia"
menu.json          # datos del menú (nombre, descripción, precio, etiqueta, foto)
about.json         # fotos del carrusel "Nuestra historia" (arranca vacío)
config.json        # link de Google Maps
images/            # fotos reales del local (se suben desde admin.html)
admin.html         # panel para editar menu.json/about.json y subir fotos sin tocar código
```

## Editar el menú

No hace falta tocar código ni GitHub a mano: abrí **`admin.html`**, pegá un token de
GitHub con permiso de escritura sobre este repo, y desde ahí podés agregar, sacar,
reordenar y editar platos (nombre, descripción, precio, etiqueta, foto), las fotos del
carrusel "Nuestra historia" y el link de Google Maps. Los cambios se guardan directo en
`menu.json` / `about.json` / `config.json` y en `images/`, y el sitio los toma solo.

## Diseño

- **Paleta**: fondo negro (`--black`), rosa chicle (`--pink`) y dorado (`--gold`) sobre
  tarjetas claras (`--surface`), inspirada en la identidad real del local (menú y logo
  en Instagram: negro de fondo, rosa y dorado como acentos, corona como ícono de marca).
- **Tipografías**: [Fredoka](https://fonts.google.com/specimen/Fredoka) para
  títulos/branding, [Nunito](https://fonts.google.com/specimen/Nunito) para texto de
  cuerpo — mismas familias que el esqueleto original, que ya calzan con el estilo
  redondeado y grueso del logo de Smash King.
- **Preloader**: mismo mecanismo del esqueleto original (armado de la burger + cortina
  de colores), recoloreado a rosa → magenta → negro y con una corona sumada al logo.
- **Mascota / hero**: en vez de una foto de producto, el hero usa la burger ilustrada
  en CSS (ya parte del esqueleto original) con una corona SVG arriba — no depende de
  ningún archivo de imagen.
- **Menú sin fotos todavía**: las burgers, extras y precios están transcriptos del menú
  real del local. Como todavía no hay fotografía propia, cada carta muestra un ícono de
  placeholder en vez de una foto — apenas se suba una foto real desde `admin.html` para
  un plato, se muestra automáticamente.

## Pendiente de personalizar (antes de publicar)

- **WhatsApp real** (`js/order.js`, constante `WHATSAPP_NUMBER`) — hoy tiene un número
  de relleno.
- **Dirección, teléfono y horarios reales** (sección `#ubicacion` y footer de
  `index.html`).
- **Link de Google Maps real** (se puede cargar desde `admin.html` → "Ubicación en
  Google Maps").
- **Redes sociales** (los `href="#"` en el footer).
- **Fotos reales** del local y de los platos (se suben desde `admin.html`).

## Nota sobre `index.html` en local

El menú se carga con `fetch("menu.json")`, que los navegadores bloquean si abrís
`index.html` directo desde el disco (`file://`). Para verlo en local, serví la carpeta
con un servidor estático (ver arriba) en vez de abrir el archivo con doble click.

## Deploy

- **GitHub Pages**: Settings → Pages → Deploy from branch → `main` / `/root`.
- **Vercel**: importá el repo, framework "Other", sin build command — sirve `index.html` tal cual.
