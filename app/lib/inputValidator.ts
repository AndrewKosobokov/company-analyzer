/**
 * Input Validation Utility
 * Provides comprehensive validation for all user inputs
 */

import { NextResponse } from 'next/server'
import { errorHandler, ErrorType } from './errorHandler'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedData?: any
}

class InputValidator {
  private static instance: InputValidator

  static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator()
    }
    return InputValidator.instance
  }

  /**
   * Validate INN (Individual Tax Number) or OGRN
   */
  validateINN(inn: string): ValidationResult {
    const errors: string[] = []
    
    if (!inn) {
      errors.push('ИНН/ОГРН обязателен для заполнения')
      return { isValid: false, errors }
    }

    // Remove all non-digit characters
    const cleanINN = inn.replace(/\D/g, '')
    
    if (cleanINN.length !== 10 && cleanINN.length !== 13) {
      errors.push('ИНН должен содержать 10 цифр, ОГРН - 13 цифр')
      return { isValid: false, errors }
    }

    // Validate INN checksum (10 digits)
    if (cleanINN.length === 10) {
      if (!this.validateINNChecksum(cleanINN)) {
        errors.push('Некорректный ИНН')
        return { isValid: false, errors }
      }
    }

    // Validate OGRN checksum (13 digits)
    if (cleanINN.length === 13) {
      if (!this.validateOGRNChecksum(cleanINN)) {
        errors.push('Некорректный ОГРН')
        return { isValid: false, errors }
      }
    }

    return {
      isValid: true,
      errors: [],
      sanitizedData: cleanINN
    }
  }

  /**
   * Validate INN checksum (10 digits)
   */
  private validateINNChecksum(inn: string): boolean {
    const weights1 = [2, 4, 10, 3, 5, 9, 4, 6, 8]
    const weights2 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
    
    let sum1 = 0
    let sum2 = 0
    
    for (let i = 0; i < 9; i++) {
      sum1 += parseInt(inn[i]) * weights1[i]
    }
    
    const checkDigit1 = sum1 % 11
    const validCheckDigit1 = checkDigit1 < 2 ? checkDigit1 : checkDigit1 % 10
    
    if (parseInt(inn[9]) !== validCheckDigit1) {
      return false
    }
    
    for (let i = 0; i < 10; i++) {
      sum2 += parseInt(inn[i]) * weights2[i]
    }
    
    const checkDigit2 = sum2 % 11
    const validCheckDigit2 = checkDigit2 < 2 ? checkDigit2 : checkDigit2 % 10
    
    return parseInt(inn[9]) === validCheckDigit2
  }

  /**
   * Validate OGRN checksum (13 digits)
   */
  private validateOGRNChecksum(ogrn: string): boolean {
    const num = BigInt(ogrn.slice(0, 12))
    const remainder = num % BigInt(11)
    const checkDigit = remainder < BigInt(2) ? remainder : remainder % BigInt(10)
    
    return parseInt(ogrn[12]) === Number(checkDigit)
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): ValidationResult {
    const errors: string[] = []
    
    if (!email) {
      errors.push('Email обязателен для заполнения')
      return { isValid: false, errors }
    }

    // Basic email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    
    if (!emailRegex.test(email)) {
      errors.push('Некорректный формат email')
      return { isValid: false, errors }
    }

    // Check length
    if (email.length > 254) {
      errors.push('Email слишком длинный')
      return { isValid: false, errors }
    }

    // Check for suspicious patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      errors.push('Некорректный формат email')
      return { isValid: false, errors }
    }

    return {
      isValid: true,
      errors: [],
      sanitizedData: email.toLowerCase().trim()
    }
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): ValidationResult {
    const errors: string[] = []
    
    if (!password) {
      errors.push('Пароль обязателен для заполнения')
      return { isValid: false, errors }
    }

    if (password.length < 8) {
      errors.push('Пароль должен содержать минимум 8 символов')
    }

    if (password.length > 128) {
      errors.push('Пароль слишком длинный')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Пароль должен содержать строчные буквы')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Пароль должен содержать заглавные буквы')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Пароль должен содержать цифры')
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Пароль должен содержать специальные символы')
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '12345678', 'qwerty123', 'admin123']
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Пароль слишком простой')
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: password
    }
  }

  /**
   * Validate user name
   */
  validateName(name: string): ValidationResult {
    const errors: string[] = []
    
    if (!name) {
      errors.push('Имя обязательно для заполнения')
      return { isValid: false, errors }
    }

    if (name.length < 2) {
      errors.push('Имя должно содержать минимум 2 символа')
    }

    if (name.length > 50) {
      errors.push('Имя слишком длинное')
    }

    // Allow only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Zа-яА-Я\s\-']+$/
    if (!nameRegex.test(name)) {
      errors.push('Имя может содержать только буквы, пробелы, дефисы и апострофы')
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: name.trim()
    }
  }

  /**
   * Validate organization name
   */
  validateOrganizationName(name: string): ValidationResult {
    const errors: string[] = []
    
    if (!name) {
      return { isValid: true, errors: [], sanitizedData: null }
    }

    if (name.length < 2) {
      errors.push('Название организации должно содержать минимум 2 символа')
    }

    if (name.length > 200) {
      errors.push('Название организации слишком длинное')
    }

    // Allow letters, numbers, spaces, and common punctuation
    const orgRegex = /^[a-zA-Zа-яА-Я0-9\s\-'.,()]+$/
    if (!orgRegex.test(name)) {
      errors.push('Название организации содержит недопустимые символы')
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: name.trim()
    }
  }

  /**
   * Validate phone number
   */
  validatePhone(phone: string): ValidationResult {
    const errors: string[] = []
    
    if (!phone) {
      return { isValid: true, errors: [], sanitizedData: null }
    }

    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    
    // Check if it's a valid Russian phone number
    const phoneRegex = /^(\+7|7|8)?[0-9]{10}$/
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Некорректный формат номера телефона')
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: cleanPhone
    }
  }

  /**
   * Validate registration data
   */
  validateRegistration(data: any): ValidationResult {
    const errors: string[] = []
    const sanitizedData: any = {}

    // Validate email
    const emailResult = this.validateEmail(data.email)
    if (!emailResult.isValid) {
      errors.push(...emailResult.errors)
    } else {
      sanitizedData.email = emailResult.sanitizedData
    }

    // Validate password
    const passwordResult = this.validatePassword(data.password)
    if (!passwordResult.isValid) {
      errors.push(...passwordResult.errors)
    } else {
      sanitizedData.password = passwordResult.sanitizedData
    }

    // Validate name (optional)
    if (data.name) {
      const nameResult = this.validateName(data.name)
      if (!nameResult.isValid) {
        errors.push(...nameResult.errors)
      } else {
        sanitizedData.name = nameResult.sanitizedData
      }
    }

    // Validate organization name (optional)
    if (data.organizationName) {
      const orgResult = this.validateOrganizationName(data.organizationName)
      if (!orgResult.isValid) {
        errors.push(...orgResult.errors)
      } else {
        sanitizedData.organizationName = orgResult.sanitizedData
      }
    }

    // Validate INN (optional)
    if (data.inn) {
      const innResult = this.validateINN(data.inn)
      if (!innResult.isValid) {
        errors.push(...innResult.errors)
      } else {
        sanitizedData.inn = innResult.sanitizedData
      }
    }

    // Validate phone (optional)
    if (data.phone) {
      const phoneResult = this.validatePhone(data.phone)
      if (!phoneResult.isValid) {
        errors.push(...phoneResult.errors)
      } else {
        sanitizedData.phone = phoneResult.sanitizedData
      }
    }

    // Validate plan
    if (data.plan) {
      const validPlans = ['trial', 'start', 'optimal', 'profi']
      if (!validPlans.includes(data.plan)) {
        errors.push('Некорректный тарифный план')
      } else {
        sanitizedData.plan = data.plan
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    }
  }

  /**
   * Validate analysis request data
   */
  validateAnalysisRequest(data: any): ValidationResult {
    const errors: string[] = []
    const sanitizedData: any = {}

    // Validate company ID (INN/OGRN)
    if (!data.companyId) {
      errors.push('ИНН/ОГРН компании обязателен для заполнения')
      return { isValid: false, errors }
    }

    const innResult = this.validateINN(data.companyId)
    if (!innResult.isValid) {
      errors.push(...innResult.errors)
      return { isValid: false, errors }
    }

    sanitizedData.companyId = innResult.sanitizedData

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    }
  }

  /**
   * Create validation error response
   */
  createValidationErrorResponse(errors: string[]): NextResponse {
    return errorHandler.createErrorResponse(
      errors.join('. '),
      400,
      ErrorType.VALIDATION
    )
  }
}

export const inputValidator = InputValidator.getInstance()

