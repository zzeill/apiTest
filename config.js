var settings = {
    "mainTitle" : "PókeRick", //WEBSITE TITLE
    "urls" : {
        http : "http://localhost:3000",
        root : "/",
    },
    "paths" : {
        rootUsers : "/users",
        login : "/login",
        register : "/register",
        //dashboard : "/dashboard",
        logout : "/logout",
        profile : "/profile",
        delete : "/delete",
        list : "/list",
        favorites : "/favorites"
    },
    "api" : {
        api : "http://localhost:3000/api",
        root : "/api",
        rickApi : "https://rickandmortyapi.com/api",
        pokeApi : "https://pokeapi.co/api/v2",

        "endpoints" : {
            user : {
                root : "/user",
                register : "/register/",
                login : "/login/",
                view : "/view/",
                update : "/update/",
                pic : "/profilePhoto/",
                favorites : "/favorites/"
            },
    
            rick : {
                //EXTERNAL API
                character : "/character/",
            },
    
            poke : {
                //EXTERNAL API
                pokemon : "/pokemon/",
            }
    
        }
    }
    
};

module.exports = settings