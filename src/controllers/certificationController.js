const Certification = require('../models/Certification');
const makeCrudController = require('./crudFactory');

module.exports = makeCrudController(Certification, { mediaField: 'image' });
