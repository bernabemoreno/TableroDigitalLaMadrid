# Sitio Congregación LaMadrid - Julio 2026

Sitio estático para publicar salidas, reunión de entre semana, reunión de fin de semana y mapa.

## Cómo usarlo

1. Subí todos estos archivos a un repositorio de GitHub.
2. Activá GitHub Pages.
3. El sitio lee automáticamente los CSV del repositorio.
4. También permite cargar CSV locales desde la computadora para probar o imprimir sin subirlos.
5. Cada sección tiene botón **Imprimir**.

## Archivos del sistema

- `index.html`
- `style.css`
- `script.js`
- `salidas.csv`
- `findesemana.csv`
- `entresemana-semanas.csv`
- `entresemana-partes.csv`
- `entresemana-estudio.csv`
- `config.json`
- `mapa.jpg` opcional

## CSV de entre semana

El programa se arma con tres archivos:

### entresemana-semanas.csv

Columnas:

```csv
Semana,LecturaSemanal,CancionInicial,Presidente,Introduccion,CancionVidaCristiana,Conclusion,CancionFinal,OracionFinal,Notas,Tipo
```

### entresemana-partes.csv

Columnas:

```csv
Semana,Seccion,Orden,Titulo,Asignado,Ayudante,Observaciones
```

Secciones esperadas:

- `Tesoros de la Biblia`
- `Seamos mejores maestros`
- `Nuestra vida cristiana`

### entresemana-estudio.csv

Columnas:

```csv
Semana,Lecciones,Conductor,Lector,Observaciones
```

El Estudio bíblico de la congregación se muestra dentro de Nuestra Vida Cristiana.

## Mapa

En `config.json` cambiá el enlace:

```json
{
  "mapaOnline": "https://maps.google.com/..."
}
```

Subí la imagen completa como `mapa.jpg`.
