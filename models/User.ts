import mongoose, { Document, Model } from 'mongoose'

// Interfaz para el documento de usuario
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// Esquema para el modelo de usuario
const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Por favor, proporciona un nombre'],
    maxlength: [60, 'El nombre no puede tener más de 60 caracteres'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Por favor, proporciona un email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, proporciona un email válido'],
  },
  password: {
    type: String,
    required: [true, 'Por favor, proporciona una contraseña'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Modelo de usuario
// Evitar errores cuando la aplicación se compila en modo de desarrollo (hot reload)
const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default UserModel 