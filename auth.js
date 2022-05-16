var bcrypt = require('bcryptjs');
 
module.exports = {
    
    makeCode: function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    },
 
    encryptPass: function (password) {

        return bcrypt.hashSync(password, 8);
        
    },

    checkPass: function (password, hash) {

        return bcrypt.compareSync(password, hash);

    },

    notEmpty: function (string) {
     
        if(string != "" && string != undefined) {
            string = string.trim();
            if(!!string) {
                return string;
            }
            return false;
        }
        else {
            return false;
        }
        
    },

    upper: function (string) {

        if(string != "" && string != undefined) {
            string = string.trim().toUpperCase();
            if(!!string) {
                return string;
            }
            return false;
        }
        else {
            return false;
        }

    },

    capitalize: function (string) {

        if(string != "" && string != undefined) {
            string = string.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
            if(!!string) {
                return string;
            }
            return false;
        }
        else {
            return false;
        }

    },

    
    
};

