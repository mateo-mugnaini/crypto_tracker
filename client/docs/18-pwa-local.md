# PWA y experiencia offline local

## Qué está implementado

- manifest instalable con nombre, colores, ruta de inicio e icono;
- registro del service worker en builds de producción;
- caché del shell y de recursos estáticos del mismo origen;
- fallback de navegación al `index.html` cacheado cuando no hay red;
- exclusión de respuestas de API, SSE, cartera y tokens del caché;
- aviso visible cuando el dispositivo queda offline y recuperación automática al
  volver la conexión.

## Cómo probarlo

El service worker no se registra durante `npm run dev`. Genera y sirve una build:

```powershell
npm run build
npm run preview
```

En el navegador, abre DevTools → Application → Service Workers y verifica el
registro. Luego usa Network → Offline para comprobar que el shell abre y que la
interfaz informa que los precios podrían estar desactualizados.

Para comprobar una actualización, vuelve a ejecutar el build, recarga online y
confirma que el nuevo `index.html` y sus chunks se actualicen. Nunca se debe
interpretar una pantalla offline como datos live.

## Datos que no se persisten

No se cachean respuestas de endpoints, eventos SSE, tokens ni información de la
cartera. La preferencia de moneda tampoco se activa todavía: los datos del
backend están expresados en USD y mostrar otra divisa sin una tasa verificable
sería incorrecto. Tema, densidad y moneda configurable quedan como evolución
posterior, con almacenamiento limitado a preferencias no sensibles.
