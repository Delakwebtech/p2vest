const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const slugify = require("slugify");

const Task = sequelize.define("Task", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'Please add a title'
            }
        }
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Please add description'
            }
        }
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("To-Do", "In Progress", "Completed"),
        defaultValue: "To-Do",
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    assignToId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
});

// Hook to create slug from the title
Task.beforeCreate((task, options) => {
    task.slug = slugify(task.title, { lower: true });
});

// Hook to create slug from the title before update
Task.beforeUpdate((task, options) => {
    task.slug = slugify(task.title, { lower: true });
});

module.exports = Task;
