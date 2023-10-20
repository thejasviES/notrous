class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        //BUILDING QUERY
        //1 FILTERRING 
        const queryObj = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach(el => delete queryObj[el]);
        // console.log(queryObj);

        //2 ADVANDECED QUERY
        let querstr = JSON.stringify(queryObj);
        //here basically making gte as $gte and so on..
        querstr = querstr.replace(/\b(gte|gt|lte|lt)\b/g, match =>
            `$${match}`
        );
        // console.log(JSON.parse(querstr));
        // console.log(req.requestTime);
        //let query = Tour.find(JSON.parse(querstr))
        this.query = this.query.find(JSON.parse(querstr));
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBY = this.queryString.sort.split(',').join(' ');
            // console.log(sortBY)
            this.query = this.query.sort(sortBY);
            //sort("price ratingAverage")
        }
        else {
            //default sorting based in time at which there are created 
            this.query = this.query.sort(`-createdAt`)
        }
        return this;
    }

    limitfield() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);

        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    pagination() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;