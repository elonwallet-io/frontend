export function isRequired(name: string) {
    return (value: any) => {
        if (value)
            return true

        return `${name} is required.`
    }
}

export function isOTP() {
    return (value: string) => {
        if (/^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(value))
            return true

        return 'OTP must be valid.'
    }
}

export function isEmail() {
    return (value: string) => {
        if (/.+@.+\..+/.test(value))
            return true

        return 'Email must be valid.'
    }
}

export function isAlphaNumeric(name: string) {
    return (value: string) => {
        if (/^[a-zA-Z0-9]+$/.test(value))
            return true

        return `${name} must only contain latin letters and numbers.`
    }
}

export function isUnique(name: string, set: string[]) {
    return (value: string) => {
        if (set.findIndex(item => item === value) === -1)
            return true

        return `${name} must be unique.`
    }
}

export function isValidNumber(name: string) {
    return (value: any) => {
        if (!isNaN(value))
            return true

        return `${name} must be a valid number.`
    }
}

export function isGreaterThan(name: string, min: number) {
    return (value: number) => {
        if (value > min)
            return true

        return `${name} must be greater than ${min}.`
    }
}