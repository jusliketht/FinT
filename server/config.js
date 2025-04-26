// Development environment configuration
module.exports = {
    database: {
        url: "postgresql://postgres:postgres@localhost:5432/fint_db"
    },
    jwt: {
        secret: "dev_secret_key_123"
    },
    server: {
        port: 5000,
        nodeEnv: "development"
    }
}; 