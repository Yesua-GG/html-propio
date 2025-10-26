Paquete listo para subir: carpeta `todo/`

Contenido:
- `index.html` : Página principal de descarga y descripción.
- `privacy.html` : Política de privacidad básica (personaliza email y textos legales).
- `styles.css` : Estilos para la página.
- `assets/app-latest.apk` : Placeholder para tu APK. Reemplaza con el APK firmado antes de subir.
- `images/logo.svg` : Logo placeholder (SVG).
- `images/screenshots/` : Capturas placeholder.

Cómo personalizar antes de subir:
1. Reemplaza `assets/app-latest.apk` por tu APK firmado (mismo nombre). Si subes con otro nombre, actualiza el enlace en `index.html`.
2. Cambia el logo en `images/logo.svg` por tu imagen (PNG/SVG). Ajusta `index.html` si cambia la ruta.
3. Revisa y actualiza el enlace a Google Play en `index.html` si tu packageName es distinto.
4. Edita `privacy.html` para añadir tus datos legales y enlace a política completa.

Probar localmente:

```powershell
# Desde la raíz del proyecto o dentro de la carpeta todo
python -m http.server 8000
# Abre en el navegador: http://localhost:8000/todo/index.html  (si ejecutas desde raíz)
# O si estás dentro de la carpeta todo: http://localhost:8000/index.html
```

Subir al servidor:
- Sube la carpeta `todo/` completa a tu servidor (por FTP/SFTP) manteniendo la estructura.
- Asegúrate de que los archivos estén accesibles públicamente y que `assets/app-latest.apk` tenga permisos de lectura.

Ayuda adicional:
- Si quieres, puedo generar un `robots.txt`, `sitemap.xml` o metatags OpenGraph para compartir en redes.
- Si necesitas, ajusto la política de privacidad a tu jurisdicción.
