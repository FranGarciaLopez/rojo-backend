let users = [
          {
                    id: 1,
                    firstname: "Juan",
                    lastname: "Pérez",
                    email: "juan.perez@gmail.com",
                    password: "password123",
                    profilePhoto: "picture",
                    city: "Buenos Aires",
                    dateOfBirth: "1990-01-01",
                    isAdmin: false,
                    organizedEvents: 1,
                    joinedEvents: 2,
                    modifiedAt: "2021-10-01",
                    createdAt: "2021-10-01",
                    deletedAt: null,
          },
          {
                    id: 2,
                    firstname: "Ana",
                    lastname: "Gómez",
                    email: "ana.gomez@gmail.com",
                    password: "password123",
                    profilePhoto: "picture",
                    city: "Buenos Aires",
                    dateOfBirth: "1990-01-01",
                    isAdmin: false,
                    organizedEvents: 1,
                    joinedEvents: 2,
                    modifiedAt: "2021-10-01",
                    createdAt: "2021-10-01",
                    deletedAt: null,
          },
]

const usersController = {

          userRegister: (req, res) => {
                    const { firstname, lastname, email, password, city, dateOfBirth } = req.body;

                    const userExists = users.find((user) => user.email === email);
                    if (userExists) {
                              return res.status(409).json({ message: 'User already exists' });
                    }

                    const newUser = {
                              id: users.length + 1,
                              firstname,
                              lastname,
                              email,
                              password,
                              city,
                              dateOfBirth,
                              isAdmin: false,
                              organizedEvents: 0,
                              joinedEvents: 0,
                              modifiedAt: new Date().toISOString(),
                              createdAt: new Date().toISOString(),
                              deletedAt: null,
                    };

                    users.push(newUser);
                    res.status(201).json({
                              status: 'success',
                              message: 'User created successfully' 
                    });


          },

          userLogin: (req, res) => {
                    const { email, password } = req.body;
                    const user = users.find((user) => user.email === email && user.password === password);
                    if (user) {
                              res.status(200).json({ message: 'User logged in successfully' });
                    } else {
                              res.status(401).json({ message: 'Invalid credentials, try again' });
                    }
          }
}

module.exports = usersController;