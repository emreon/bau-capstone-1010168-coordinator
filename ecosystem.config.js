// PM2 Ecosystem file docs
// http://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
    apps: [
        // Coordinator
        {
            name: 'coordinator',
            script: 'src/main.js',
            exec_mode: 'fork',
            instances: 1,
            autorestart: true,
            watch: false,
            max_restarts: 3,
            log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
            // error_file: 'logs/errors.log',
            // out_file: 'logs/out.log',
            // pid_file: 'logs/app.pid',
            env_development: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};
