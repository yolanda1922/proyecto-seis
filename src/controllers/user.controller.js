const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.createUser = async (req, res) => {
const { nombre, email, password, fecha, estado} = req.body      
  try {
    let foundUser = await User.findOne({ email })
    if (foundUser) {
      return res.status(400).json({msg : "El usuario ya existe"})
    }
    // Generemos un fragmento aleatorio para usarse con el password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    // creamos un usuario con su password encriptado
    const responseDB = await User.create({
      nombre, 
      email, 
      password: hashedPassword,
      fecha,
      estado
        })
        
        if (!responseDB) {
      return res.status(400).json({
        success: false,
        message: "No se pudo crear el usuario"
      })
    }
    
    // usuario creado
    return res.status(201).json({
      success: true,
      data: responseDB
    })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Error del servidor",
        error: error.message
      })
    }
  }

// crear un usuario
app.post("/users/create", async (req, res) => {
  try {
    // Validar que req.body existe
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "El cuerpo de la petición está vacío. Asegúrate de enviar Content-Type: application/json",
      });
    }

    console.log('Datos recibidos:', req.body);
    const { nombre, email, password, fecha, estado } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password || !fecha || !estado) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos: nombre, email, password, fecha, estado",
        received: { nombre, email, password: password ? '***' : undefined, fecha, estado }
      });
    }

    // Validar longitud mínima de password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      nombre,
      email,
      password: hashedPassword,
      fecha,
      estado,
    });

    // Excluir password de la respuesta
    const userResponse = {
      _id: newUser._id,
      nombre: newUser.nombre,
      email: newUser.email,
      fecha: newUser.fecha,
      estado: newUser.estado,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    return res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: userResponse,
    });
  } catch (error) {
    // Manejar errores de duplicados de MongoDB
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
  
// Iniciar sesión
app.post("/users/login", async (req, res) => {
  try {
    // Validar que req.body existe
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "El cuerpo de la petición está vacío. Asegúrate de enviar Content-Type: application/json",
      });
    }

    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
        received: { email: email ? 'presente' : undefined, password: password ? 'presente' : undefined }
      });
    }

    // Buscar usuario por email
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.status(401).json({
        success: false,
        message: "Email o contraseña incorrectos"
      });
    }
    
    // Verificar contraseña
    const correctPassword = await bcrypt.compare(password, foundUser.password);
    if (!correctPassword) {
      return res.status(401).json({
        success: false,
        message: "Email o contraseña incorrectos"
      });
    }

    // Crear el token JWT
    const payload = {
      user: { 
        id: foundUser._id,
        email: foundUser.email,
        nombre: foundUser.nombre
      }
    };

    // Usar una clave secreta por defecto si no está configurada
    const jwtSecret = process.env.JWT_SECRET || 'clave_secreta_por_defecto_cambiar_en_produccion';
    
    jwt.sign( 
      payload, 
      jwtSecret,
      { expiresIn: '1h' }, // 1 hora
      (error, token) => {
        if (error) {
          return res.status(500).json({
            success: false,
            message: "Error al generar token",
            error: error.message
          });
        }

        return res.status(200).json({
          success: true,
          message: "Login exitoso",
          data: {
            token,
            user: {
              id: foundUser._id,
              nombre: foundUser.nombre,
              email: foundUser.email,
              estado: foundUser.estado
            }
          }
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message
    });
  }
});

// Verificar usuario autenticado
app.get("/users/verificar-usuario", auth, async (req, res) => {
  try {
    // Buscar usuario por ID excluyendo la contraseña
    const usuario = await User.findById(req.user.id).select('-password');
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Usuario verificado exitosamente",
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        fecha: usuario.fecha,
        estado: usuario.estado,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message
    });
  }
});


// Obtener todos los usuarios
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    return res.status(200).json({
      success: true,
      message: "Usuarios obtenidos exitosamente",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
});

// Obtener un usuario por ID
app.get("/users/:id", async (req, res) => {
  try {
    const usuarioEncontrado = await User.findById(req.params.id).select('-password');
    
    if (!usuarioEncontrado) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Usuario encontrado exitosamente",
      data: usuarioEncontrado,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
});