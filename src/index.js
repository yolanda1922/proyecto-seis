require("dotenv").config();
const cors = require('cors')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const express = require("express");
const connectDB = require("./config/db");

const user = require("./models/user");
const mediacion = require("./models/mediacion");

// Middleware de autenticación JWT
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No hay token, autorización denegada'
    });
  }
  
  try {
    const jwtSecret = process.env.JWT_SECRET || 'clave_secreta_por_defecto_cambiar_en_produccion';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token no válido'
    });
  }
};

const PORT = process.env.PORT || 5000;
const app = express();

connectDB();

// Middleware para parsear JSON
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// CRUD de Mediacions

// Obtener todas las mediacions
app.get("/mediacions", async (req, res) => {
  try {
    const mediacions = await mediacion.find({});
    return res.status(200).json({
      success: true,
      datos: mediacions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
});

// Obtener una mediación por ID
app.get("/mediacions/:id", async (req, res) => {
  try {
    const mediacionEncontrada = await mediacion.findById(req.params.id);
    
    if (!mediacionEncontrada) {
      return res.status(404).json({
        success: false,
        message: "Mediación no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: mediacionEncontrada,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
});

// Crear nueva mediación
app.post("/mediacions", async (req, res) => {
  try {
    // Validar que req.body existe
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "El cuerpo de la petición está vacío. Asegúrate de enviar Content-Type: application/json",
      });
    }

    console.log('Datos recibidos:', req.body);
    const { nombre, descripcion, fecha, estado } = req.body;

    // Validar campos requeridos
    if (!nombre || !descripcion || !fecha || !estado) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos: nombre, descripcion, fecha, estado",
        received: { nombre, descripcion, fecha, estado }
      });
    }

    const newMediacion = await mediacion.create({
      nombre,
      descripcion,
      fecha,
      estado,
    });

    return res.status(201).json({
      success: true,
      message: "Mediación creada exitosamente",
      data: newMediacion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
});

// Actualizar mediación
app.put("/mediacions/:id", async (req, res) => {
  try {
    const { nombre, descripcion, fecha, estado } = req.body;
    
    const mediacionActualizada = await mediacion.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, fecha, estado },
      { new: true, runValidators: true }
    );

    if (!mediacionActualizada) {
      return res.status(404).json({
        success: false,
        message: "Mediación no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mediación actualizada exitosamente",
      data: mediacionActualizada,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
});

// Eliminar mediación
app.delete("/mediacions/:id", async (req, res) => {
  try {
    const mediacionEliminada = await mediacion.findByIdAndDelete(req.params.id);

    if (!mediacionEliminada) {
      return res.status(404).json({
        success: false,
        message: "Mediación no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mediación eliminada exitosamente",
      data: mediacionEliminada,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
});






// B. usuarios
// crear un usuario
// app.post("/users/create", async (req, res) => {
//   try {
//     Validar que req.body existe
//     if (!req.body || Object.keys(req.body).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "El cuerpo de la petición está vacío. Asegúrate de enviar Content-Type: application/json",
//       });
//     }

//     console.log('Datos recibidos:', req.body);
//     const { nombre, email, password, fecha, estado } = req.body;

//     Validar campos requeridos
//     if (!nombre || !email || !password || !fecha || !estado) {
//       return res.status(400).json({
//         success: false,
//         message: "Todos los campos son requeridos: nombre, email, password, fecha, estado",
//         received: { nombre, email, password: password ? '***' : undefined, fecha, estado }
//       });
//     }

//     Validar longitud mínima de password
//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "La contraseña debe tener al menos 6 caracteres",
//       });
//     }

//     Generar hash de la contraseña
//     const salt = await bcryptjs.genSalt(10);
//     const hashedPassword = await bcryptjs.hash(password, salt);

//     const newUser = await user.create({
//       nombre,
//       email,
//       password: hashedPassword,
//       fecha,
//       estado,
//     });

//     Excluir password de la respuesta
//     const userResponse = {
//       _id: newUser._id,
//       nombre: newUser.nombre,
//       email: newUser.email,
//       fecha: newUser.fecha,
//       estado: newUser.estado,
//       createdAt: newUser.createdAt,
//       updatedAt: newUser.updatedAt
//     };

//     return res.status(201).json({
//       success: true,
//       message: "Usuario creado exitosamente",
//       data: userResponse,
//     });
//   } catch (error) {
//     Manejar errores de duplicados de MongoDB
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "El nombre de usuario o email ya existe",
//       });
//     }
//     return res.status(500).json({
//       success: false,
//       message: "Error del servidor",
//       error: error.message,
//     });
//   }
// });

// Iniciar sesión
// app.post("/users/login", async (req, res) => {
//   try {
//     Validar que req.body existe
//     if (!req.body || Object.keys(req.body).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "El cuerpo de la petición está vacío. Asegúrate de enviar Content-Type: application/json",
//       });
//     }

//     const { email, password } = req.body;

//     Validar campos requeridos
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email y contraseña son requeridos",
//         received: { email: email ? 'presente' : undefined, password: password ? 'presente' : undefined }
//       });
//     }

//     Buscar usuario por email
//     const foundUser = await user.findOne({ email });
//     if (!foundUser) {
//       return res.status(401).json({
//         success: false,
//         message: "Email o contraseña incorrectos"
//       });
//     }
    
//     Verificar contraseña
//     const correctPassword = await bcryptjs.compare(password, foundUser.password);
//     if (!correctPassword) {
//       return res.status(401).json({
//         success: false,
//         message: "Email o contraseña incorrectos"
//       });
//     }

//     Crear el token JWT
//     const payload = {
//       user: { 
//         id: foundUser._id,
//         email: foundUser.email,
//         nombre: foundUser.nombre
//       }
//     };

//     Usar una clave secreta por defecto si no está configurada
//     const jwtSecret = process.env.JWT_SECRET || 'clave_secreta_por_defecto_cambiar_en_produccion';
    
//     jwt.sign( 
//       payload, 
//       jwtSecret,
//       { expiresIn: '1h' }, // 1 hora
//       (error, token) => {
//         if (error) {
//           return res.status(500).json({
//             success: false,
//             message: "Error al generar token",
//             error: error.message
//           });
//         }

//         return res.status(200).json({
//           success: true,
//           message: "Login exitoso",
//           data: {
//             token,
//             user: {
//               id: foundUser._id,
//               nombre: foundUser.nombre,
//               email: foundUser.email,
//               estado: foundUser.estado
//             }
//           }
//         });
//       }
//     );
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error del servidor",
//       error: error.message
//     });
//   }
// });

// Verificar usuario autenticado
// app.get("/users/verificar-usuario", auth, async (req, res) => {
//   try {
//     Buscar usuario por ID excluyendo la contraseña
//     const usuario = await user.findById(req.user.id).select('-password');
    
//     if (!usuario) {
//       return res.status(404).json({
//         success: false,
//         message: "Usuario no encontrado"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Usuario verificado exitosamente",
//       data: {
//         id: usuario._id,
//         nombre: usuario.nombre,
//         email: usuario.email,
//         fecha: usuario.fecha,
//         estado: usuario.estado,
//         createdAt: usuario.createdAt,
//         updatedAt: usuario.updatedAt
//       }
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error del servidor",
//       error: error.message
//     });
//   }
// });






// CRUD de Usuarios

// Obtener todos los usuarios
// app.get("/users", async (req, res) => {
//   try {
//     const users = await user.find({}).select('-password');
//     return res.status(200).json({
//       success: true,
//       message: "Usuarios obtenidos exitosamente",
//       data: users,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error del servidor",
//       error: error.message,
//     });
//   }
// });

// Obtener un usuario por ID
// app.get("/users/:id", async (req, res) => {
//   try {
//     const usuarioEncontrado = await user.findById(req.params.id).select('-password');
    
//     if (!usuarioEncontrado) {
//       return res.status(404).json({
//         success: false,
//         message: "Usuario no encontrado",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Usuario encontrado exitosamente",
//       data: usuarioEncontrado,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error del servidor",
//       error: error.message,
//     });
//   }
// });
//     if (!req.body || Object.keys(req.body).length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "El cuerpo de la petición está vacío. Asegúrate de enviar Content-Type: application/json",
//       });
//     }

//     console.log('Datos recibidos:', req.body);
//     const { nombre, email, password, fecha, estado } = req.body;

//     // Validar campos requeridos
//     if (!nombre || !email || !password || !fecha || !estado) {
//       return res.status(400).json({
//         success: false,
//         message: "Todos los campos son requeridos: nombre, email, password, fecha, estado",
//         received: { nombre, email, password: password ? '***' : undefined, fecha, estado }
//       });
//     }

//     // Validar longitud mínima de password
//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: "La contraseña debe tener al menos 6 caracteres",
//       });
//     }

//     const newUser = await user.create({
//       nombre,
//       email,
//       password,
//       fecha,
//       estado,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Usuario creado exitosamente",
//       data: newUser,
//     });
//   } catch (error) {
//     // Manejar errores de duplicados de MongoDB
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "El nombre de usuario o email ya existe",
//       });
//     }
//     return res.status(500).json({
//       success: false,
//       message: "Error del servidor",
//       error: error.message,
//     });
//   }
// });

// Actualizar usuario
app.put("/users/:id", async (req, res) => {
  try {
    // Validar que req.body existe
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "El cuerpo de la petición está vacío. Asegúrate de enviar Content-Type: application/json",
      });
    }

    const { nombre, email, password, fecha, estado } = req.body;
    
    // Si se actualiza la contraseña, encriptarla
    let updateData = { nombre, email, fecha, estado };
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updateData.password = await bcryptjs.hash(password, salt);
    }
    
    const usuarioActualizado = await user.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!usuarioActualizado) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: usuarioActualizado,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario o email ya existe",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
});

// Eliminar usuario
app.delete("/users/:id", async (req, res) => {
  try {
    const usuarioEliminado = await user.findByIdAndDelete(req.params.id).select('-password');

    if (!usuarioEliminado) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Usuario eliminado exitosamente",
      data: usuarioEliminado,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
