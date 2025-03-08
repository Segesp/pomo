'use client'

import { useAppContext } from '@/context/AppContext'
import { FiSun, FiMoon } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { state, toggleTheme } = useAppContext()
  const isDark = state.theme === 'dark'
  
  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors bg-secondary hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      whileTap={{ scale: 0.95 }}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, scale: [0.8, 1.1, 1] }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        className="text-primary"
      >
        {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
      </motion.div>
    </motion.button>
  )
} 