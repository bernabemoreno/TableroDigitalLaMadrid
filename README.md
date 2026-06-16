# Congregación LaMadrid - Tablero digital

Sitio estático para GitHub Pages y uso local. Muestra:

- Salidas
- Reunión de entre semana
- Reunión de fin de semana
- Mapa de la congregación

## Archivos CSV

### salidas.csv

```csv
Fecha,Hora,Territorio,Lugar,Conductor,Observaciones
```

### entresemana-semanas.csv

```csv
Semana,LecturaSemanal,CancionInicial,Presidente,Introduccion,CancionVidaCristiana,Conclusion,CancionFinal,OracionFinal,Notas,Tipo
```

### entresemana-partes.csv

```csv
Semana,Seccion,Orden,Titulo,Asignado,Ayudante,Observaciones
```

Secciones aceptadas:

- Tesoros de la Biblia
- Seamos mejores maestros
- Nuestra vida cristiana

### entresemana-estudio.csv

```csv
Semana,Lecciones,Conductor,Lector,Observaciones
```

### findesemana.csv

```csv
Fecha,Presidente,OradorVisitante,NumeroConferencia,TituloConferencia,Atalaya,LectorAtalaya,OradorSaliente,NumeroSaliente,Limpieza,CongregacionAsignada,Observaciones
```

## Uso en GitHub Pages

Subí todos los archivos del proyecto al repositorio. El sitio lee automáticamente los CSV con esos nombres.

## Uso local para imprimir

Entrá al sitio y usá los botones de carga local para seleccionar CSV desde la computadora. No se suben a internet; solo se leen en el navegador para ver/imprimir.

## Mapa

- `mapa.jpg`: imagen local del mapa para vista previa y descarga.
- `config.json`: contiene el enlace online del mapa.
