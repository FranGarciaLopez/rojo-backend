const users = [
    {
        email: "TBD@email.com",
        password : "guest1",
        photo : "TBD",
        city : "xxx",
        preferences : "xxx",
        dateOfBirth : "01/01/1900",
        isAdministrator : false,
        organizedEvents : "TBD",
        joinedEvents : "TBD",
        modifiedAt: "TBD",
        createdAt: "TBD",
        deletedAt: "TBD",
    },
    {
        email: "admin@email.com",
        password : "admin",
        photo : "TBD",
        city : "xxx",
        preferences : "xxx",
        dateOfBirth : "01/01/1900",
        isAdministrator : true,
        organizedEvents : "TBD",
        joinedEvents : "TBD",
        modifiedAt: "TBD",
        createdAt: "TBD",
        deletedAt: "TBD",
    },
  ];

  /* From entities declaration (https://github.com/FSDSTR0624/rojo-frontend/blob/main/README.md)
Attributes of User Entity:
email
password
photo (mandatory)
city (geographic area)
preferences (category preferences)
dateOfBirth
isAdministrator (boolean flag)
organizedEvents (List of events the user has organized)
joinedEvents (List of events the user has joined)
modifiedAt
createdAt
deletedAt
  */
  
  module.exports = users;