//BUILDING QUERY
1// FILTERRING 
const queryObj = { ...req.query };
const excludedFields = ["page", "sort", "limit", "fields"];
excludedFields.forEach(el => delete queryObj[el]);
// console.log(queryObj);

//2 ADVANDECED QUERY
let querstr = JSON.stringify(queryObj);
querstr = querstr.replace(/\b(gte|gt|lte|lt)\b/g, match =>
    `$${match}`
);
// console.log(JSON.parse(querstr));
// console.log(req.requestTime);

let query = Tour.find(JSON.parse(querstr))

// 3 sorting
if (req.query.sort) {
    const sortBY = req.query.sort.split(',').join(' ');
    // console.log(sortBY)
    query = query.sort(sortBY);
    //sort("price ratingAverage")
}
else {
    //default sorting based in time at which there are created 
    query = query.sort(`-createdAt`)
}

// 4 field limiting
if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);

} else {
    query = query.select('-__v');
}

//5 Pagination
const page = req.query.page * 1 || 1;
const limit = req.query.limit * 1 || 100;
const skip = (page - 1) * limit;

query = query.skip(skip).limit(limit);

if (req.query.page) {
    const numTours = await Tour.countDocuments();
    if (skip >= numTours) throw err = "this page doesnt exits";
}
// EXECUTE QUERY
// posibbly  "query" look like query.sort().select().skip().limit()....