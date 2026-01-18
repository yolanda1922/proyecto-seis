const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let { authorization } = req.headers;
  
  if (!authorization) {
    return res.status(401).json({ msg: "Acceso no autorizado" });
  }
  try {
    // obtenemos el token y el tipo de autorización desde la autorización
    let [type, token] = authorization.split(" ");
    // validamos que el tipo sea Token o Bearer.
    if (type === "Token" || type === "Bearer") {
      // confirmamos la verificación del token a través de la librería de JWT
      const openToken = jwt.verify(token, process.env.SECRET);
      req.user = openToken.user;
    
      // next, al invocarse, permite avanzar a la siguiente función
      next();
    } else {
      // si no se especifica Token o Bearer, enviamos error
      return res.status(401).json({ msg: "Acceso no autorizado" });
    }
  } catch (error) {
    res.json({ msg: "Hubo un  error", error });
  }
};
