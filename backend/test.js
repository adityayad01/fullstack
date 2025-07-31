const bcrypt = require('bcrypt');

const hash = '$2a$10$YUf.weu9fBhUwkd1idFGROrIYIraFOjT7EmW7ZdM5a4e88pfsoYhm';
const password = 'yourGuessHere';

bcrypt.compare(password, hash, (err, result) => {
  if (result) {
    console.log('Password matches!');
  } else {
    console.log('Incorrect password');
  }
});

