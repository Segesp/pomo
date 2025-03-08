import mongoose from 'mongoose'

// Interfaz para el documento de sesión Pomodoro
interface IPomodoroSession {
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  duration: number;
  completed: boolean;
  label: string;
  notes: string;
  createdAt: Date;
}

// Esquema para el modelo de sesión Pomodoro
const PomodoroSessionSchema = new mongoose.Schema<IPomodoroSession>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // duración en minutos
    required: true,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  label: {
    type: String,
    default: 'Trabajo',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Modelo de sesión Pomodoro
// Evitamos errores cuando la aplicación se recompila en modo de desarrollo
const PomodoroSessionModel = mongoose.models.PomodoroSession || 
  mongoose.model<IPomodoroSession>('PomodoroSession', PomodoroSessionSchema)

export default PomodoroSessionModel 