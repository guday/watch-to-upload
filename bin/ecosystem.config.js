let getScriptName = () => {
    return __dirname + "/www.js"
}

module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [

        // First application
        {
            name: 'watchUpload',
            script: getScriptName(),
            env: {
                PORT: 8084
            }
        }
    ]
};
