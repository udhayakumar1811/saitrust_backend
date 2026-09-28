// Applied to every schema so JSON responses use a plain "id" string (what
// every existing frontend page already expects — e.g. `course.id`,
// `student.id`) instead of Mongoose's "_id"/"__v", without touching any
// page component.
module.exports = function toJSONPlugin(schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret._id;
      return ret;
    },
  });
  schema.set('toObject', { virtuals: true });
};
