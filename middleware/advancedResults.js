const advancedResults = (model, include) => async (req, res, next) => {
    let query;
  
    // Copy req.query
    const reqQuery = { ...req.query };
  
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
  
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
  
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
  
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
    // Finding resource
    query = model.findAll(JSON.parse(queryStr));
  
    // Select Fields
    if (req.query.select) {
      const attributes = req.query.select.split(',').join(' ');
      query = model.findAll({
        attributes,
      });
    }
  
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = model.findAll({
        order: [[sortBy]],
      });
    } else {
      query = model.findAll({
        order: [['createdAt', 'DESC']],
      });
    }
  
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.count();
  
    query = model.findAll({
      offset: startIndex,
      limit,
    });
  
    // Executing query
    const results = await query;
  
    // Pagination result
    const pagination = {};
  
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
  
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
  
    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    };
  
    next();
  };
  
module.exports = advancedResults;
  