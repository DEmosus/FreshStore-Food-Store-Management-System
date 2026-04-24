const { validationResult } = require("express-validator");
const Entry = require("../models/Entry");

// Create entry @route   POST /api/entries
const createEntry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const entry = await Entry.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get entries with optional filters @route   GET /api/entries
const getEntries = async (req, res) => {
  try {
    const {
      type,
      itemName,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;
    const query = { createdBy: req.user._id };

    if (type) query.type = type;
    if (itemName) query.itemName = new RegExp(itemName, "i");
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [entries, total] = await Promise.all([
      Entry.find(query).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Entry.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: entries.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: entries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single entry @route   GET /api/entries/:id
const getEntry = async (req, res) => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!entry)
      return res
        .status(404)
        .json({ success: false, message: "Entry not found" });
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update entry @route   PUT /api/entries/:id
const updateEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!entry)
      return res
        .status(404)
        .json({ success: false, message: "Entry not found" });
    // Recalculate totalValue
    entry.totalValue = entry.quantity * entry.pricePerUnit;
    await entry.save();
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete entry @route   DELETE /api/entries/:id
const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!entry)
      return res
        .status(404)
        .json({ success: false, message: "Entry not found" });
    res.json({ success: true, message: "Entry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard summary stats @route   GET /api/entries/stats/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Today boundaries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [aggregateAll, aggregateToday, recentEntries] = await Promise.all([
      Entry.aggregate([
        { $match: { createdBy: userId } },
        {
          $group: {
            _id: "$type",
            totalQty: { $sum: "$quantity" },
            totalValue: { $sum: "$totalValue" },
            count: { $sum: 1 },
          },
        },
      ]),
      Entry.aggregate([
        {
          $match: {
            createdBy: userId,
            date: { $gte: todayStart, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: "$type",
            totalQty: { $sum: "$quantity" },
            totalValue: { $sum: "$totalValue" },
          },
        },
      ]),
      Entry.find({ createdBy: userId }).sort({ date: -1 }).limit(10),
    ]);

    // Inventory per item: stock in - sales out
    const inventoryAgg = await Entry.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: "$itemName",
          stockQty: {
            $sum: { $cond: [{ $eq: ["$type", "stock"] }, "$quantity", 0] },
          },
          soldQty: {
            $sum: { $cond: [{ $eq: ["$type", "sale"] }, "$quantity", 0] },
          },
        },
      },
      {
        $addFields: {
          currentStock: { $subtract: ["$stockQty", "$soldQty"] },
        },
      },
    ]);

    const LOW_STOCK_THRESHOLD = 10;
    const lowStockItems = inventoryAgg.filter(
      (i) => i.currentStock < LOW_STOCK_THRESHOLD && i.currentStock >= 0,
    );

    const statsMap = (arr) =>
      arr.reduce((acc, cur) => {
        acc[cur._id] = cur;
        return acc;
      }, {});

    const allStats = statsMap(aggregateAll);
    const todayStats = statsMap(aggregateToday);

    res.json({
      success: true,
      data: {
        allTime: {
          totalStockValue: allStats.stock?.totalValue || 0,
          totalSalesValue: allStats.sale?.totalValue || 0,
          totalStockQty: allStats.stock?.totalQty || 0,
          totalSalesQty: allStats.sale?.totalQty || 0,
          stockEntries: allStats.stock?.count || 0,
          saleEntries: allStats.sale?.count || 0,
        },
        today: {
          stockValue: todayStats.stock?.totalValue || 0,
          salesValue: todayStats.sale?.totalValue || 0,
          stockQty: todayStats.stock?.totalQty || 0,
          salesQty: todayStats.sale?.totalQty || 0,
        },
        inventory: inventoryAgg,
        lowStockItems,
        recentEntries,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get report summary (grouped by item) @route   GET /api/entries/stats/report
const getReportStats = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const match = { createdBy: req.user._id };

    if (type) match.type = type;
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    }

    const summary = await Entry.aggregate([
      { $match: match },
      {
        $group: {
          _id: { item: "$itemName", type: "$type" },
          totalQty: { $sum: "$quantity" },
          totalValue: { $sum: "$totalValue" },
          avgPrice: { $avg: "$pricePerUnit" },
          entryCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.item": 1 } },
    ]);

    const totals = await Entry.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          totalQty: { $sum: "$quantity" },
          totalValue: { $sum: "$totalValue" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, data: { summary, totals } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  getDashboardStats,
  getReportStats,
};
