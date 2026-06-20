/**
 * Determina si la persona autenticada es administradora (is_superuser de GeoNode).
 * Reutiliza el userInfo del store de catálogo y lo carga bajo demanda.
 *
 * Nota: es una verificación de UX. El backend (DRF) debe seguir siendo la
 * autoridad real sobre quién puede editar un recurso.
 */
export function useEsAdmin() {
  const storeCatalogo = useCatalogoStore();
  const { status } = useAuth();

  const esAdmin = computed(() => storeCatalogo.userInfo?.is_superuser === true);

  async function cargarEsAdmin() {
    if (status.value === 'authenticated' && storeCatalogo.userInfo?.is_superuser === undefined) {
      await storeCatalogo.getUserInfo();
    }
  }

  return { esAdmin, cargarEsAdmin };
}
