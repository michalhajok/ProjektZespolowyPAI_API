export const ok = (res, data, message = "OK") =>
  res.status(200).json({ status: "success", message, data });

export const created = (res, data, message = "Created") =>
  res.status(201).json({ status: "success", message, data });

export const noContent = (res) => res.status(204).send();

export const fail = (res, code, message, error = null) =>
  res.status(code).json({ status: "error", message, error });
