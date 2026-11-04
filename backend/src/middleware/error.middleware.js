export function notFound(_req, res) { res.status(404).json({ message: 'Ruta no encontrada.' }); }
export function errorHandler(error, _req, res, _next) {
  console.error(error);
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ya existe un registro con un valor único.' });
  if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ message: 'La referencia indicada no existe.' });
  if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ message: 'No se puede eliminar: existen registros relacionados.' });
  res.status(error.status || 500).json({ message: error.status ? error.message : 'Error interno del servidor.' });
}
