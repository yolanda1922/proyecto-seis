# Backend Proyecto 6 - Instrucciones para Agentes de IA

## Arquitectura del Proyecto

Este es un backend REST API de mediación construido con Node.js/Express y MongoDB. La aplicación gestiona dos entidades principales: **Mediaciones** y **Usuarios** (actualmente comentados).

### Estructura de Archivos

- **`src/index.js`** - Servidor principal con todas las rutas REST
- **`src/config/db.js`** - Configuración de conexión MongoDB
- **`src/models/`** - Esquemas Mongoose para entidades

## Patrones de Desarrollo Críticos

### 1. Estructura de Respuestas API
Todas las respuestas siguen este patrón consistente:
```javascript
// Éxito
{ success: true, data: object, message?: string }

// Error
{ success: false, message: string, error?: string }
```

### 2. Validación de Entrada
- Validación explícita de cuerpo vacío en POST/PUT
- Verificación de campos requeridos con mensajes específicos
- Logging detallado de headers y body para debugging

### 3. Manejo de Errores MongoDB
- Errores de duplicados (código 11000) se manejan específicamente
- Siempre usar `runValidators: true` en actualizaciones
- Mongoose `findByIdAndUpdate` con `new: true` para obtener documento actualizado

### 4. Convenciones de Naming
- Rutas en español: `/mediacions` (no `/mediaciones`)
- Modelos en singular: `mediacion`, `user`
- Variables en español para entidades de dominio

## Comandos de Desarrollo

```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
```

## Variables de Entorno Requeridas

- `MONGODB_URI` - Conexión a MongoDB
- `PORT` - Puerto del servidor (default: 5000)

## Entidades del Dominio

### Mediación
```javascript
{
  nombre: String (required),
  descripcion: String (required), 
  fecha: Date (required),
  estado: String (required)
}
```

### Usuario (Implementación comentada)
```javascript
{
  nombre: String (required, unique),
  email: String (required, unique),
  password: String (required, minlength: 6),
  fecha: Date (required),
  estado: String (required)
}
```

## Consideraciones Técnicas

1. **Debugging habilitado**: Middleware que loguea todas las requests
2. **Límites de payload**: 10MB para JSON y URL-encoded
3. **Timestamps automáticos**: Mongoose añade createdAt/updatedAt
4. **Validación de esquema**: Mongoose valida tipos y campos requeridos

## Al implementar nuevas funcionalidades:

- Seguir el patrón de respuesta estándar `{ success, data/message }`
- Incluir validación robusta de entrada
- Agregar logging para debugging
- Manejar errores específicos de MongoDB
- Usar español para términos de dominio, inglés para términos técnicos