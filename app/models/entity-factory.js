var Sequelize = require("sequelize");
var path = require('path');
var config = require('../../config.json')
var sequelize;
var nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
    sequelize = new Sequelize(config.database, config.db_user, config.db_pwd, {
        host: 'localhost',
        port: 3306,
        logging: false,
        define: {
            freezeTableName: true,
            underscored: true,
            timestamps: false
        }
    });
} else {
    sequelize = new Sequelize(null, null, null, {
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../data/my_runnable.db'),
        logging: false,
        define: {
            freezeTableName: true,
            underscored: true,
            timestaps: false,
            charset: 'utf8'
        }
    });
}

var User = sequelize.define('Users', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
    },
    name: {
        allowNull: false,
        type: Sequelize.STRING
    },
    password: {
        allowNull: false,
        type: Sequelize.STRING
    }
}, {
    timestamps: false
});

var CodeSnippet = sequelize.define('CodeSnippets', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    snippet: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
});

User.hasMany(CodeSnippet, {
    foreignKey: 'owner_id'
});

CodeSnippet.belongsTo(User, {
    as: 'owner',
    foreignKey: 'owner_id'
});

sequelize.sync({
    force: false
}).success(function() {
    User.count().success(function(total) {
        if (total < 1) {
            var initUser = require('../init/init-user');
        }
    });
}).error(function(err) {
    console.log(err);
});

module.exports = {
    User: User,
    CodeSnippet: CodeSnippet
};