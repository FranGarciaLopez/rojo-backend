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
    getUser: (req, res) => {
        //TO update, get the datas from the mongoDB!
        const user = users.find((userDB) => userDB.id === req.user.id);
        res.status(200).send(user);
      // FROM CHATGPT --- to adjust         ------------------------
      /*  try {
            const { username } = req.params; // Get the username from the route parameter
            // Find the user by username in MongoDB
            const user = await User.findOne({ username: username });
        
            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }
        
            res.status(200).json(user);
          } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
          }
        */
       // -------------------------------------------------------------
    },

    userLogin: (req, res) => {
     const { username, password } = req.body;
        const user = users.find((userDB) => userDB.username === username);
        
        if (user && user.password === password) {
          const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.SECRET
          );
          return res.status(201).send({ token });
        }
        return res.status(401).send("Username or password is not correct");
    }
}



module.exports = usersController;