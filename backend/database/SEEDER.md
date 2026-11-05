# Datos de prueba de Dalssi

El seeder carga datos relacionados para probar el sistema completo desde el frontend.

## Ejecutar

```bash
npm run db:seed
```

El seeder no borra datos existentes. Si `personas` ya contiene registros, se detiene para evitar duplicados.

Incluye:
- 16 personas
- 5 clientes
- 6 huéspedes
- 5 empleados
- 4 puestos
- 5 países
- 4 tipos de habitación
- 10 habitaciones
- 4 categorías de servicios
- 8 servicios
- 6 reservaciones
- detalles de habitaciones y huéspedes
- servicios asociados a reservaciones
- 5 pagos
- 4 facturas y sus detalles
