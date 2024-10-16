class BasePostController {
    constructor() {
        this.required_fields = [];
        this.optional_fields = [];
    }

    async do(req, res) {
        try {
            this.req = req;
            this.res = res;
            const missing_fields = this.required_fields.filter(field => !req.body[field]);
            if(missing_fields.length > 0) {
                return res.status(400).send({message: `Missing fields: ${missing_fields.join(", ")}`});
            }

            let verified_fields = {};
            this.required_fields.forEach(field => {
                verified_fields[field] = req.body[field];
            });
            this.optional_fields.forEach(field => {
                verified_fields[field] = req.body[field];
            });
            const response = await this.post(verified_fields);
            let http_code = 200;
            if(response?.error) {
                if(response.error?.http_code) {
                    http_code = response?.error?.http_code;
                }

                return res.status(http_code).send(response.data);
            }

            if(response?.http_code) {
                http_code = response?.http_code;
            }

            return res.status(http_code).send(response);
        } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            console.log(e);
            return res.status(500).send({message: "Something went wrong, please try again later"});
        }
    }

    async post(verified_fields) {
        throw new Error("Method not implemented");
    }
}

module.exports = {
    BasePostController
}