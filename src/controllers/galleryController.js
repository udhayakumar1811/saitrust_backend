const GalleryImage = require('../models/GalleryImage');
const makeCrudController = require('./crudFactory');

module.exports = makeCrudController(GalleryImage, { mediaField: 'image' });
