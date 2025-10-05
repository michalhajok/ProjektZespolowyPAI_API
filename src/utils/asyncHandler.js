// Express 4: wrap async to pass errors to next(); w Express 5 można pominąć, ale wrapper jest bezpieczny.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
