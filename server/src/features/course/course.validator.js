const Joi = require("joi");

module.exports = {
  listCoursesQuery: Joi.object({
    level: Joi.string().valid("100", "200", "300", "400").optional(),
    semester: Joi.string().valid("first", "second").optional(),
    search: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),

  courseIdParam: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};
