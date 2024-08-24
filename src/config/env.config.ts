
export const EnvConfiguration = () => ({
    environment: process.env.NODE_ENV || 'dev',
    //posgresdb: process.env.POSTGRESDB,
    port: process.env.PORT || 3001,
    //defaultLimit: +process.env.DEFAULT_LIMIT || 7,
});