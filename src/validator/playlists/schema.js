const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
});

module.exports = { PlaylistPayloadSchema };
