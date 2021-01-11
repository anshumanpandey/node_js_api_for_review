export default async () => {
    const requiredEnv = [
        "DB_DIALECT",
        "DB_NAME",
        "DB_USERNAME",
        "DB_PASSWORD",
        "DB_HOST",
        "JWT_SECRET"
    ];

    const missingEnv = requiredEnv.filter(k => !process.env[k]);
    if (missingEnv.length != 0) throw new Error(`Missing required ${missingEnv.join(', ')} ENV vars`)

    return   
}