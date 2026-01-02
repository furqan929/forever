let express = require("express");
let { updateName  } = require("../controller/EditProdile.js");
let { protect } = require("../middleware/protect.js");
const router = express.Router();

router.put("/update-name", protect, updateName);

module.exports = router;
