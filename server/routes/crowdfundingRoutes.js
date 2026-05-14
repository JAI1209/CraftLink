const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createProject,
  decideContributor,
  getProjectById,
  getProjects,
  requestParticipation,
} = require("../controllers/crowdfundingController");

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getProjects)
  .post(createProject);

router.get("/:id", getProjectById);
router.post("/:id/participation", requestParticipation);
router.put("/:id/contributors/:contributorId/:action", decideContributor);

module.exports = router;
