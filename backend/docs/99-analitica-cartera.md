# Módulo 23: analítica personal

`GET /portfolio/analytics?days=30&benchmark_coin_id=bitcoin` calcula métricas sobre las operaciones del usuario y los snapshots de `price_history` disponibles en el período.

La respuesta incluye:

- `points`: valor de la cartera y costo invertido por snapshot.
- `assets`: cantidad, costo, valor actual, resultado y distribución por activo.
- `total_return_percentage`: variación entre el primer y el último valor observado.
- `max_drawdown_percentage`: mayor caída desde un máximo observado.
- `volatility_percentage`: desviación estándar de los retornos observados, anualizada de forma descriptiva.
- `benchmark`: variación normalizada de la moneda elegida, si se solicita.

Si faltan snapshots, la API no rellena datos artificiales: devuelve los puntos disponibles y valores nulos cuando no puede calcular una métrica. La analítica es informativa y no constituye asesoramiento financiero.

El frontend expone períodos de 7, 30 y 90 días, un benchmark opcional de BTC/ETH, gráfico SVG accesible, tabla equivalente y descarga CSV.
