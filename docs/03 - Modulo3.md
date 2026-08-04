# Módulo 3 - Nuestro primer programa en Python

Hoy escribiremos muy poco código, pero probablemente aprenderás uno de los conceptos más importantes de Python.

## Clase 1 - ¿Qué ocurre cuando ejecutamos un archivo?

Cuando escribes:

```bash
python main.py
```

Python hace algo parecido a esto:

```bash
1. Busca el archivo main.py

↓

2. Lo lee de arriba hacia abajo

↓

3. Ejecuta cada instrucción en ese orden

↓

4. Finaliza el programa
```

Esto es importante porque Python ejecuta el código secuencialmente.

> ```bash
> # Por ejemplo
> print("Hola")
> print("Mateo")
> print("Crypto Tracker")
> ```
>
> La salida será:
>
> ```bash
> Hola
> Mateo
> Crypto Tracker
> ```

Nunca ejecuta la tercera línea antes que la primera.

## Clase 2 - ¿Qué es main.py?

Aquí aparece la primera diferencia con Node.

En Express seguramente hacías algo así:

```javascript
// server.js o index.js
app.listen(3000);
```

Ese archivo era el punto de entrada.

En Python ocurre exactamente lo mismo.

Normalmente por convención existe un archivo llamado: `main.py` (puede llamarse como quieras)

## Clase 3 - ¿Qué significa `__name__`?

Ahora viene la parte que más dudas genera.

Observa este código:

```bash
print(__name__)
```

¿Qué imprimirá?

Si ejecutas:

```bash
python main.py
```

La salida será:

```bash
__main__
```

Pero... ¿Por qué?
