const keytar = require("keytar");

const main = async () => {
  // save test key
  await keytar.setPassword("kyve", "my_key", "my_secret");

  // load key
  const secret = await keytar.getPassword("kyve", "my_key");
  console.log(secret);
};

main();
