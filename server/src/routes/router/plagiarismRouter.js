const express = require("express");
const { appWrapper } = require("../../utils/routeWrapper");
const { ACCESS_ROLES } = require("../../businessLogic/accessmanagement/roleConstants");

const router = express.Router();

/**
 * POST /check
 * Basic conceptual endpoint to analyze a GitHub repository for plagiarism
 * Body: { repoUrl }
 */
router.post(
  "/check",
  appWrapper(
    async (req, res) => {
      const { repoUrl } = req.body;

      if (!repoUrl) {
        return res.status(400).json({
          success: false,
          message: "Repository URL is required"
        });
      }

      // Simulate an analysis delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mocked plagiarism analysis result
      const mockResult = {
        authenticityScore: Math.floor(Math.random() * 20) + 80, // Random score between 80-100%
        status: "Clean",
        details: `The repository ${repoUrl} was analyzed successfully. No significant traces of copied boilerplate code were found across major codebases. The repository structure appears moderately unique.`
      };

      return res.json({
        success: true,
        data: mockResult,
        message: "Plagiarism analysis completed"
      });
    },
    [ACCESS_ROLES.ALL]
  )
);

module.exports = router;
const plagiarismQueue = require("../../queues/plagiarismQueue");
const { Queue } = require("bullmq");
const connection = require("../../config/redis");

const queue = new Queue("plagiarism-check", { connection });


/**
 * GET /plagiarism/job/:id
 * Poll status of a plagiarism check job.
 */
router.get("/job/:id", async (req, res) => {
  try {
    const job = await queue.getJob(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const state = await job.getState();

    res.json({
      jobId: job.id,
      status: state,
      result: job.returnvalue || null,
      failedReason: job.failedReason || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /plagiarism/check
 * Start a plagiarism scan.
 *
 * Body:
 *   { repoUrl: string, compareUrls?: string[] }
 *
 * compareUrls — optional array of other hackathon repos to compare directly.
 */
router.post("/check", async (req, res) => {
  const { repoUrl, compareUrls = [] } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl is required" });
  }

  const job = await plagiarismQueue.add("scanRepo", {
    repoUrl,
    compareUrls
  });

  res.json({
    success: true,
    jobId: job.id,
    message: "Plagiarism scan started. Poll /plagiarism/job/:id for results."
  });
});

module.exports = router;
