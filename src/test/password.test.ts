import { expect, test } from 'vitest'
import { hashPassword } from '../services/password.services'
import { capitalize } from '../services/users.services'
import { isValidEmail } from '../services/users.services'
// ...existing code...
// test('adds 1 + 2 to equal 3', () => {
//   expect(sum(1, 2)).toBe(3)
// })

test('hashPassword should return a hashed password', async () => {
    const password = 'mySecurePassword123!'
    const hashedPassword = await hashPassword(password)
    expect(hashedPassword).not.toBe(password)

}
)

test('capitalize should capitalize the first letter of a string', async () => {
    const city1 = 'paris'
    const capitalizedCity1 = await capitalize(city1)
    expect(capitalizedCity1).toBe('Paris')
    const city2 = 'PARIS'
    const capitalizedCity2 = await capitalize(city2)
    expect(capitalizedCity2).toBe('Paris')
    const city3 = 'p a r i s '
    const capitalizedCity3 = await capitalize(city3)
    expect(capitalizedCity3).toBe('Paris')
}
)


test('isValidEmail should validate email format', () => {
    const validEmails = [
    "test@example.com",
    "john.doe@company.co",
    "user+label@sub.domain.org",
    "firstname.lastname@domain.fr"
    ]
    const invalidEmails = [
    "plainaddress",
    "@missingusername.com",
    "username@.nodomain",
    "username@domain,com",
    "username@domain..com",
    "username@domain"
    ]
    validEmails.forEach(email => {
        expect(isValidEmail(email), `Échec pour l'email valide: ${email}`).toBe(true)
    })
    invalidEmails.forEach(email => {
        expect(isValidEmail(email), `Échec pour l'email valide: ${email}`).toBe(false)

    })
})



