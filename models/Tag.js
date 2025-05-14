const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Task = require('./Task');

const TaskTags = sequelize.define('TaskTags', {
    tagName: {
        type: DataTypes.STRING,
        enum: DataTypes.ENUM('Urgent', 'Bug', 'Feature'),
        allowNull: false,
        unique: true,
    },
    taskId: {
        type: DataTypes.INTEGER,
        references: {
            model: Task,
            key: 'id',
        },
    },
})

module.exports = TaskTags;