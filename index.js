//===============================================// INDEX.js \\======================================================
//===========================================// MuVies MOVIE API \\==================================================
//===================================================================================================================

//-------------------------------------------------------------------------------------------------// IMPORTS Require
const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTION_URI);
const port = process.env.PORT || 8080;
const morgan = require('morgan');
const passport = require('passport');
const { check, validationResult } = require('express-validator');

// =================================================================================================>// MODELS Schema
const Models = require('./models.js');
const Movies = Models.Movie;
const users = Models.users;
const Directors = Models.Directors;
const genres = Models.genres;
const FavoriteMovies = Models.FavoriteMovies;
const actors = Models.actors;
//===================================================================================================//BODY Parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
require('./passport');
//-----------------------------------------------------------------------------------------------------// USE MORGAN (Not sure WHY?)
app.use(morgan('public'));

//-----------------------------------------------------------------------------------------------------// EXPRESS-IN PUBLIC FOLDER
app.use(express.static('public'));

app.use('/public', express.static('public'));

//--------------------------------------------------------------------------------------------------// GET ALL Movies
app.get('/Movies', passport.authenticate('jwt', { session: false }),(req, res) => {
  Movies.find()
    .then((Movies) => {
      res.status(201).json(Movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
})
//---------------------------------------------------------------------------------------------// GET Movie By Title
app.get('/Movies/:Title',passport.authenticate('jwt', { session: false }),(req, res) => {

    Movies.find({ Title: req.params.Title })
    .then((Movies) => {
      res.json(Movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  //--------------------------------------------------------------------------------------// GET Movie by Genre Name
  app.get('/Genre/:Name',passport.authenticate('jwt', { session: false }),(req, res) => {

    Movies.find({ Genre: req.params.Name })
    .then((Movies) => {
      res.json(Movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

app.get('/Genre/:Name',passport.authenticate('jwt', { session: false }),(req, res) => {

  Movies.find({ Genre: req.params.Name })
  .then((Movies) => {
    res.json(Movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

  
//------------------------------------------------------------------------------------// 

app.get('/Actors',passport.authenticate('jwt', { session: false }),(req, res) => {

  actors.find()
  .then((actors) => {
    res.json(actors);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


  app.get('/Actor/:Name',passport.authenticate('jwt', { session: false }),(req, res) => {

    actors.findOne({ 'actor.Name': req.params.Name })
    .then((actors) => {
      res.json(actors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });




  //------------------------------------------------------------------------------------// GET Movie by Director Name
  app.get('/Movies/Director/:Name',passport.authenticate('jwt', { session: false }),(req, res) => {

    Movies.findOne({ 'Director.Name': req.params.Name })
    .then((Movies) => {
      res.json(Movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

//----------------------------------------------------------------------------------------------// GET All Directors
app.get('/directors',passport.authenticate('jwt', { session: false }),(req, res) => {
  Directors.find()
    .then((Directors) => {
      res.status(201).json(Directors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
//-------------------------------------------------------------------------------------------------// GET Director
app.get('/directors/:Name',passport.authenticate('jwt', { session: false }), (req, res) => {
    Directors.findOne({ Name: req.params.Name })
    .then((Directors) => {
      res.json(Directors);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
//----------------------------------------------------------------------------------------------------// GET FAV MOVIE
app.get('/Favorites/:UserName',passport.authenticate('jwt', { session: false }), (req, res) => {
  users.find({UserName: req.params.UserName })
  .then((users) => {
    res.json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });

});

//---------------------------------------------------------------------------------------------// POST NEW FAV MOVIE
app.post('/Favorites/:UserName',passport.authenticate('jwt', { session: false }), (req, res) => {
  users.findOneAndUpdate({ UserName: req.params.UserName }, {
    $push: { FavoriteMovies: {
      ObjectId: req.body._id,
      Title: req.body.Title,
      Genre: req.body.Genre
    } }
                                                      
},
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//------------------------------------------------------------------------------------------// DELETE Favorite Movie

app.put('/Favorites/:UserName/delete/:_id', (req, res) => {
  users.update({
    UserName: req.params.UserName
    },
    {
      "$pull": { 
        "FavoriteMovies": { ObjectId: Number( req.params._id )}
    }
    
                       
},
    // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


//===================================================================================================// USER REGISTRY
//===================================================================================================//


//--------------------------------------------------------------------------------------------// GET Users By Username
app.get('/users/:UserName', passport.authenticate('jwt', { session: false }),(req, res) => {
  users.findOne({ UserName: req.params.UserName })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
//--------------------------------------------------------------------------------------------------// GET All Users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  users.find()
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
//------------------------------------------------------------------------------------------------// CREATE NEW USER
app.post('/Users/NewUser/:UserName', (req, res) => {
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }}


    let hashedPassword = users.hashPassword(req.body.Password);
  users.findOne({ UserName: req.body.UserName }) // Search to see if a user with the requested username already exists
    .then((user) => {
      if (user) {
      //If the user is found, send a response that it already exists
        return res.status(400).send(req.body.UserName + ' already exists');
      } else {
        users
        .create(
          { _id: req.body._id,
            UserName: req.body.UserName,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
            FavoriteMovies:[],
            ImagePath: req.body.ImagePath,
        })
        .then((user) => { res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
});
//--------------------------------------------------------------------------------Update UserInfo
app.put('/Users/Update/:UserName', (req, res) => {
    let hashedPassword = users.hashPassword(req.body.Password);
    users.update({
      UserName: req.params.UserName
      },
      {
        "$set": { 
          UserName: req.body.UserName,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
          ImagePath: req.body.ImagePath
      }                 
  })
        .then((user) => { res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
    })


//----------------------------------------------------------------------------------------------------// DELETE User
app.delete('/users/remove/:UserName', passport.authenticate('jwt', { session: false }),(req, res) => {
    users.deleteOne({ UserName: req.params.UserName })
      .then((users) => {
        if (!users) {
          res.status(400).send(req.params.UserName + ' was not found');
        } else {
          res.status(200).send(req.params.UserName + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

  //-------------------------------------------------------------------------------------------------// ERROR MESSAGE
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oh No!!! Something broke!');
  });
//-----------------------------------------------------------------------------------------------------// PORT CALL

app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
