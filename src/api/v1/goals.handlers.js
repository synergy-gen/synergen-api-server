const self = (module.exports = {
    getPublicGoals: async (req, res) => {
        // Build the query
        let q = {};
        if(req.query.creator) q.creator = req.query.creator;
        if(req.query.search) {
            // TODO: break up, remove stop words. Model should search for matching tags, description matches
        }

        // Get the search results
        // TODO: enable pagination

    },

    getPublicGoal: async (req, res) => {},

    addPublicGoal: async (req, res) => {
        try {

        } catch(err) {
            
        }
    },

    updatePublicGoal: async (req, res) => {},

    deletePublicGoal: async (req, res) => {}
});
