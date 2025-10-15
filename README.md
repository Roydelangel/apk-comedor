Aquí tienes el README actualizado con una sección adicional sobre navegación:

# Bienvenido a tu aplicación Expo 👋

Este es un proyecto de [Expo](https://expo.dev) creado con [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Comenzar

1. Instalar dependencias

   ```bash
   npm install
   ```

2. Iniciar la aplicación

   ```bash
   npx expo start
   ```

En la salida del comando, encontrarás opciones para abrir la aplicación en:

- [Compilación de desarrollo](https://docs.expo.dev/develop/development-builds/introduction/)
- [Emulador de Android](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Simulador de iOS](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go) - un entorno limitado para probar el desarrollo de aplicaciones con Expo

## Navegación

Este proyecto utiliza **Expo Router** para la navegación, implementando un sistema de:
- **Enrutamiento basado en archivos** (file-system routing)
- Navegación declarativa similar a Next.js
- Soporte para diferentes tipos de navegación:
  - Stack (pilas de navegación)
  - Tabs (pestañas inferiores/superiores)
  - Drawer (menú lateral)

La estructura de archivos en el directorio `app` define automáticamente las rutas de tu aplicación. Cada archivo `.js`/`.tsx` corresponde a una ruta en la navegación, permitiendo:
- Navegación entre pantallas con `<Link>` o `router.push()`
- Deep linking nativo
- Transiciones automáticas entre plataformas
- Configuración visual de la barra de navegación

## Aprende más

Para aprender más sobre el desarrollo con Expo, consulta estos recursos:

- [Documentación de Expo](https://docs.expo.dev/): Fundamentos y [guías avanzadas](https://docs.expo.dev/guides)
- [Tutorial de Expo](https://docs.expo.dev/tutorial/introduction/): Sigue un tutorial paso a paso para crear una aplicación multiplataforma

## Únete a la comunidad

Forma parte de nuestra comunidad de desarrolladores de aplicaciones universales:

- [Expo en GitHub](https://github.com/expo/expo): Plataforma de código abierto donde puedes contribuir
- [Comunidad en Discord](https://chat.expo.dev): Chatea con otros usuarios y haz preguntas

---

_Los comandos de instalación y ejecución se mantienen en inglés por ser estándares técnicos, pero las instrucciones están traducidas para mayor claridad._