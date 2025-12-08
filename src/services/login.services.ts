import { verifyEmail, getPasswordByEmail, getIdByEmail } from './users.services';
import { verifyPassword } from './password.services';
import { createToken } from './token.services';

export async function loginUser(email: string, password: string) {
    if (verifyEmail(email) > 0) {
        const hashedPassword = getPasswordByEmail(email)
        if (!hashedPassword) {
            return { error: 'Invalid email or password' };
        }
        if (await verifyPassword(hashedPassword, password)) {
            const id = await getIdByEmail(email)
            const jsonid = { id: id }
            const token = createToken(jsonid)
            return {
                message: 'Login successful',
                token: token,
            };
        } else {
            return { error: 'Invalid email or password' };
        }
    } else {
        return { error: 'Invalid email or password' };
    }
}
