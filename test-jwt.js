const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'divine_cardinal_jwt_secret_2026_xyz';
const token = jwt.sign({ sub: 'some-uuid', email: 'test@example.com', role: 'ADMIN' }, secret);
console.log(token);
