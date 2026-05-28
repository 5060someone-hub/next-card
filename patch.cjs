const fs = require('fs');
let c = fs.readFileSync('server/index.js', 'utf8');

c = c.replace(
  `description: { type: String, default: '' },\r\n    price: {`,
  `description: { type: String, default: '' },\r\n    sampleUrl: { type: String, default: '' },\r\n    price: {`
);

c = c.replace(
  `const { name, description, price, features } = req.body;\r\n  const product = await Product.create({ \r\n    id: 'prod_' + Date.now(), \r\n    name, \r\n    description,\r\n    price:`,
  `const { name, description, price, features, sampleUrl } = req.body;\r\n  const product = await Product.create({ \r\n    id: 'prod_' + Date.now(), \r\n    name, \r\n    description,\r\n    sampleUrl: sampleUrl || '',\r\n    price:`
);

c = c.replace(
  `const { name, description, price, features } = req.body;\r\n    await Product.findOneAndUpdate({ id: req.params.id }, { \r\n      name, \r\n      description, \r\n      price: price || { annual: 0, threeMonths: 0, twoMonths: 0 }, \r\n      features \r\n    });`,
  `const { name, description, price, features, sampleUrl } = req.body;\r\n    await Product.findOneAndUpdate({ id: req.params.id }, { \r\n      name, \r\n      description, \r\n      sampleUrl: sampleUrl || '',\r\n      price: price || { annual: 0, threeMonths: 0, twoMonths: 0 }, \r\n      features \r\n    });`
);

fs.writeFileSync('server/index.js', c, 'utf8');
console.log('patched');
