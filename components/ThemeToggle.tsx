'use client'

import { useAppContext } from '@/context/AppContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { state, toggleTheme } = useAppContext()
  const isDark = state.theme === 'dark'
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-full transition-colors duration-200
        ${isDark ? 'bg-gray-800 text-yellow-300' : 'bg-blue-50 text-blue-800'}
      `}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
      </motion.div>
    </button>
  )
} 