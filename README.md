# Congregación LaMadrid - Tablero digital

Sitio estático para GitHub Pages.

## Archivos principales

- `index.html`
- `style.css`
- `script.js`
- `salidas.csv`
- `entresemana-semanas.csv`
- `entresemana-partes.csv`
- `entresemana-estudio.csv`
- `findesemana.csv`
- `config.json`
- `mapa.jpg`

## Mapa online

El enlace está en `config.json`:

```json
{
  "mapaOnline": "https://bit.ly/4eFGdTm?r=qr"
}
```

## Salidas

Formato esperado de `salidas.csv`:

```csv
Titulo,Subtitulo,Congregacion,Periodo,Dia,Fecha,Hora,Lugar,Territorio,Conduce,Tipo,Nota
```

Tipos recomendados:

- `Casa en casa`
- `Telefónica`
- `Grupos`

El sitio lee el CSV desde GitHub, pero también permite cargar un CSV local desde la computadora para probar e imprimir sin subirlo.

## Impresión

Cada sección tiene botón de imprimir. Al imprimir se ocultan botones, pestañas y controles.
