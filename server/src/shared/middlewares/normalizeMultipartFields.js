const ApiError = require("../utils/apiError");

// middleware to normalize multipart fields
function normalizeMultipartFields(req, res, next) {
  if (req.body.subjects && typeof req.body.subjects === "string") {
    try {
      req.body.subjects = JSON.parse(req.body.subjects);
    } catch (e) {
      return next(new ApiError("Invalid subjects format", 400));
    }
  }

  if (Array.isArray(req.body.subjects)) {
    req.body.subjects = [
      ...new Set(
        req.body.subjects
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0)
      ),
    ];
  }

  next();
}

module.exports = normalizeMultipartFields;
