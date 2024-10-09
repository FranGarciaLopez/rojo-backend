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
    getUser: async (req, res) => {
          try {
      // Fetch all users from the database and populate the 'city' and 'events' fields
      /*    populate('city').populate('events') is used to:
                - Populate referenced fields with their actual documents (instead of just ObjectId values).
                - Replace the city and events ObjectId fields in the User document with the corresponding full documents from the City and Event collections. 
                - When you query the User collection, Mongoose only returns the ObjectId stored in the city field 
                  (something like "61a5cfc1e7e78b71d234fa13").
                  .populate('city') tells Mongoose to replace that ObjectId with the actual City document from the City collection.*/

        /* on the top of the document, should we import the model ????? 
              with:
              const User = require('../models/User');  // Import the User model
        */
              const users = await User.find().populate('city').populate('events');
            /*  To search for only one user(defined by ID), we should use the following lines
                  const userId = req.params.id;
                  const user = await User.findById(userId).populate('city').populate('events'); // Find the user by ID and populate the 'city' and 'events' fields
            */
            console.log(users); // Print the found users to the console
            res.status(200).json(users);// Send the users as a JSON response
          } catch (err) {
            console.error('Error retrieving users:', err);
            // Send error response if something goes wrong
            res.status(500).json({ message: 'Server error while fetching users' });
          }
        }
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