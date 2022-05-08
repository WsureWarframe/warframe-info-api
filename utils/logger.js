const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const path = require('path')

const projectPath = path.join(__dirname, '../')
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `[${timestamp}]--[${level}]--[${label.replace(projectPath,'')}]: ${message}`;
});

const logger = (file) => createLogger({
    format: format.combine(
        label({ label: file }),
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({level: 'error', filename: 'logs/warframe-info-api.log'})
    ],
});

module.exports = logger
