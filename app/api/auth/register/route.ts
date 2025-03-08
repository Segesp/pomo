import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: Request) {
  try {
    console.log('Iniciando proceso de registro...')
    
    // Obtener y validar los datos del request
    let requestData;
    try {
      requestData = await request.json()
    } catch (e) {
      console.error('Error al parsear el JSON de la solicitud:', e)
      return NextResponse.json(
        { message: 'Datos de solicitud inválidos' },
        { status: 400 }
      )
    }
    
    const { name, email, password } = requestData
    console.log('Datos recibidos:', { name, email, password: password ? '***' : undefined })

    // Validaciones básicas
    if (!name || !email || !password) {
      console.log('Validación fallida: campos obligatorios faltantes')
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Validación fallida: formato de email inválido')
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      console.log('Validación fallida: contraseña demasiado corta')
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Intentar conectar a MongoDB
    try {
      console.log('Intentando conectar a la base de datos...')
      
      try {
        // Usar la función conectDB mejorada
        await connectDB()
        console.log('Conexión a MongoDB establecida')
      } catch (connError: any) {
        console.error('Error al conectar a MongoDB:', connError)
        return NextResponse.json(
          { message: `Error al conectar a la base de datos: ${connError.message}` },
          { status: 500 }
        )
      }
      
      // Verificar si el usuario ya existe
      console.log('Verificando si el usuario ya existe...')
      let userExists;
      
      try {
        userExists = await User.findOne({ email })
      } catch (findError: any) {
        console.error('Error al buscar usuario:', findError)
        return NextResponse.json(
          { message: `Error al verificar usuario existente: ${findError.message}` },
          { status: 500 }
        )
      }
      
      if (userExists) {
        console.log('El email ya está registrado')
        return NextResponse.json(
          { message: 'El email ya está registrado' },
          { status: 409 }
        )
      }

      // Encriptar contraseña
      console.log('Encriptando contraseña...')
      let hashedPassword;
      
      try {
        hashedPassword = await bcrypt.hash(password, 10)
      } catch (hashError: any) {
        console.error('Error al encriptar contraseña:', hashError)
        return NextResponse.json(
          { message: 'Error al procesar la contraseña' },
          { status: 500 }
        )
      }

      // Crear usuario
      console.log('Creando nuevo usuario...')
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      })

      try {
        await newUser.save()
        console.log('Usuario registrado correctamente')
      } catch (saveError: any) {
        console.error('Error al guardar usuario:', saveError)
        return NextResponse.json(
          { message: `Error al guardar usuario: ${saveError.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { message: 'Usuario registrado correctamente' },
        { status: 201 }
      )
    } catch (dbError: any) {
      console.error('Error en la operación de base de datos:', dbError)
      return NextResponse.json(
        { message: `Error en la base de datos: ${dbError.message || 'Error desconocido'}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error general al registrar usuario:', error)
    return NextResponse.json(
      { message: `Error al procesar la solicitud: ${error.message || 'Error desconocido'}` },
      { status: 500 }
    )
  }
} 