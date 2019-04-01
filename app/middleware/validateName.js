const validateName = (req, res, next) => {
    const { name } = req.body;
    const regex = /^[A-Za-z]{1,100}$/;
    if (!regex.test(name)) {
      res.status(400).json({ error: "Name must be letters only and less than 100 characters" });
    };
    next();
  };

  module.exports = validateName;