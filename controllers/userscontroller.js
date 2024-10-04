async function userRegister() {
    const newUser = new User({
      firstname: "Ana",
      lastname: "Garcia",
      email: "anagarcia@gmail.com",
      password: "123456",
      city: "Madrid", 
      dateOfBirth: new Date("1990-05-15"),
      isAdministrator: true
    });
  
    try {
      const savedUser = await newUser.save(); 
      console.log("Usuario creado:", savedUser);
    } catch (error) {
      console.error("Error creando usuario:", error);
    }
  }
  
  createUser();


  