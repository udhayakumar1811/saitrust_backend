const HeroImage = require('../models/HeroImage');
const makeCrudController = require('./crudFactory');

module.exports = makeCrudController(HeroImage, { mediaField: 'imageUrl' });
