var path = require('path');
var config = require('../../config.json');
var templatesDir = path.resolve(__dirname, '../email-templates');
var emailTemplates = require('email-templates');
var nodeMailer = require('nodemailer');
var transport = nodeMailer.createTransport("SMTP", {
    service: config.mail_server,
    auth: {
        user: config.mail_user,
        pass: config.mail_password
    }
});

exports.sendEmail = function(templateName, locals, callback) {
    emailTemplates(templatesDir, function(err, template) {
        if (err) {
            callback(err);
        } else {
            template(templateName, locals, function(err, html, text) {
                if (err) {
                    callback(err);
                } else {
                    transport.sendMail({
                        from: 'Code-Snippets <' + config.mail_user + '>',
                        to: locals.receivers,
                        subject: locals.subject,
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) {
                            callback(err);
                        } else {
                            console.log(responseStatus.message);
                            callback();
                        }
                    });
                }
            });
        }
    });
}