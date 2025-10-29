export default defineNitroPlugin((nitroApp) => {
  const app = (nitroApp as any).h3App;

  if (app && typeof app.set === 'function') {
    app.set('trust proxy', true);
    console.log('[nitro] trust proxy enabled');
  } else {
    console.warn('[nitro] trust proxy could not be set');
  }
});
