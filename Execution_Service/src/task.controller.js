"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const llmService = require("./llm.service");
const dalService = require("./dal.service");

const router = Router()

router.post("/execute", async (req, res) => {
    try {
        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        const query = req.body.query;
        if (!query) {
            throw new Error("Query is required");
        }
        
        const result = await llmService.getLLMResponse(query); // provide query to api
        const cid = await dalService.publishJSONToIpfs(result);
        const data = llmService.truncateText(result.choice, 2000); // Truncate response for data field

        await dalService.sendTask(cid, data, taskDefinitionId);
        return res.status(200).send(new CustomResponse({proofOfTask: cid, data: data, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})


module.exports = router
