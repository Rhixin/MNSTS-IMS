'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export interface SearchableOption {
  value: string
  label: string
  searchText?: string // Additional text to search on
  disabled?: boolean
}

interface SearchableSelectProps {
  options: SearchableOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
  required?: boolean
  id?: string
  name?: string
  emptyMessage?: string
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search and select...",
  disabled = false,
  className = "",
  error = false,
  required = false,
  id,
  name,
  emptyMessage = "No items found"
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const selectRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const labelMatch = option.label.toLowerCase().includes(searchLower)
    const searchTextMatch = option.searchText?.toLowerCase().includes(searchLower)

    return labelMatch || searchTextMatch
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
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
            const nextIndex = prev < filteredOptions.length - 1 ? prev + 1 : 0
            return filteredOptions[nextIndex]?.disabled ? nextIndex + 1 : nextIndex
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : filteredOptions.length - 1
            return filteredOptions[nextIndex]?.disabled ? nextIndex - 1 : nextIndex
          })
          break
        case 'Enter':
          event.preventDefault()
          if (focusedIndex >= 0 && !filteredOptions[focusedIndex]?.disabled) {
            handleOptionSelect(filteredOptions[focusedIndex].value)
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSearchTerm('')
          setFocusedIndex(-1)
          inputRef.current?.blur()
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, focusedIndex, filteredOptions])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
    setFocusedIndex(-1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setFocusedIndex(-1)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const displayText = selectedOption?.label || ''

  const baseClasses = `
    relative w-full bg-white border rounded-lg cursor-pointer
    transition-all duration-200 ease-in-out
    focus-within:ring-2 focus-within:ring-primary-forest focus-within:border-transparent
    ${error ? 'border-red-500' : 'border-secondary-gray'}
    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-gray-400 hover:shadow-md'}
    ${isOpen ? 'border-primary-forest ring-2 ring-primary-forest ring-opacity-20' : ''}
  `

  return (
    <div className="relative" ref={selectRef}>
      <input type="hidden" name={name} value={value || ''} />

      <div className={`${baseClasses} ${className}`.trim()}>
        <div className="flex items-center">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />

          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              className="flex-1 px-3 py-3 bg-transparent border-none outline-none placeholder-gray-500 shadow-none focus:shadow-none focus:ring-0 focus:outline-none"
              placeholder="Type to search..."
              disabled={disabled}
              style={{
                border: 'none',
                boxShadow: 'none',
                outline: 'none'
              }}
            />
          ) : (
            <div
              className="flex-1 px-3 py-3 cursor-pointer"
              onClick={handleToggle}
            >
              <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                {displayText || placeholder}
              </span>
            </div>
          )}

          <ChevronDownIcon
            className={`w-5 h-5 text-gray-400 mr-3 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            onClick={handleToggle}
          />
        </div>
      </div>

      {isOpen && (
        <div
          ref={optionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={`
                  px-4 py-3 cursor-pointer transition-colors duration-150
                  flex items-center justify-between
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-cream'}
                  ${focusedIndex === index ? 'bg-primary-cream' : ''}
                  ${value === option.value ? 'bg-primary-forest text-white' : 'text-gray-900'}
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === filteredOptions.length - 1 ? 'rounded-b-lg' : ''}
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
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  )
}