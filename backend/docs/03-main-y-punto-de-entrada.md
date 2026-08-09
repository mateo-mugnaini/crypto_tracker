# Módulo 3 - El punto de entrada de una aplicación Python

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## ¿Qué es `main.py`?

`main.py` suele ser el punto de entrada de una aplicación Python.

Aunque su nombre no es obligatorio, es una convención ampliamente utilizada para indicar el archivo desde el cual comienza la ejecución del programa.

## ¿Cómo ejecuta Python un archivo?

Cuando ejecutamos:

```bash
python app/main.py
```

Python lee el archivo desde la primera línea hasta la última y ejecuta las instrucciones en ese orden.

## ¿Qué es `__name__`?

`__name__` es una variable especial creada automáticamente por Python.

- Si el archivo se ejecuta directamente, su valor será `"__main__"`.
- Si el archivo es importado por otro, su valor será el nombre del módulo.

## ¿Por qué usamos `if __name__ == "__main__":`?

Permite distinguir entre:

- Ejecutar un archivo como programa principal.
- Importarlo desde otro módulo.

Gracias a esto evitamos que se ejecute código de forma accidental al importar un archivo.

## ¿Por qué crear una función `main()`?

Encapsular el punto de entrada dentro de una función mejora la organización del código y facilita futuras ampliaciones, pruebas y reutilización.

## Comparación con Node.js

En Node.js suele existir un archivo como `index.js` o `server.js` que inicia la aplicación.

En Python, ese papel suele cumplirlo `main.py`.
