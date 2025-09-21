'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface CustomSelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
  required?: boolean
  id?: string
  name?: string
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  error = false,
  required = false,
  id,
  name
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const selectRef = useRef<HTMLDivElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex(prev => {
            const nextIndex = prev < options.length - 1 ? prev + 1 : 0
            return options[nextIndex]?.disabled ? nextIndex + 1 : nextIndex
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : options.length - 1
            return options[nextIndex]?.disabled ? nextIndex - 1 : nextIndex
          })
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedIndex >= 0 && !options[focusedIndex]?.disabled) {
            handleOptionSelect(options[focusedIndex].value)
          }
          break
        case 'Escape':
          setIsOpen(false)
          setFocusedIndex(-1)
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, focusedIndex, options])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setFocusedIndex(-1)
    }
  }

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setFocusedIndex(-1)
  }

  const baseClasses = `
    relative w-full px-4 py-3 bg-white border rounded-lg cursor-pointer
    transition-all duration-200 ease-in-out
    flex items-center justify-between
    focus:outline-none focus:ring-2 focus:ring-primary-forest focus:border-transparent
    ${error ? 'border-red-500' : 'border-secondary-gray'}
    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400 hover:shadow-md'}
    ${isOpen ? 'border-primary-forest ring-2 ring-primary-forest ring-opacity-20' : ''}
  `

  return (
    <div className="relative" ref={selectRef}>
      <input type="hidden" name={name} value={value || ''} />

      <div
        id={id}
        className={`${baseClasses} ${className}`.trim()}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-required={required}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div
          ref={optionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`
                px-4 py-3 cursor-pointer transition-colors duration-150
                flex items-center justify-between
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-cream'}
                ${focusedIndex === index ? 'bg-primary-cream' : ''}
                ${value === option.value ? 'bg-primary-forest text-white' : 'text-gray-900'}
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === options.length - 1 ? 'rounded-b-lg' : ''}
              `}
              onClick={() => !option.disabled && handleOptionSelect(option.value)}
              role="option"
              aria-selected={value === option.value}
              onMouseEnter={() => !option.disabled && setFocusedIndex(index)}
            >
              <span className="truncate">{option.label}</span>
              {value === option.value && (
                <CheckIcon className="w-4 h-4 ml-2 flex-shrink-0" />
              )}
            </div>
          ))}

          {options.length === 0 && (
            <div className="px-4 py-3 text-gray-500 text-center">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  )
}