# Sitio Congregación LaMadrid

Sitio estático para GitHub Pages. Lee los datos desde archivos CSV y permite imprimir cada sección.

## Archivos principales

- `index.html`: sitio principal.
- `style.css`: estilos.
- `script.js`: lectura de CSV y funciones de impresión.
- `salidas.csv`: salidas de predicación.
- `entresemana.csv`: reunión de entre semana.
- `findesemana.csv`: reunión de fin de semana.
- `config.json`: enlace al mapa online.
- `mapa.jpg`: imagen del mapa completo. Subir este archivo al repositorio.

## Formatos CSV

### salidas.csv

```csv
Fecha,Hora,Territorio,Lugar,Conductor,Observaciones
```

### entresemana.csv

```csv
Fecha,Seccion,Titulo,Asignado,Ayudante,Observaciones
```

### findesemana.csv

```csv
Fecha,Horario,Conferencia,Conferenciante,Congregacion,Atalaya,Lector,Observaciones
```

## Configuración del mapa online

Editar `config.json`:

```json
{
  "mapaOnline": "https://www.google.com/maps/..."
}
```
