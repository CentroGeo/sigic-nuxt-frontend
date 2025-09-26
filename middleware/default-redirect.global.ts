// SPDX-FileCopyrightText: 2025 CentroGeo
// SPDX-FileContributor: César Benjamín <cesarbenjamindotnet@gmail.com>
// SPDX-License-Identifier: MIT
//
// Descripción:
//   Middleware global de Nuxt 3 que redirige dinámicamente desde la raíz ("/")
//   hacia una página por defecto definida en `runtimeConfig.public.defaultPage`.
//   - Si `defaultPage` está definido y no es "/", hace la redirección.
//   - Si no existe o es "/", permanece en la raíz.
//   Esto permite configurar la página de inicio de la aplicación según el entorno.

export default defineNuxtRouteMiddleware((to) => {
  // Solo aplicar cuando entras exactamente a "/"
  if (to.path === '/') {
    const config = useRuntimeConfig();

    // Si existe la variable, redirige
    if (config.public.defaultPage && config.public.defaultPage !== '/') {
      return navigateTo(config.public.defaultPage);
    }

    // Si no existe (o es "/"), se queda en la raíz normal
  }
});
