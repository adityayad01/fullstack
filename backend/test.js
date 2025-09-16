const bcrypt = require("bcryptjs");

const plainPassword = "admin123";
const hash = "$2a$10$N.ju9xPThluMvqa/JaS4YuFDvkW2MtSbTPgngRLwCVTdHcIcJ1tg6"; // from test.js output

async function check() {
  const isMatch = await bcrypt.compare(plainPassword, hash);
  console.log("Password match:", isMatch);
}

check();
