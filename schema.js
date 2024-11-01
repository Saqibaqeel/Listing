const Joi = require('joi');

// Define listing schema
const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().allow("", null),
        price: Joi.number().required(),
        location: Joi.string().required(),
        country: Joi.string().required()
    }).required()
});

// Define review schema
const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required(),
        createdAt: Joi.date().default(Date.now)
    }).required()
});

// Export both schemas
module.exports = { listingSchema, reviewSchema };
